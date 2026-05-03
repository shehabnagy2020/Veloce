import uuid
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.listing import Listing, ListingStatus
from app.models.favorite import Favorite
from app.models.badge import VerificationBadge, BadgeType, BadgeStatus
from app.schemas.listing import ListingCreate, ListingUpdate


async def search_listings(
    db: AsyncSession,
    *,
    make: str | None = None,
    model: str | None = None,
    year_min: int | None = None,
    year_max: int | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    transmission: str | None = None,
    district: str | None = None,
    page: int = 1,
    limit: int = 20,
    sort: str = "newest",
    user_id: bytes | None = None,
) -> tuple[list[dict], int]:
    """Search published listings with filters. Returns (items, total_count)."""
    filters = [Listing.status == ListingStatus.published]

    if make:
        filters.append(Listing.make == make)
    if model:
        filters.append(Listing.model == model)
    if year_min:
        filters.append(Listing.year >= year_min)
    if year_max:
        filters.append(Listing.year <= year_max)
    if price_min:
        filters.append(Listing.price >= price_min)
    if price_max:
        filters.append(Listing.price <= price_max)
    if transmission:
        filters.append(Listing.transmission == transmission)
    if district:
        filters.append(Listing.district == district)

    # Count query
    count_stmt = select(func.count()).select_from(Listing).where(and_(*filters))
    total = (await db.execute(count_stmt)).scalar() or 0

    # Sort
    order_col = Listing.created_at.desc()
    if sort == "price_asc":
        order_col = Listing.price.asc()
    elif sort == "price_desc":
        order_col = Listing.price.desc()

    # Data query
    stmt = (
        select(Listing)
        .where(and_(*filters))
        .order_by(order_col)
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(stmt)
    listings = result.scalars().all()

    return listings, total


async def get_listing_detail(db: AsyncSession, listing_id: str) -> Listing | None:
    """Get a single listing by ID with photos and badges."""
    lid = uuid.UUID(listing_id).bytes
    stmt = select(Listing).where(Listing.id == lid)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_listing(db: AsyncSession, seller_id: str, data: ListingCreate) -> Listing:
    """Create a new listing in draft status."""
    listing = Listing(
        id=uuid.uuid4().bytes,
        seller_id=uuid.UUID(seller_id).bytes,
        status=ListingStatus.draft,
        **data.model_dump(),
    )
    db.add(listing)
    await db.flush()
    await db.refresh(listing)
    return listing


async def update_listing(db: AsyncSession, listing_id: str, seller_id: str, data: ListingUpdate) -> Listing:
    """Update a listing. Only the owner can update."""
    lid = uuid.UUID(listing_id).bytes
    stmt = select(Listing).where(Listing.id == lid)
    result = await db.execute(stmt)
    listing = result.scalar_one_or_none()
    if not listing:
        raise ValueError("Listing not found")
    if listing.seller_id != uuid.UUID(seller_id).bytes:
        raise PermissionError("Not the owner")

    update_data = data.model_dump(exclude_unset=True)

    # Handle status transitions
    if "status" in update_data:
        new_status = ListingStatus(update_data["status"])
        valid_transitions = {
            ListingStatus.draft: [ListingStatus.published],
            ListingStatus.published: [ListingStatus.sold, ListingStatus.expired],
            ListingStatus.expired: [ListingStatus.published],  # re-publish
        }
        allowed = valid_transitions.get(listing.status, [])
        if new_status not in allowed:
            raise ValueError(f"Cannot transition from {listing.status.value} to {new_status.value}")
        update_data["status"] = new_status
        if new_status == ListingStatus.published:
            from datetime import datetime, timezone
            update_data["published_at"] = datetime.now(timezone.utc)

    for key, value in update_data.items():
        setattr(listing, key, value)

    await db.flush()
    await db.refresh(listing)
    return listing


async def toggle_favorite(db: AsyncSession, user_id: str, listing_id: str) -> bool:
    """Toggle favorite on a listing. Returns True if favorited, False if unfavorited."""
    uid = uuid.UUID(user_id).bytes
    lid = uuid.UUID(listing_id).bytes

    stmt = select(Favorite).where(Favorite.user_id == uid, Favorite.listing_id == lid)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        return False

    favorite = Favorite(id=uuid.uuid4().bytes, user_id=uid, listing_id=lid)
    db.add(favorite)
    await db.flush()
    return True


async def get_favorites(db: AsyncSession, user_id: str, page: int = 1, limit: int = 20) -> tuple[list, int]:
    """Get user's favorite listings."""
    uid = uuid.UUID(user_id).bytes

    count_stmt = select(func.count()).select_from(Favorite).where(Favorite.user_id == uid)
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = (
        select(Listing)
        .join(Favorite, Favorite.listing_id == Listing.id)
        .where(Favorite.user_id == uid)
        .order_by(Favorite.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(stmt)
    listings = result.scalars().all()
    return listings, total


async def submit_badge(db: AsyncSession, listing_id: str, seller_id: str, badge_type: str) -> VerificationBadge:
    """Submit a verification badge request for a listing."""
    lid = uuid.UUID(listing_id).bytes
    sid = uuid.UUID(seller_id).bytes

    listing = await get_listing_detail(db, listing_id)
    if not listing:
        raise ValueError("Listing not found")
    if listing.seller_id != sid:
        raise PermissionError("Not the owner")

    existing_stmt = select(VerificationBadge).where(
        VerificationBadge.listing_id == lid,
        VerificationBadge.badge_type == BadgeType(badge_type),
    )
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()
    if existing:
        if existing.status == BadgeStatus.rejected:
            existing.status = BadgeStatus.pending
            existing.document_url = None
            existing.reviewed_by = None
            existing.reviewed_at = None
            await db.flush()
            return existing
        return existing

    badge = VerificationBadge(
        id=uuid.uuid4().bytes,
        listing_id=lid,
        badge_type=BadgeType(badge_type),
        status=BadgeStatus.pending,
    )
    db.add(badge)
    await db.flush()
    await db.refresh(badge)
    return badge


async def review_badge(db: AsyncSession, badge_id: str, admin_id: str, status: str) -> VerificationBadge:
    """Approve or reject a verification badge. Admin only."""
    bid = uuid.UUID(badge_id).bytes
    aid = uuid.UUID(admin_id).bytes

    stmt = select(VerificationBadge).where(VerificationBadge.id == bid)
    result = await db.execute(stmt)
    badge = result.scalar_one_or_none()
    if not badge:
        raise ValueError("Badge not found")
    if badge.status != BadgeStatus.pending:
        raise ValueError(f"Cannot review badge with status {badge.status.value}")

    from datetime import datetime, timezone
    badge.status = BadgeStatus(status)
    badge.reviewed_by = aid
    badge.reviewed_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(badge)
    return badge


async def get_pending_badges(db: AsyncSession, status_filter: str | None = None, page: int = 1, limit: int = 20) -> tuple[list, int]:
    """Get verification badges, optionally filtered by status."""
    filters = []
    if status_filter:
        filters.append(VerificationBadge.status == BadgeStatus(status_filter))

    count_stmt = select(func.count()).select_from(VerificationBadge).where(and_(*filters)) if filters else select(func.count()).select_from(VerificationBadge)
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = (
        select(VerificationBadge)
        .where(and_(*filters) if filters else True)
        .order_by(VerificationBadge.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(stmt)
    badges = result.scalars().all()
    return badges, total


async def upload_badge_document(db: AsyncSession, badge_id: str, document_url: str) -> VerificationBadge:
    """Upload a document for a verification badge."""
    bid = uuid.UUID(badge_id).bytes
    stmt = select(VerificationBadge).where(VerificationBadge.id == bid)
    result = await db.execute(stmt)
    badge = result.scalar_one_or_none()
    if not badge:
        raise ValueError("Badge not found")

    badge.document_url = document_url
    await db.flush()
    await db.refresh(badge)
    return badge


async def expire_stale_listings(db: AsyncSession, days: int = 30) -> int:
    """Auto-expire published listings that have had no activity for the given number of days."""
    from datetime import datetime, timedelta, timezone

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    stmt = (
        select(Listing)
        .where(
            Listing.status == ListingStatus.published,
            (Listing.last_activity == None) | (Listing.last_activity < cutoff),
        )
    )
    result = await db.execute(stmt)
    stale_listings = result.scalars().all()

    count = 0
    for listing in stale_listings:
        # Only expire if also older than cutoff by created_at or updated_at
        if listing.published_at and listing.published_at < cutoff.replace(tzinfo=timezone.utc) if listing.published_at.tzinfo is None else listing.published_at < cutoff:
            listing.status = ListingStatus.expired
            count += 1

    await db.flush()
    return count