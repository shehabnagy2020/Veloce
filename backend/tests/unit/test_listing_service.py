import uuid
import pytest

from app.models.user import User, AuthProvider
from app.models.listing import Listing, ListingStatus, Transmission, Condition
from app.models.badge import VerificationBadge, BadgeType, BadgeStatus
from app.services.listing_service import (
    create_listing,
    submit_badge,
    review_badge,
    get_pending_badges,
)
from app.schemas.listing import ListingCreate
import bcrypt


async def _create_user(db, email="badgeuser@test.com"):
    user = User(
        id=uuid.uuid4().bytes,
        email=email,
        display_name=email.split("@")[0],
        auth_provider=AuthProvider.email,
        password_hash=bcrypt.hashpw(b"testpass123", bcrypt.gensalt()).decode(),
    )
    db.add(user)
    await db.flush()
    return user


async def _create_listing(db, seller_id: bytes):
    data = ListingCreate(
        make="Toyota", model="Camry", year=2020, price=500000,
        transmission="automatic", condition="used", district="Cairo",
    )
    listing = await create_listing(db, uuid.UUID(bytes=seller_id).hex, data)
    listing.status = ListingStatus.published
    await db.flush()
    return listing


@pytest.mark.asyncio
async def test_create_listing_draft(db_session):
    seller = await _create_user(db_session, "draft_seller@test.com")
    data = ListingCreate(
        make="Honda", model="Civic", year=2021, price=600000,
        transmission="automatic", condition="used", district="Giza",
    )
    seller_id = uuid.UUID(bytes=seller.id).hex
    listing = await create_listing(db_session, seller_id=seller_id, data=data)
    assert listing.status.value == "draft"
    assert listing.make == "Honda"
    assert listing.price == 600000


@pytest.mark.asyncio
async def test_search_listings_published_only(db_session):
    from app.services.listing_service import search_listings
    result = await search_listings(db_session, make="Toyota")
    assert isinstance(result, tuple)
    assert len(result) == 2


@pytest.mark.asyncio
async def test_submit_badge(db_session):
    seller = await _create_user(db_session, "badge_seller@test.com")
    listing = await _create_listing(db_session, seller.id)
    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    badge = await submit_badge(db_session, listing_id, seller_id, "one_owner")
    assert badge.badge_type.value == "one_owner"
    assert badge.status.value == "pending"


@pytest.mark.asyncio
async def test_submit_badge_not_owner(db_session):
    seller = await _create_user(db_session, "badge_owner@test.com")
    other = await _create_user(db_session, "badge_other@test.com")
    listing = await _create_listing(db_session, seller.id)

    try:
        await submit_badge(db_session, uuid.UUID(bytes=listing.id).hex, uuid.UUID(bytes=other.id).hex, "one_owner")
        assert False, "Should have raised PermissionError"
    except PermissionError:
        pass


@pytest.mark.asyncio
async def test_review_badge_approve(db_session):
    seller = await _create_user(db_session, "badge_approve_seller@test.com")
    admin = await _create_user(db_session, "badge_admin@test.com")
    listing = await _create_listing(db_session, seller.id)

    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex
    badge = await submit_badge(db_session, listing_id, seller_id, "service_book_verified")

    admin_id = uuid.UUID(bytes=admin.id).hex
    reviewed = await review_badge(db_session, uuid.UUID(bytes=badge.id).hex, admin_id, "approved")
    assert reviewed.status.value == "approved"
    assert reviewed.reviewed_by is not None


@pytest.mark.asyncio
async def test_review_badge_reject(db_session):
    seller = await _create_user(db_session, "badge_reject_seller@test.com")
    admin = await _create_user(db_session, "badge_reject_admin@test.com")
    listing = await _create_listing(db_session, seller.id)

    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex
    badge = await submit_badge(db_session, listing_id, seller_id, "one_owner")

    admin_id = uuid.UUID(bytes=admin.id).hex
    reviewed = await review_badge(db_session, uuid.UUID(bytes=badge.id).hex, admin_id, "rejected")
    assert reviewed.status.value == "rejected"


@pytest.mark.asyncio
async def test_resubmit_rejected_badge(db_session):
    seller = await _create_user(db_session, "badge_resubmit@test.com")
    admin = await _create_user(db_session, "badge_resubmit_admin@test.com")
    listing = await _create_listing(db_session, seller.id)

    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex
    badge = await submit_badge(db_session, listing_id, seller_id, "one_owner")

    admin_id = uuid.UUID(bytes=admin.id).hex
    await review_badge(db_session, uuid.UUID(bytes=badge.id).hex, admin_id, "rejected")

    # Re-submit the rejected badge
    resubmitted = await submit_badge(db_session, listing_id, seller_id, "one_owner")
    assert resubmitted.status.value == "pending"


@pytest.mark.asyncio
async def test_get_pending_badges(db_session):
    seller = await _create_user(db_session, "badge_pending@test.com")
    listing = await _create_listing(db_session, seller.id)

    seller_id = uuid.UUID(bytes=seller.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex
    await submit_badge(db_session, listing_id, seller_id, "one_owner")

    badges, total = await get_pending_badges(db_session, status_filter="pending")
    assert total >= 1
    assert badges[0].status.value == "pending"