from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

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


@router.get("/prices/snapshot")
def get_price_snapshot(
    symbols: str = Query(
        default="",
        description="Comma-separated symbols, e.g. AAPL,MSFT,GOOG",
    ),
) -> list[dict]:
    parsed = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    if not parsed:
        raise HTTPException(status_code=400, detail="No symbols provided")
    provider = get_market_data_provider()
    out: list[dict] = []
    for sym in parsed:
        try:
            q = provider.get_quote_snapshot(sym)
            out.append(
                {
                    "symbol": q.symbol,
                    "price": q.price,
                    "previousClose": q.previous_close,
                    "currency": q.currency,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            )
        except Exception:
            # Skip failed symbols so one bad ticker does not fail the whole batch.
            continue
    return out
