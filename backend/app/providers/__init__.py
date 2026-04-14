from app.config import settings
from app.providers.base import MarketDataProvider
from app.providers.yahoo import YahooProvider


def get_market_data_provider() -> MarketDataProvider:
    name = settings.market_data_provider.lower()
    if name == "yahoo":
        return YahooProvider()
    raise NotImplementedError(
        f"MARKET_DATA_PROVIDER={name!r} — implement or set to 'yahoo'.",
    )
