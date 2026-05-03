import uuid
from enum import Enum as PyEnum

from sqlalchemy import String, Integer, Enum, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.dialects.sqlite import BLOB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ContentType(PyEnum):
    text = "text"
    image = "image"
    voice_note = "voice_note"


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(BLOB(16), primary_key=True, default=lambda: uuid.uuid4().bytes)
    conversation_id: Mapped[str] = mapped_column(BLOB(16), ForeignKey("conversations.id"), nullable=False, index=True)
    sender_id: Mapped[str] = mapped_column(BLOB(16), ForeignKey("users.id"), nullable=False)
    content_type: Mapped[ContentType] = mapped_column(Enum(ContentType), nullable=False)
    text_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_duration_sec: Mapped[int | None] = mapped_column(Integer, nullable=True)
    file_waveform: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    read_at: Mapped[str | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")
    sender: Mapped["User"] = relationship()