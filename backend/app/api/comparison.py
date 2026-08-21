"""TravelSphere transport comparison routes."""

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..services.comparison import compare_options

router = APIRouter(prefix="/transport", tags=["transport"])


class ComparisonRequest(BaseModel):
    options: list[dict[str, Any]] = Field(..., description="Normalized transport options")
    profile: str | None = Field(None, description="Preference profile")


class ComparisonResponse(BaseModel):
    cheapest: dict[str, Any] | None
    fastest: dict[str, Any] | None
    best_value: dict[str, Any] | None
    best_comfort: dict[str, Any] | None
    best_convenience: dict[str, Any] | None
    ranked: list[dict[str, Any]]


@router.post("/compare", response_model=ComparisonResponse)
async def compare_transport(request: ComparisonRequest):
    """Compare transport options deterministically."""
    if not request.options:
        raise HTTPException(status_code=400, detail="No options provided for comparison")

    result = compare_options(request.options, profile=request.profile)
    return ComparisonResponse(**result)
