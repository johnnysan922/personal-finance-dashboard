from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.providers import get_market_data_provider

router = APIRouter()


@router.get("/prices/{symbol}")
def get_price(symbol: str) -> dict:
    sym = symbol.strip().upper()
    if not sym:
        raise HTTPException(status_code=400, detail="Invalid symbol")
    try:
        q = get_market_data_provider().get_quote(sym)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    return {
        "symbol": q.symbol,
        "price": q.price,
        "currency": q.currency,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
