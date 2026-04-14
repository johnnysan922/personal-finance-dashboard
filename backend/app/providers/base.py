from typing import Optional, Protocol

from pydantic import BaseModel


class Quote(BaseModel):
    symbol: str
    price: float
    currency: Optional[str] = None


class Candle(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: Optional[float] = None


class MarketDataProvider(Protocol):
    def get_quote(self, symbol: str) -> Quote: ...

    def get_history(self, symbol: str, period: str) -> list[Candle]: ...
