import uuid
from enum import Enum as PyEnum

from sqlalchemy import String, Enum, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.sqlite import BLOB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BadgeType(PyEnum):
    one_owner = "one_owner"
    service_book_verified = "service_book_verified"


class BadgeStatus(PyEnum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class VerificationBadge(Base):
    __tablename__ = "badges"
    __table_args__ = (UniqueConstraint("listing_id", "badge_type", name="uq_listing_badge_type"),)

    id: Mapped[str] = mapped_column(BLOB(16), primary_key=True, default=lambda: uuid.uuid4().bytes)
    listing_id: Mapped[str] = mapped_column(BLOB(16), ForeignKey("listings.id"), nullable=False, index=True)
    badge_type: Mapped[BadgeType] = mapped_column(Enum(BadgeType), nullable=False)
    status: Mapped[BadgeStatus] = mapped_column(Enum(BadgeStatus), default=BadgeStatus.pending, nullable=False, index=True)
    document_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(BLOB(16), ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[str | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    listing: Mapped["Listing"] = relationship(back_populates="badges")