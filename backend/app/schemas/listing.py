from pydantic import BaseModel


class ListingCreate(BaseModel):
    make: str
    model: str
    year: int
    price: int
    transmission: str
    mileage: int | None = None
    condition: str
    body_type: str | None = None
    engine_size: str | None = None
    fuel_type: str | None = None
    color: str | None = None
    vin: str | None = None
    description: str | None = None
    district: str
    latitude: float | None = None
    longitude: float | None = None
    show_phone: bool = False


class ListingUpdate(BaseModel):
    make: str | None = None
    model: str | None = None
    year: int | None = None
    price: int | None = None
    transmission: str | None = None
    mileage: int | None = None
    condition: str | None = None
    body_type: str | None = None
    engine_size: str | None = None
    fuel_type: str | None = None
    color: str | None = None
    vin: str | None = None
    description: str | None = None
    district: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    show_phone: bool | None = None
    status: str | None = None


class PhotoResponse(BaseModel):
    id: str
    url: str
    thumbnail_url: str | None = None
    photo_type: str
    position: int

    model_config = {"from_attributes": True}


class BadgeResponse(BaseModel):
    badge_type: str
    status: str

    model_config = {"from_attributes": True}


class ListingResponse(BaseModel):
    id: str
    seller_id: str
    seller_name: str | None = None
    seller_phone: str | None = None
    make: str
    model: str
    year: int
    price: int
    price_indicator: str | None = None
    transmission: str
    mileage: int | None = None
    condition: str
    body_type: str | None = None
    engine_size: str | None = None
    fuel_type: str | None = None
    color: str | None = None
    vin: str | None = None
    description: str | None = None
    district: str
    latitude: float | None = None
    longitude: float | None = None
    show_phone: bool = False
    status: str
    photos: list[PhotoResponse] = []
    badges: list[BadgeResponse] = []
    views_count: int = 0
    created_at: str

    model_config = {"from_attributes": True}


class ListingListItem(BaseModel):
    id: str
    make: str
    model: str
    year: int
    price: int
    transmission: str
    district: str
    thumbnail_url: str | None = None
    price_indicator: str | None = None
    badges: list[BadgeResponse] = []
    created_at: str


class ListingListResponse(BaseModel):
    items: list[ListingListItem]
    total: int
    page: int
    limit: int