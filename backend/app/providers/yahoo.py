from datetime import datetime, timezone
from typing import Optional

import yfinance as yf

from app.providers.base import Candle, MarketDataProvider, Quote


class YahooProvider:
    """Yahoo Finance via `yfinance` (ADR 0001). Swap for Alpaca/Polygon later."""

    def get_quote(self, symbol: str) -> Quote:
        t = yf.Ticker(symbol)
        price = t.fast_info.get("last_price") or t.info.get("currentPrice")
        if price is None:
            hist = t.history(period="1d")
            if hist.empty:
                raise ValueError(f"No price for {symbol!r}")
            price = float(hist["Close"].iloc[-1])
        cur = t.fast_info.get("currency") or t.info.get("currency")
        return Quote(symbol=symbol.upper(), price=float(price), currency=cur)

    def get_history(self, symbol: str, period: str) -> list[Candle]:
        t = yf.Ticker(symbol)
        df = t.history(period=period or "1d", interval="5m", auto_adjust=True)
        if df.empty:
            return []
        out: list[Candle] = []
        for idx, row in df.iterrows():
            ts = idx
            if hasattr(ts, "to_pydatetime"):
                ts = ts.to_pydatetime()
            if isinstance(ts, datetime) and ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            time_str = ts.isoformat() if isinstance(ts, datetime) else str(idx)
            vol_raw = row["Volume"] if "Volume" in row else None
            vol: Optional[float]
            if vol_raw is None or (isinstance(vol_raw, float) and vol_raw != vol_raw):
                vol = None
            else:
                try:
                    vol = float(vol_raw)
                except (TypeError, ValueError):
                    vol = None

            out.append(
                Candle(
                    time=time_str,
                    open=float(row["Open"]),
                    high=float(row["High"]),
                    low=float(row["Low"]),
                    close=float(row["Close"]),
                    volume=vol,
                )
            )
        return out


def get_provider() -> MarketDataProvider:
    return YahooProvider()
