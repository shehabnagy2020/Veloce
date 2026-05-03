import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, AuthProvider
from app.schemas.auth import RegisterRequest, LoginRequest, UserResponse, TokenResponse
from app.services.auth_service import (
    hash_password, verify_password, create_access_token,
    get_or_create_user,
)
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == req.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=uuid.uuid4().bytes,
        email=req.email,
        display_name=req.display_name,
        auth_provider=AuthProvider.email,
        password_hash=hash_password(req.password),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token = create_access_token(user.id.hex())
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == req.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user.id.hex())
    return TokenResponse(access_token=token)


@router.post("/logout")
async def logout():
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id.hex(),
        email=current_user.email,
        display_name=current_user.display_name,
        phone=current_user.phone,
        language=current_user.language.value,
        role=current_user.role.value,
    )