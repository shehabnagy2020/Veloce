import uuid
import pytest

from app.models.user import User, AuthProvider
from app.models.listing import Listing, ListingStatus, Transmission, Condition
from app.services.listing_service import toggle_favorite, get_favorites
import bcrypt


async def _create_user(db, email: str) -> User:
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
async def test_toggle_favorite(db_session):
    user = await _create_user(db_session, "fav_user@test.com")
    seller = await _create_user(db_session, "fav_seller@test.com")
    listing = await _create_listing(db_session, seller.id)

    user_id = uuid.UUID(bytes=user.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    favorited = await toggle_favorite(db_session, user_id, listing_id)
    assert favorited is True


@pytest.mark.asyncio
async def test_toggle_favorite_unfavorite(db_session):
    user = await _create_user(db_session, "fav_unfav@test.com")
    seller = await _create_user(db_session, "fav_unfav_seller@test.com")
    listing = await _create_listing(db_session, seller.id)

    user_id = uuid.UUID(bytes=user.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    # Favorite then unfavorite
    await toggle_favorite(db_session, user_id, listing_id)
    unfavorited = await toggle_favorite(db_session, user_id, listing_id)
    assert unfavorited is False


@pytest.mark.asyncio
async def test_get_favorites(db_session):
    user = await _create_user(db_session, "fav_get@test.com")
    seller = await _create_user(db_session, "fav_get_seller@test.com")
    listing = await _create_listing(db_session, seller.id)

    user_id = uuid.UUID(bytes=user.id).hex
    listing_id = uuid.UUID(bytes=listing.id).hex

    await toggle_favorite(db_session, user_id, listing_id)

    listings, total = await get_favorites(db_session, user_id)
    assert total == 1
    assert len(listings) == 1
    assert uuid.UUID(bytes=listings[0].id).hex == listing_id


@pytest.mark.asyncio
async def test_get_favorites_empty(db_session):
    user = await _create_user(db_session, "fav_empty@test.com")

    user_id = uuid.UUID(bytes=user.id).hex
    listings, total = await get_favorites(db_session, user_id)
    assert total == 0
    assert len(listings) == 0