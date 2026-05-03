import uuid
from PIL import Image
import io

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.listing import Listing, ListingStatus
from app.models.photo import Photo, PhotoType
from app.models.user import User
from app.schemas.listing import (
    ListingCreate, ListingUpdate, ListingResponse, ListingListResponse, ListingListItem,
    PhotoResponse, BadgeResponse,
)
from app.services.listing_service import (
    search_listings, get_listing_detail, create_listing, update_listing,
    toggle_favorite, get_favorites,
)
from app.services.price_service import calculate_price_indicator, get_market_average
from app.services.storage_service import save_file
from app.services.vin_service import decode_vin
from app.api.deps import get_current_user

router = APIRouter()


def _listing_to_response(listing: Listing, price_indicator: str | None = None) -> ListingResponse:
    seller_phone = listing.user.phone if listing.show_phone else None
    return ListingResponse(
        id=uuid.UUID(bytes=listing.id).hex,
        seller_id=uuid.UUID(bytes=listing.seller_id).hex,
        seller_name=listing.user.display_name if hasattr(listing, 'user') else None,
        seller_phone=seller_phone,
        make=listing.make,
        model=listing.model,
        year=listing.year,
        price=listing.price,
        price_indicator=price_indicator,
        transmission=listing.transmission.value,
        mileage=listing.mileage,
        condition=listing.condition.value,
        body_type=listing.body_type,
        engine_size=listing.engine_size,
        fuel_type=listing.fuel_type.value if listing.fuel_type else None,
        color=listing.color,
        vin=listing.vin,
        description=listing.description,
        district=listing.district,
        latitude=listing.latitude,
        longitude=listing.longitude,
        show_phone=listing.show_phone,
        status=listing.status.value,
        photos=[
            PhotoResponse(
                id=uuid.UUID(bytes=p.id).hex,
                url=p.url,
                thumbnail_url=p.thumbnail_url,
                photo_type=p.photo_type.value,
                position=p.position,
            ) for p in listing.photos
        ] if listing.photos else [],
        badges=[
            BadgeResponse(badge_type=b.badge_type.value, status=b.status.value)
            for b in listing.badges
        ] if listing.badges else [],
        views_count=listing.views_count,
        created_at=listing.created_at.isoformat() if listing.created_at else "",
    )


@router.get("", response_model=ListingListResponse)
async def list_listings(
    make: str | None = None,
    model: str | None = None,
    year_min: int | None = None,
    year_max: int | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    transmission: str | None = None,
    district: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    sort: str = Query("newest"),
    db: AsyncSession = Depends(get_db),
):
    listings, total = await search_listings(
        db, make=make, model=model, year_min=year_min, year_max=year_max,
        price_min=price_min, price_max=price_max, transmission=transmission,
        district=district, page=page, limit=limit, sort=sort,
    )

    items = []
    for listing in listings:
        avg = await get_market_average(db, listing.make, listing.model, listing.year)
        indicator = calculate_price_indicator(listing.price, avg)
        thumbnail = listing.photos[0].thumbnail_url if listing.photos else None
        badge_data = [BadgeResponse(badge_type=b.badge_type.value, status=b.status.value) for b in listing.badges] if listing.badges else []
        items.append(ListingListItem(
            id=uuid.UUID(bytes=listing.id).hex,
            make=listing.make, model=listing.model, year=listing.year,
            price=listing.price, transmission=listing.transmission.value,
            district=listing.district, thumbnail_url=thumbnail,
            price_indicator=indicator, badges=badge_data,
            created_at=listing.created_at.isoformat() if listing.created_at else "",
        ))

    return ListingListResponse(items=items, total=total, page=page, limit=limit)


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: str, db: AsyncSession = Depends(get_db)):
    listing = await get_listing_detail(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Increment views
    listing.views_count = (listing.views_count or 0) + 1
    await db.flush()

    avg = await get_market_average(db, listing.make, listing.model, listing.year)
    indicator = calculate_price_indicator(listing.price, avg)
    return _listing_to_response(listing, indicator)


@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_new_listing(
    data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = await create_listing(db, uuid.UUID(bytes=current_user.id).hex, data)
    return _listing_to_response(listing)


@router.patch("/{listing_id}", response_model=ListingResponse)
async def patch_listing(
    listing_id: str,
    data: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        listing = await update_listing(
            db, listing_id, uuid.UUID(bytes=current_user.id).hex, data
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not the owner")

    avg = await get_market_average(db, listing.make, listing.model, listing.year)
    indicator = calculate_price_indicator(listing.price, avg)
    return _listing_to_response(listing, indicator)


@router.post("/{listing_id}/favorite")
async def favorite_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    favorited = await toggle_favorite(db, uuid.UUID(bytes=current_user.id).hex, listing_id)
    return {"favorited": favorited}


@router.get("/favorites")
async def list_favorites(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listings, total = await get_favorites(db, uuid.UUID(bytes=current_user.id).hex, page, limit)
    items = []
    for listing in listings:
        avg = await get_market_average(db, listing.make, listing.model, listing.year)
        indicator = calculate_price_indicator(listing.price, avg)
        items.append(_listing_to_response(listing, indicator))
    return {"items": items, "total": total, "page": page, "limit": limit}


@router.post("/{listing_id}/photos", response_model=PhotoResponse, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    listing_id: str,
    file: UploadFile = File(...),
    photo_type: str = Form(...),
    position: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lid = uuid.UUID(listing_id).bytes
    stmt = select(Listing).where(Listing.id == lid)
    result = await db.execute(stmt)
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not the owner")

    file_data = await file.read()
    if len(file_data) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=413, detail="File too large")

    # Generate thumbnail
    try:
        img = Image.open(io.BytesIO(file_data))
        img.thumbnail((300, 300))
        thumb_buf = io.BytesIO()
        img.save(thumb_buf, format="WEBP", quality=80)
        thumb_data = thumb_buf.getvalue()
    except Exception:
        thumb_data = None

    filename = f"{uuid.uuid4().hex}.webp"
    url = await save_file(file_data, "photos", filename)

    thumb_url = None
    if thumb_data:
        thumb_filename = f"thumb_{filename}"
        thumb_url = await save_file(thumb_data, "photos", thumb_filename)

    photo = Photo(
        id=uuid.uuid4().bytes,
        listing_id=lid,
        url=url,
        thumbnail_url=thumb_url,
        position=position,
        photo_type=PhotoType(photo_type),
    )
    db.add(photo)
    await db.flush()
    await db.refresh(photo)

    return PhotoResponse(
        id=uuid.UUID(bytes=photo.id).hex,
        url=photo.url,
        thumbnail_url=photo.thumbnail_url,
        photo_type=photo.photo_type.value,
        position=photo.position,
    )