from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    market_data_provider: str = "yahoo"
    database_url: str = "sqlite:///./portfolio.db"
    cors_origins: str = "http://127.0.0.1:5173,http://localhost:5173"
    price_stream_symbols: str = "AAPL,MSFT,GOOG"

    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
