import asyncio
import logging
from datetime import datetime, timezone

from app.config import settings
from app.providers import get_market_data_provider
from app.ws.manager import ConnectionManager

logger = logging.getLogger(__name__)


def _symbols() -> list[str]:
    raw = settings.price_stream_symbols
    if raw.strip():
        return [s.strip().upper() for s in raw.split(",") if s.strip()]
    return ["AAPL", "MSFT", "GOOG"]


async def price_broadcast_loop(manager: ConnectionManager, interval_sec: float = 15.0):
    """Poll Yahoo quotes and broadcast to all WebSocket clients."""
    provider = get_market_data_provider()
    symbols = _symbols()
    while True:
        if manager.client_count == 0:
            await asyncio.sleep(interval_sec)
            continue
        for sym in symbols:
            try:
                q = await asyncio.to_thread(provider.get_quote, sym)
                await manager.broadcast_json(
                    {
                        "symbol": q.symbol,
                        "price": q.price,
                        "currency": q.currency,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    },
                )
            except Exception:
                logger.exception("quote failed for %s", sym)
            await asyncio.sleep(0.05)
        await asyncio.sleep(interval_sec)
