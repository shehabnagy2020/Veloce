import httpx

from app.config import settings

AUTO_DEV_URL = "https://auto.dev/api/vin"
NHTSA_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues"


async def decode_vin_primary(vin: str) -> dict | None:
    """Decode VIN via Auto.dev (primary). Returns vehicle specs or None."""
    if not settings.auto_dev_api_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{AUTO_DEV_URL}/{vin}",
                headers={"Authorization": f"Bearer {settings.auto_dev_api_key}"},
            )
            if resp.status_code != 200:
                return None
            data = resp.json()
            return {
                "make": data.get("make", ""),
                "model": data.get("model", ""),
                "year": int(data.get("year", 0)) if data.get("year") else None,
                "engine_size": data.get("engineSize", ""),
                "transmission": data.get("transmission", ""),
                "body_type": data.get("bodyType", ""),
                "fuel_type": data.get("fuelType", ""),
            }
    except (httpx.HTTPError, ValueError, KeyError):
        return None


async def decode_vin_fallback(vin: str) -> dict | None:
    """Decode VIN via NHTSA vPIC (fallback, free, US-market only)."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                NHTSA_URL,
                params={"vin": vin, "format": "json"},
            )
            if resp.status_code != 200:
                return None
            results = resp.json().get("Results", [])
            if not results:
                return None

            lookup = {}
            for item in results:
                lookup[item.get("Variable", "")] = item.get("Value", "")

            year_str = lookup.get("Model Year", "")
            return {
                "make": lookup.get("Make", ""),
                "model": lookup.get("Model", ""),
                "year": int(year_str) if year_str and year_str.isdigit() else None,
                "engine_size": lookup.get("Displacement (L)", ""),
                "transmission": lookup.get("Transmission Style", ""),
                "body_type": lookup.get("Body Class", ""),
                "fuel_type": lookup.get("Fuel Type - Primary", ""),
            }
    except (httpx.HTTPError, ValueError, KeyError):
        return None


async def decode_vin(vin: str) -> dict:
    """Decode a VIN using Auto.dev primary + NHTSA fallback.

    Returns vehicle specs dict. Raises ValueError for invalid VIN format.
    """
    if not vin or len(vin) != 17 or not vin.isalnum():
        raise ValueError("Invalid VIN format: must be 17 alphanumeric characters")

    result = await decode_vin_primary(vin)
    if result and result.get("make"):
        return result

    result = await decode_vin_fallback(vin)
    if result and result.get("make"):
        return result

    raise ValueError("VIN not found in decoder databases")