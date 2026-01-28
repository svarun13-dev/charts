"""Application configuration settings"""

from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # App settings
    app_name: str = "AstroTrader"
    app_version: str = "1.0.0"
    debug: bool = True

    # API settings
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = "sqlite+aiosqlite:///./astrotrader.db"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Market Data API Keys (optional - uses free APIs by default)
    alpha_vantage_api_key: Optional[str] = None
    coinmarketcap_api_key: Optional[str] = None

    # Ayanamsa for Vedic calculations (Lahiri is most common)
    vedic_ayanamsa: str = "lahiri"

    # Signal settings
    signal_check_interval: int = 300  # seconds
    aspect_orb_default: float = 8.0  # degrees

    # Cache settings
    cache_ttl: int = 60  # seconds

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
