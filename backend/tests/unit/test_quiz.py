import pytest

from app.api.quiz import _recommend_body_types, _recommend_fuel_types


def test_body_types_single_person_long_commute():
    result = _recommend_body_types(family_size=1, daily_commute_km=50)
    assert "Sedan" in result
    assert "Hatchback" in result


def test_body_types_couple_short_commute():
    result = _recommend_body_types(family_size=2, daily_commute_km=10)
    assert "Coupe" in result


def test_body_types_family_of_4():
    result = _recommend_body_types(family_size=4, daily_commute_km=20)
    assert "SUV" in result


def test_body_types_large_family():
    result = _recommend_body_types(family_size=6, daily_commute_km=30)
    assert "SUV" in result
    assert "Minivan" in result


def test_fuel_types_long_commute():
    result = _recommend_fuel_types(daily_commute_km=60)
    assert "hybrid" in result


def test_fuel_types_medium_commute():
    result = _recommend_fuel_types(daily_commute_km=30)
    assert "hybrid" in result


def test_fuel_types_short_commute():
    result = _recommend_fuel_types(daily_commute_km=10)
    assert result is None  # any fuel type is fine