from pydantic import BaseModel


class BadgeReview(BaseModel):
    status: str  # "approved" or "rejected"


class BadgeResponse(BaseModel):
    id: str
    listing_id: str
    badge_type: str
    status: str
    document_url: str | None = None
    seller_name: str | None = None
    created_at: str

    model_config = {"from_attributes": True}