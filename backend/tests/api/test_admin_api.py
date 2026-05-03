import uuid
import pytest

from app.models.user import User, AuthProvider
from app.models.listing import Listing, ListingStatus, Transmission, Condition
from app.models.badge import BadgeType, BadgeStatus
from app.services.listing_service import submit_badge
import bcrypt


async def _create_user(db, email: str, role: str = "user") -> User:
    user = User(
        id=uuid.uuid4().bytes,
        email=email,
        display_name=email.split("@")[0],
        auth_provider=AuthProvider.email,
        password_hash=bcrypt.hashpw(b"testpass123", bcrypt.gensalt()).decode(),
        role=role if role == "admin" else "user",
    )
    db.add(user)
    await db.flush()
    return user


async def _create_listing(db, seller_id: bytes) -> Listing:
    listing = Listing(
        id=uuid.uuid4().bytes,
        seller_id=seller_id,
        make="Toyota", model="Camry", year=2020,
        price=500000, transmission=Transmission.automatic,
        condition=Condition.used, district="Cairo",
        status=ListingStatus.published,
    )
    db.add(listing)
    await db.flush()
    return listing


@pytest.mark.asyncio
async def test_submit_badge(db_session):
    seller = await _create_user(db_session, "badge_submit@test.com")
    listing = await _create_listing(db_session, seller.id)
    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    badge = await submit_badge(db_session, listing_id, seller_id, "one_owner")
    assert badge is not None
    assert badge.badge_type.value == "one_owner"
    assert badge.status.value == "pending"


@pytest.mark.asyncio
async def test_submit_duplicate_badge_returns_existing(db_session):
    seller = await _create_user(db_session, "badge_dup@test.com")
    listing = await _create_listing(db_session, seller.id)
    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    badge1 = await submit_badge(db_session, listing_id, seller_id, "one_owner")
    badge2 = await submit_badge(db_session, listing_id, seller_id, "one_owner")
    assert badge1.id == badge2.id


@pytest.mark.asyncio
async def test_review_badge_approve(db_session):
    seller = await _create_user(db_session, "badge_approve@test.com")
    admin = await _create_user(db_session, "badge_admin@test.com", role="admin")
    listing = await _create_listing(db_session, seller.id)

    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex
    badge = await submit_badge(db_session, listing_id, seller_id, "service_book_verified")

    admin_id = uuid.UUID(bytes=admin.id).hex
    from app.services.listing_service import review_badge
    reviewed = await review_badge(db_session, uuid.UUID(bytes=badge.id).hex, admin_id, "approved")
    assert reviewed.status.value == "approved"


@pytest.mark.asyncio
async def test_review_badge_reject(db_session):
    seller = await _create_user(db_session, "badge_reject@test.com")
    admin = await _create_user(db_session, "badge_reject_admin@test.com", role="admin")
    listing = await _create_listing(db_session, seller.id)

    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex
    badge = await submit_badge(db_session, listing_id, seller_id, "one_owner")

    admin_id = uuid.UUID(bytes=admin.id).hex
    from app.services.listing_service import review_badge
    reviewed = await review_badge(db_session, uuid.UUID(bytes=badge.id).hex, admin_id, "rejected")
    assert reviewed.status.value == "rejected"


@pytest.mark.asyncio
async def test_get_pending_badges(db_session):
    seller = await _create_user(db_session, "badge_pending@test.com")
    listing = await _create_listing(db_session, seller.id)

    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex
    await submit_badge(db_session, listing_id, seller_id, "one_owner")

    from app.services.listing_service import get_pending_badges
    badges, total = await get_pending_badges(db_session, status_filter="pending")
    assert total >= 1