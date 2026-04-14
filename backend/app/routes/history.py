from fastapi import APIRouter, HTTPException, Query

from app.providers import get_market_data_provider

router = APIRouter()


@router.get("/history/{symbol}")
def get_history(
    symbol: str,
    period: str = Query(default="1d", description="yfinance period, e.g. 1d, 5d, 1mo"),
) -> list[dict]:
    sym = symbol.strip().upper()
    if not sym:
        raise HTTPException(status_code=400, detail="Invalid symbol")
    try:
        candles = get_market_data_provider().get_history(sym, period)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    return [c.model_dump() for c in candles]
