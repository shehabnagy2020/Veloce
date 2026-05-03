import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from authlib.integrations.starlette_client import OAuth
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User, AuthProvider, UserRole, Language

oauth = OAuth()

oauth.register(
    name="google",
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

oauth.register(
    name="facebook",
    client_id=settings.facebook_client_id,
    client_secret=settings.facebook_client_secret,
    authorize_url="https://www.facebook.com/v18.0/dialog/oauth",
    access_token_url="https://graph.facebook.com/v18.0/oauth/access_token",
    userinfo_endpoint="https://graph.facebook.com/me?fields=id,name,email",
    client_kwargs={"scope": "email public_profile"},
)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError:
        return None


async def get_or_create_user(db: AsyncSession, *, email: str, display_name: str, auth_provider: AuthProvider, provider_id: str | None = None, password_hash: str | None = None) -> User:
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if user:
        return user

    user = User(
        id=uuid.uuid4().bytes,
        email=email,
        display_name=display_name,
        auth_provider=auth_provider,
        provider_id=provider_id,
        password_hash=password_hash,
    )
    db.add(user)
    await db.flush()
    return user