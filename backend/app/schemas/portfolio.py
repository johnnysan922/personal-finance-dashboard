from typing import Optional

from pydantic import BaseModel, Field


class PositionCreate(BaseModel):
    symbol: str = Field(min_length=1, max_length=32)
    quantity: float = Field(gt=0)
    averageCost: float = Field(gt=0)


class PositionRead(BaseModel):
    id: int
    symbol: str
    quantity: float
    averageCost: float


class PositionUpdate(BaseModel):
    symbol: Optional[str] = Field(default=None, min_length=1, max_length=32)
    quantity: Optional[float] = Field(default=None, gt=0)
    averageCost: Optional[float] = Field(default=None, gt=0)
