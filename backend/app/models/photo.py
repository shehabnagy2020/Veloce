import uuid
from enum import Enum as PyEnum

from sqlalchemy import String, Integer, Enum, DateTime, ForeignKey, func
from sqlalchemy.dialects.sqlite import BLOB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PhotoType(PyEnum):
    front = "front"
    side = "side"
    interior = "interior"
    other = "other"


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[str] = mapped_column(BLOB(16), primary_key=True, default=lambda: uuid.uuid4().bytes)
    listing_id: Mapped[str] = mapped_column(BLOB(16), ForeignKey("listings.id"), nullable=False, index=True)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    photo_type: Mapped[PhotoType] = mapped_column(Enum(PhotoType), nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    listing: Mapped["Listing"] = relationship(back_populates="photos")