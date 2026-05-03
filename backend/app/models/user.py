import uuid
from enum import Enum as PyEnum

from sqlalchemy import String, Boolean, Enum, DateTime, func
from sqlalchemy.dialects.sqlite import BLOB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AuthProvider(PyEnum):
    google = "google"
    facebook = "facebook"
    email = "email"


class UserRole(PyEnum):
    user = "user"
    admin = "admin"


class Language(PyEnum):
    en = "en"
    ar = "ar"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(BLOB(16), primary_key=True, default=lambda: uuid.uuid4().bytes)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    show_phone: Mapped[bool] = mapped_column(Boolean, default=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    auth_provider: Mapped[AuthProvider] = mapped_column(Enum(AuthProvider), nullable=False)
    provider_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    language: Mapped[Language] = mapped_column(Enum(Language), default=Language.en)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.user)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    last_login: Mapped[str | None] = mapped_column(DateTime, nullable=True)

    conversations_as_buyer: Mapped[list["Conversation"]] = relationship(foreign_keys="Conversation.buyer_id", back_populates="buyer")
    conversations_as_seller: Mapped[list["Conversation"]] = relationship(foreign_keys="Conversation.seller_id", back_populates="seller")