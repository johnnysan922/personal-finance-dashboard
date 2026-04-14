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
