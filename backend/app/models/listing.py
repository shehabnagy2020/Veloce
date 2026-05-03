import uuid
from enum import Enum as PyEnum

from sqlalchemy import String, Integer, Boolean, Enum, Float, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.sqlite import BLOB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Transmission(PyEnum):
    automatic = "automatic"
    manual = "manual"


class Condition(PyEnum):
    new = "new"
    used = "used"
    used_like_new = "used_like_new"


class FuelType(PyEnum):
    petrol = "petrol"
    diesel = "diesel"
    hybrid = "hybrid"
    electric = "electric"


class ListingStatus(PyEnum):
    draft = "draft"
    published = "published"
    sold = "sold"
    expired = "expired"


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[str] = mapped_column(BLOB(16), primary_key=True, default=lambda: uuid.uuid4().bytes)
    seller_id: Mapped[str] = mapped_column(BLOB(16), ForeignKey("users.id"), nullable=False, index=True)
    make: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    model: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    transmission: Mapped[Transmission] = mapped_column(Enum(Transmission), nullable=False)
    mileage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    condition: Mapped[Condition] = mapped_column(Enum(Condition), nullable=False)
    body_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    engine_size: Mapped[str | None] = mapped_column(String(20), nullable=True)
    fuel_type: Mapped[FuelType | None] = mapped_column(Enum(FuelType), nullable=True)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    vin: Mapped[str | None] = mapped_column(String(17), nullable=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    show_phone: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[ListingStatus] = mapped_column(Enum(ListingStatus), default=ListingStatus.draft, nullable=False, index=True)
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    last_activity_at: Mapped[str | None] = mapped_column(DateTime, nullable=True)
    published_at: Mapped[str | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[str] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    conversations: Mapped[list["Conversation"]] = relationship(back_populates="listing", cascade="all, delete-orphan")
    photos: Mapped[list["Photo"]] = relationship(back_populates="listing", cascade="all, delete-orphan")
    badges: Mapped[list["VerificationBadge"]] = relationship(back_populates="listing", cascade="all, delete-orphan")