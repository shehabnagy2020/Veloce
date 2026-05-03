import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.listing import Listing, ListingStatus, FuelType
from app.models.photo import Photo
from app.services.price_service import calculate_price_indicator, get_market_average

router = APIRouter()


class QuizRequest(BaseModel):
    budget_max: int  # EGP
    daily_commute_km: int  # km
    family_size: int


class QuizRecommendation(BaseModel):
    id: str
    make: str
    model: str
    year: int
    price: int
    price_indicator: str | None = None
    transmission: str
    fuel_type: str | None = None
    body_type: str | None = None
    district: str
    thumbnail_url: str | None = None


class QuizResponse(BaseModel):
    recommendations: list[QuizRecommendation]


# Body type recommendations based on family size and commute
def _recommend_body_types(family_size: int, daily_commute_km: int) -> list[str] | None:
    if family_size <= 2 and daily_commute_km > 30:
        return ["Sedan", "Hatchback"]
    elif family_size <= 2:
        return ["Sedan", "Hatchback", "Coupe"]
    elif family_size <= 4:
        return ["Sedan", "SUV", "Crossover"]
    elif family_size <= 6:
        return ["SUV", "Minivan", "Crossover"]
    else:
        return ["SUV", "Minivan"]


def _recommend_fuel_types(daily_commute_km: int) -> list[str] | None:
    if daily_commute_km > 50:
        return ["petrol", "diesel", "hybrid"]
    elif daily_commute_km > 20:
        return ["petrol", "hybrid"]
    return None  # any fuel type


@router.post("/recommend", response_model=QuizResponse)
async def get_recommendations(
    data: QuizRequest,
    db: AsyncSession = Depends(get_db),
):
    filters = [Listing.status == ListingStatus.published, Listing.price <= data.budget_max]

    body_types = _recommend_body_types(data.family_size, data.daily_commute_km)
    if body_types:
        filters.append(Listing.body_type.in_(body_types))

    fuel_types = _recommend_fuel_types(data.daily_commute_km)
    if fuel_types:
        filters.append(Listing.fuel_type.in_([FuelType(ft) for ft in fuel_types]))

    stmt = (
        select(Listing)
        .where(and_(*filters))
        .options(selectinload(Listing.photos))
        .order_by(Listing.price.asc())
        .limit(10)
    )
    result = await db.execute(stmt)
    listings = result.scalars().all()

    recommendations = []
    for listing in listings:
        avg = await get_market_average(db, listing.make, listing.model, listing.year)
        indicator = calculate_price_indicator(listing.price, avg)
        thumbnail = listing.photos[0].thumbnail_url if listing.photos else None

        recommendations.append(QuizRecommendation(
            id=uuid.UUID(bytes=listing.id).hex,
            make=listing.make,
            model=listing.model,
            year=listing.year,
            price=listing.price,
            price_indicator=indicator,
            transmission=listing.transmission.value,
            fuel_type=listing.fuel_type.value if listing.fuel_type else None,
            body_type=listing.body_type,
            district=listing.district,
            thumbnail_url=thumbnail,
        ))

    return QuizResponse(recommendations=recommendations)