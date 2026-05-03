from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.vin_service import decode_vin

router = APIRouter()


class VINRequest(BaseModel):
    vin: str


class VINResponse(BaseModel):
    make: str
    model: str
    year: int | None
    engine_size: str
    transmission: str
    body_type: str
    fuel_type: str


@router.post("/decode", response_model=VINResponse)
async def decode(req: VINRequest):
    try:
        result = await decode_vin(req.vin)
        return VINResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))