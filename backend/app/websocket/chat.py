import uuid

import socketio

from app.services.auth_service import decode_access_token
from app.services.messaging_service import save_message, mark_messages_read
from app.database import async_session

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=["http://localhost:5173", "http://localhost:3000"])

# Track which users are in which conversations
# conversation_id -> set of user_id strings
_rooms: dict[str, set[str]] = {}


def _get_user_id(token: str) -> str | None:
    payload = decode_access_token(token)
    if not payload:
        return None
    return payload.get("sub")


@sio.event
async def connect(sid, environ):
    token = environ.get("HTTP_AUTHORIZATION", "").removeprefix("Bearer ").strip()
    if not token:
        token = environ.get("QUERY_STRING", "")
        for param in token.split("&"):
            if param.startswith("token="):
                token = param.split("=", 1)[1]
                break

    user_id = _get_user_id(token)
    if not user_id:
        await sio.disconnect(sid)
        return

    await sio.save_session(sid, {"user_id": user_id})


@sio.event
async def disconnect(sid):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    if user_id:
        for conv_id, members in list(_rooms.items()):
            if user_id in members:
                members.discard(user_id)
                await sio.leave_room(sid, conv_id)


@sio.event
async def join_conversation(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    if not user_id:
        return

    conversation_id = data.get("conversation_id")
    if not conversation_id:
        return

    await sio.enter_room(sid, conversation_id)
    _rooms.setdefault(conversation_id, set()).add(user_id)

    # Mark messages as read when joining
    async with async_session() as db:
        await mark_messages_read(db, conversation_id, user_id)
        await db.commit()

    await sio.emit("message_read", {"conversation_id": conversation_id}, room=conversation_id)


@sio.event
async def leave_conversation(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")

    conversation_id = data.get("conversation_id")
    if not conversation_id:
        return

    await sio.leave_room(sid, conversation_id)
    if conversation_id in _rooms and user_id:
        _rooms[conversation_id].discard(user_id)


@sio.event
async def send_message(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    if not user_id:
        return

    conversation_id = data.get("conversation_id")
    content_type = data.get("content_type", "text")
    text_content = data.get("text_content")

    if not conversation_id:
        return

    async with async_session() as db:
        msg = await save_message(
            db, conversation_id, user_id, content_type, text_content=text_content
        )
        await db.commit()

    message_data = {
        "id": uuid.UUID(bytes=msg.id).hex,
        "conversation_id": conversation_id,
        "sender_id": user_id,
        "content_type": msg.content_type.value,
        "text_content": msg.text_content,
        "file_url": msg.file_url,
        "file_duration_sec": msg.file_duration_sec,
        "created_at": msg.created_at.isoformat() if msg.created_at else "",
    }

    await sio.emit("new_message", message_data, room=conversation_id)

    # Notify conversation list update
    await sio.emit("conversation_updated", {
        "conversation_id": conversation_id,
        "last_message": text_content or f"[{content_type}]",
    }, room=conversation_id)


@sio.event
async def typing(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    if not user_id:
        return

    conversation_id = data.get("conversation_id")
    if not conversation_id:
        return

    await sio.emit("user_typing", {
        "conversation_id": conversation_id,
        "user_id": user_id,
    }, room=conversation_id, skip_sid=sid)