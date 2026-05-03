import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.badge import VerificationBadge
from app.models.listing import Listing
from app.schemas.admin import BadgeReview, BadgeResponse
from app.services.listing_service import review_badge, get_pending_badges, upload_badge_document
from app.services.storage_service import save_file
from app.api.deps import get_current_user, require_admin

router = APIRouter()


def _badge_to_response(badge: VerificationBadge, seller_name: str | None = None) -> BadgeResponse:
    return BadgeResponse(
        id=uuid.UUID(bytes=badge.id).hex,
        listing_id=uuid.UUID(bytes=badge.listing_id).hex,
        badge_type=badge.badge_type.value,
        status=badge.status.value,
        document_url=badge.document_url,
        seller_name=seller_name,
        created_at=badge.created_at.isoformat() if badge.created_at else "",
    )


@router.get("/badges")
async def list_badges(
    status_filter: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    badges, total = await get_pending_badges(db, status_filter=status_filter, page=page, limit=limit)

    items = []
    for badge in badges:
        # Get seller name for the badge's listing
        lid = badge.listing_id
        listing_stmt = select(Listing).where(Listing.id == lid).options(selectinload(Listing.user))
        listing_result = await db.execute(listing_stmt)
        listing = listing_result.scalar_one_or_none()
        seller_name = listing.user.display_name if listing and hasattr(listing, 'user') else None

        items.append({
            "id": uuid.UUID(bytes=badge.id).hex,
            "listing_id": uuid.UUID(bytes=badge.listing_id).hex,
            "badge_type": badge.badge_type.value,
            "status": badge.status.value,
            "document_url": badge.document_url,
            "seller_name": seller_name,
            "created_at": badge.created_at.isoformat() if badge.created_at else "",
        })

    return {"items": items, "total": total, "page": page, "limit": limit}


@router.patch("/badges/{badge_id}")
async def review_badge_endpoint(
    badge_id: str,
    data: BadgeReview,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if data.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")

    admin_id = uuid.UUID(bytes=admin.id).hex
    try:
        badge = await review_badge(db, badge_id, admin_id, data.status)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return _badge_to_response(badge)


@router.post("/badges/{badge_id}/document", status_code=status.HTTP_201_CREATED)
async def upload_badge_document_endpoint(
    badge_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    file_data = await file.read()
    if len(file_data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")

    filename = f"{uuid.uuid4().hex}.pdf"
    doc_url = await save_file(file_data, "documents", filename)

    try:
        badge = await upload_badge_document(db, badge_id, doc_url)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {"document_url": doc_url}