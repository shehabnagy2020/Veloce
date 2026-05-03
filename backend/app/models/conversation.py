import uuid

from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.sqlite import BLOB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (UniqueConstraint("buyer_id", "listing_id", name="uq_buyer_listing"),)

    id: Mapped[str] = mapped_column(BLOB(16), primary_key=True, default=lambda: uuid.uuid4().bytes)
    buyer_id: Mapped[str] = mapped_column(BLOB(16), ForeignKey("users.id"), nullable=False)
    seller_id: Mapped[str] = mapped_column(BLOB(16), ForeignKey("users.id"), nullable=False)
    listing_id: Mapped[str] = mapped_column(BLOB(16), ForeignKey("listings.id"), nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[str] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    buyer: Mapped["User"] = relationship(foreign_keys=[buyer_id])
    seller: Mapped["User"] = relationship(foreign_keys=[seller_id])
    listing: Mapped["Listing"] = relationship(back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")