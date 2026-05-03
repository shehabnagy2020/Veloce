import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.models.listing import Listing
from app.schemas.messaging import ConversationCreate, ConversationResponse, MessageCreate, MessageResponse
from app.services.messaging_service import (
    create_conversation,
    get_conversations,
    get_conversation_messages,
    save_message,
    mark_messages_read,
)
from app.api.deps import get_current_user

router = APIRouter()


def _conversation_to_response(conv: Conversation, current_user_id: bytes) -> ConversationResponse:
    other_user = conv.seller if conv.buyer_id == current_user_id else conv.buyer
    last_msg = conv.messages[-1] if conv.messages else None
    unread_count = sum(1 for m in conv.messages if m.sender_id != current_user_id and m.read_at is None)

    listing_title = f"{conv.listing.make} {conv.listing.model} {conv.listing.year}" if hasattr(conv, 'listing') and conv.listing else None

    return ConversationResponse(
        id=uuid.UUID(bytes=conv.id).hex,
        listing_id=uuid.UUID(bytes=conv.listing_id).hex,
        buyer_id=uuid.UUID(bytes=conv.buyer_id).hex,
        seller_id=uuid.UUID(bytes=conv.seller_id).hex,
        listing_title=listing_title,
        other_user_name=other_user.display_name if other_user else None,
        last_message=last_msg.text_content if last_msg and last_msg.text_content else None,
        unread_count=unread_count,
        updated_at=conv.updated_at.isoformat() if conv.updated_at else "",
    )


def _message_to_response(msg) -> MessageResponse:
    return MessageResponse(
        id=uuid.UUID(bytes=msg.id).hex,
        conversation_id=uuid.UUID(bytes=msg.conversation_id).hex,
        sender_id=uuid.UUID(bytes=msg.sender_id).hex,
        content_type=msg.content_type.value,
        text_content=msg.text_content,
        file_url=msg.file_url,
        file_duration_sec=msg.file_duration_sec,
        read_at=msg.read_at.isoformat() if msg.read_at else None,
        created_at=msg.created_at.isoformat() if msg.created_at else "",
    )


@router.get("", response_model=list[ConversationResponse])
async def list_conversations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    uid = current_user.id
    conversations, total = await get_conversations(db, uuid.UUID(bytes=uid).hex, page, limit)

    # Eagerly load relationships for response building
    result = []
    for conv in conversations:
        stmt = (
            select(Conversation)
            .where(Conversation.id == conv.id)
            .options(
                selectinload(Conversation.buyer),
                selectinload(Conversation.seller),
                selectinload(Conversation.listing),
                selectinload(Conversation.messages),
            )
        )
        res = await db.execute(stmt)
        loaded_conv = res.scalar_one()
        result.append(_conversation_to_response(loaded_conv, uid))

    return result


@router.get("/{conversation_id}")
async def get_conversation_detail(
    conversation_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uid = current_user.id
    cid = uuid.UUID(conversation_id).bytes

    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    stmt = (
        select(Conversation)
        .where(Conversation.id == cid)
        .options(selectinload(Conversation.buyer), selectinload(Conversation.seller))
    )
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Verify user is a participant
    if conv.buyer_id != uid and conv.seller_id != uid:
        raise HTTPException(status_code=403, detail="Not a participant")

    # Mark messages as read
    await mark_messages_read(db, conversation_id, uuid.UUID(bytes=uid).hex)

    messages, total = await get_conversation_messages(db, conversation_id, page, limit)
    message_responses = [_message_to_response(m) for m in messages]

    return {
        "conversation": {
            "id": uuid.UUID(bytes=conv.id).hex,
            "listing_id": uuid.UUID(bytes=conv.listing_id).hex,
            "buyer_id": uuid.UUID(bytes=conv.buyer_id).hex,
            "seller_id": uuid.UUID(bytes=conv.seller_id).hex,
        },
        "messages": message_responses,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_new_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    buyer_id = uuid.UUID(bytes=current_user.id).hex

    # Verify listing exists and is published
    from sqlalchemy import select
    lid = uuid.UUID(data.listing_id).bytes
    stmt = select(Listing).where(Listing.id == lid)
    res = await db.execute(stmt)
    listing = res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Can't start a conversation on your own listing
    if listing.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot start conversation on your own listing")

    try:
        conv = await create_conversation(db, buyer_id, data.listing_id, data.message)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    existing = uuid.UUID(bytes=conv.id).hex == uuid.UUID(bytes=conv.id).hex  # always true, but check if returned existing
    conv_id = uuid.UUID(bytes=conv.id).hex

    return {
        "id": conv_id,
        "listing_id": uuid.UUID(bytes=conv.listing_id).hex,
        "buyer_id": uuid.UUID(bytes=conv.buyer_id).hex,
        "seller_id": uuid.UUID(bytes=conv.seller_id).hex,
    }


@router.post("/{conversation_id}/messages", status_code=status.HTTP_201_CREATED)
async def send_message(
    conversation_id: str,
    content_type: str = Form("text"),
    text_content: str | None = Form(None),
    file: UploadFile | None = File(None),
    duration_sec: int | None = Form(None),
    waveform: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uid = uuid.UUID(bytes=current_user.id).hex
    cid_bytes = uuid.UUID(conversation_id).bytes

    # Verify conversation exists and user is participant
    from sqlalchemy import select
    stmt = select(Conversation).where(Conversation.id == cid_bytes)
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.buyer_id != current_user.id and conv.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not a participant")

    file_data = None
    file_subdir = None
    file_duration = duration_sec
    file_waveform = None

    if file:
        file_data = await file.read()
        if len(file_data) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large")
        if content_type == "image":
            file_subdir = "photos"
        elif content_type == "voice_note":
            file_subdir = "voice_notes"
        else:
            file_subdir = "photos"

    if waveform:
        import json
        try:
            file_waveform = json.loads(waveform)
        except json.JSONDecodeError:
            file_waveform = None

    msg = await save_message(
        db, conversation_id, uid, content_type,
        text_content=text_content,
        file_data=file_data, file_subdir=file_subdir,
        file_duration_sec=file_duration, file_waveform=file_waveform,
    )

    return _message_to_response(msg)