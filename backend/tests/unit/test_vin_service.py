import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.vin_service import decode_vin, decode_vin_primary, decode_vin_fallback


def test_invalid_vin_too_short():
    import asyncio
    with pytest.raises(ValueError, match="Invalid VIN format"):
        asyncio.run(decode_vin("123"))


def test_invalid_vin_non_alphanumeric():
    import asyncio
    with pytest.raises(ValueError, match="Invalid VIN format"):
        asyncio.run(decode_vin("1HGCM82633A004352!"))


@pytest.mark.asyncio
async def test_primary_decoder_success():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "make": "Toyota", "model": "Camry", "year": 2020,
        "engineSize": "2.5L", "transmission": "Automatic",
        "bodyType": "Sedan", "fuelType": "Gasoline",
    }

    with patch("app.services.vin_service.httpx.AsyncClient") as mock_client:
        instance = AsyncMock()
        instance.get = AsyncMock(return_value=mock_response)
        instance.__aenter__ = AsyncMock(return_value=instance)
        instance.__aexit__ = AsyncMock(return_value=None)
        mock_client.return_value = instance

        result = await decode_vin_primary("1HGCM82633A004352")
        assert result is not None
        assert result["make"] == "Toyota"


@pytest.mark.asyncio
async def test_primary_decoder_failure_falls_to_nhtsa():
    """When primary fails, fallback should be attempted."""
    with patch("app.services.vin_service.decode_vin_primary", AsyncMock(return_value=None)):
        with patch("app.services.vin_service.decode_vin_fallback", AsyncMock(return_value={"make": "Honda", "model": "Civic", "year": 2019, "engine_size": "1.5L", "transmission": "CVT", "body_type": "Sedan", "fuel_type": "Gasoline"})):
            result = await decode_vin("1HGCM82633A004352")
            assert result["make"] == "Honda"