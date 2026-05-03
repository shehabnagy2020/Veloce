from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.listing import Listing, ListingStatus


def calculate_price_indicator(price: int, average: float | None) -> str | None:
    """Determine if a price is below, at, or above the market average."""
    if average is None:
        return None
    margin = average * 0.05  # 5% tolerance band
    if price < average - margin:
        return "below_average"
    elif price > average + margin:
        return "above_average"
    return "at_average"


async def get_market_average(db: AsyncSession, make: str, model: str, year: int) -> float | None:
    """Get the average price for a given make/model/year from published listings."""
    stmt = (
        select(func.avg(Listing.price))
        .where(
            Listing.make == make,
            Listing.model == model,
            Listing.year == year,
            Listing.status == ListingStatus.published,
        )
    )
    result = await db.execute(stmt)
    avg = result.scalar()
    return float(avg) if avg else None