import uuid
from datetime import datetime, timezone

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.models.message import Message, ContentType
from app.models.listing import Listing
from app.services.storage_service import save_file


async def create_conversation(db: AsyncSession, buyer_id: str, listing_id: str, initial_message: str) -> Conversation:
    """Create a conversation between buyer and seller about a listing."""
    bid = uuid.UUID(buyer_id).bytes
    lid = uuid.UUID(listing_id).bytes

    # Check for existing conversation
    stmt = select(Conversation).where(Conversation.buyer_id == bid, Conversation.listing_id == lid)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    # Get listing to find seller
    listing_stmt = select(Listing).where(Listing.id == lid)
    listing_result = await db.execute(listing_stmt)
    listing = listing_result.scalar_one_or_none()
    if not listing:
        raise ValueError("Listing not found")

    conversation = Conversation(
        id=uuid.uuid4().bytes,
        buyer_id=bid,
        seller_id=listing.seller_id,
        listing_id=lid,
    )
    db.add(conversation)
    await db.flush()

    # Add initial message
    message = Message(
        id=uuid.uuid4().bytes,
        conversation_id=conversation.id,
        sender_id=bid,
        content_type=ContentType.text,
        text_content=initial_message,
    )
    db.add(message)
    await db.flush()
    await db.refresh(conversation)
    return conversation


async def get_conversations(db: AsyncSession, user_id: str, page: int = 1, limit: int = 20) -> tuple[list, int]:
    """Get all conversations for a user."""
    uid = uuid.UUID(user_id).bytes

    count_stmt = select(func.count()).select_from(Conversation).where(
        (Conversation.buyer_id == uid) | (Conversation.seller_id == uid)
    )
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = (
        select(Conversation)
        .where((Conversation.buyer_id == uid) | (Conversation.seller_id == uid))
        .order_by(Conversation.updated_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(stmt)
    conversations = result.scalars().all()
    return conversations, total


async def get_conversation_messages(
    db: AsyncSession, conversation_id: str, page: int = 1, limit: int = 50
) -> tuple[list, int]:
    """Get messages for a conversation."""
    cid = uuid.UUID(conversation_id).bytes

    count_stmt = select(func.count()).select_from(Message).where(Message.conversation_id == cid)
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = (
        select(Message)
        .where(Message.conversation_id == cid)
        .order_by(Message.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(stmt)
    messages = result.scalars().all()
    return list(messages), total


async def save_message(
    db: AsyncSession, conversation_id: str, sender_id: str,
    content_type: str, text_content: str | None = None,
    file_data: bytes | None = None, file_subdir: str | None = None,
    file_duration_sec: int | None = None, file_waveform: dict | None = None,
) -> Message:
    """Save a message to a conversation."""
    file_url = None
    if file_data and file_subdir:
        filename = f"{uuid.uuid4().hex}.bin"
        file_url = await save_file(file_data, file_subdir, filename)

    message = Message(
        id=uuid.uuid4().bytes,
        conversation_id=uuid.UUID(conversation_id).bytes,
        sender_id=uuid.UUID(sender_id).bytes,
        content_type=ContentType(content_type),
        text_content=text_content,
        file_url=file_url,
        file_duration_sec=file_duration_sec,
        file_waveform=file_waveform,
    )
    db.add(message)
    await db.flush()
    return message


async def mark_messages_read(db: AsyncSession, conversation_id: str, user_id: str) -> int:
    """Mark all unread messages in a conversation as read for the given user. Returns count marked."""
    cid = uuid.UUID(conversation_id).bytes
    uid = uuid.UUID(user_id).bytes

    stmt = (
        select(Message)
        .where(
            Message.conversation_id == cid,
            Message.sender_id != uid,
            Message.read_at.is_(None),
        )
    )
    result = await db.execute(stmt)
    unread = result.scalars().all()
    now = datetime.now(timezone.utc)
    for msg in unread:
        msg.read_at = now
    await db.flush()
    return len(unread)