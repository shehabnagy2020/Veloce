import pytest
from app.services.price_service import calculate_price_indicator, get_market_average
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession


def test_price_indicator_below_average():
    assert calculate_price_indicator(500000, 700000) == "below_average"


def test_price_indicator_above_average():
    assert calculate_price_indicator(900000, 700000) == "above_average"


def test_price_indicator_at_average():
    # Within 5% tolerance band (665000-735000)
    assert calculate_price_indicator(700000, 700000) == "at_average"
    assert calculate_price_indicator(690000, 700000) == "at_average"
    assert calculate_price_indicator(720000, 700000) == "at_average"


def test_price_indicator_no_average():
    assert calculate_price_indicator(500000, None) is None


def test_price_indicator_just_below_band():
    # 5% of 700000 = 35000, so band is 665000-735000
    assert calculate_price_indicator(664999, 700000) == "below_average"


def test_price_indicator_just_above_band():
    assert calculate_price_indicator(735001, 700000) == "above_average"