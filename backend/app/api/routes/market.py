"""Market data endpoints"""

from fastapi import APIRouter, Query, Path, HTTPException
from typing import Optional, List
from datetime import datetime, timedelta
from enum import Enum

from app.services.market.data_fetcher import MarketDataFetcher
from app.services.market.correlation import CorrelationAnalyzer
from app.models.schemas import (
    MarketType,
    PriceResponse,
    HistoricalDataResponse,
    CorrelationResponse,
)

router = APIRouter()


@router.get("/{symbol}/price", response_model=PriceResponse)
async def get_current_price(
    symbol: str = Path(..., description="Asset symbol (e.g., BTC, AAPL, GOLD)"),
    market: MarketType = Query(..., description="Market type"),
):
    """
    Get the current price of an asset.
    """
    fetcher = MarketDataFetcher()

    try:
        price_data = await fetcher.get_current_price(symbol.upper(), market.value)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not fetch price for {symbol}: {str(e)}")

    return PriceResponse(
        symbol=symbol.upper(),
        market=market.value,
        timestamp=datetime.utcnow(),
        **price_data,
    )


@router.get("/{symbol}/history", response_model=HistoricalDataResponse)
async def get_historical_data(
    symbol: str = Path(..., description="Asset symbol"),
    market: MarketType = Query(..., description="Market type"),
    days: int = Query(30, ge=1, le=365, description="Number of days of history"),
    interval: str = Query("1d", description="Data interval (1h, 4h, 1d, 1w)"),
):
    """
    Get historical price data for an asset.
    """
    fetcher = MarketDataFetcher()

    try:
        history = await fetcher.get_historical_data(
            symbol.upper(),
            market.value,
            days=days,
            interval=interval,
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not fetch history for {symbol}: {str(e)}")

    return HistoricalDataResponse(
        symbol=symbol.upper(),
        market=market.value,
        interval=interval,
        data=history,
        count=len(history),
    )


@router.get("/{symbol}/correlation")
async def get_astro_correlation(
    symbol: str = Path(..., description="Asset symbol"),
    market: MarketType = Query(..., description="Market type"),
    planet: Optional[str] = Query(None, description="Specific planet to analyze"),
    aspect: Optional[str] = Query(None, description="Specific aspect type"),
    days: int = Query(365, ge=30, le=1825, description="Historical days to analyze"),
):
    """
    Analyze correlation between astrological events and price movements.

    Shows how specific planetary configurations have historically
    correlated with price changes for this asset.
    """
    analyzer = CorrelationAnalyzer()

    correlations = await analyzer.analyze_correlations(
        symbol=symbol.upper(),
        market=market.value,
        planet=planet,
        aspect=aspect,
        days=days,
    )

    return CorrelationResponse(
        symbol=symbol.upper(),
        market=market.value,
        analysis_period_days=days,
        correlations=correlations,
    )


@router.get("/assets/{market_type}")
async def get_available_assets(
    market_type: MarketType,
):
    """
    Get list of available assets for a market type.
    """
    fetcher = MarketDataFetcher()
    assets = fetcher.get_available_assets(market_type.value)

    return {
        "market": market_type.value,
        "assets": assets,
        "count": len(assets),
    }


@router.get("/trending")
async def get_trending_assets(
    market: Optional[MarketType] = None,
    limit: int = Query(10, ge=1, le=50),
):
    """
    Get trending assets across markets.
    """
    fetcher = MarketDataFetcher()
    trending = await fetcher.get_trending_assets(
        market=market.value if market else None,
        limit=limit,
    )

    return {
        "market": market.value if market else "all",
        "trending": trending,
        "count": len(trending),
    }


@router.get("/{symbol}/natal-chart")
async def get_asset_natal_chart(
    symbol: str = Path(..., description="Asset symbol"),
    market: MarketType = Query(..., description="Market type"),
):
    """
    Get the "birth chart" of an asset based on its launch/IPO date.

    For crypto: genesis block or ICO date
    For stocks: IPO date
    For commodities: Uses a default reference date
    """
    from app.services.astrology.calculator import AstrologyCalculator

    fetcher = MarketDataFetcher()
    birth_date = fetcher.get_asset_birth_date(symbol.upper(), market.value)

    if not birth_date:
        raise HTTPException(
            status_code=404,
            detail=f"Birth date not found for {symbol}"
        )

    calculator = AstrologyCalculator(system="western")
    natal_chart = calculator.get_all_positions(birth_date)

    return {
        "symbol": symbol.upper(),
        "market": market.value,
        "birth_date": birth_date,
        "natal_chart": natal_chart,
    }


@router.get("/{symbol}/transits-to-natal")
async def get_transits_to_natal(
    symbol: str = Path(..., description="Asset symbol"),
    market: MarketType = Query(..., description="Market type"),
    system: str = Query("western", description="Astrology system"),
):
    """
    Get current planetary transits to the asset's natal chart.

    Shows how current planetary positions aspect the asset's birth chart.
    """
    from app.services.astrology.calculator import AstrologyCalculator
    from app.services.astrology.aspects import AspectCalculator

    fetcher = MarketDataFetcher()
    birth_date = fetcher.get_asset_birth_date(symbol.upper(), market.value)

    if not birth_date:
        raise HTTPException(
            status_code=404,
            detail=f"Birth date not found for {symbol}"
        )

    calculator = AstrologyCalculator(system=system)
    natal_positions = calculator.get_all_positions(birth_date)
    current_positions = calculator.get_all_positions()

    aspect_calc = AspectCalculator()
    transits = aspect_calc.find_transits_to_natal(current_positions, natal_positions)

    return {
        "symbol": symbol.upper(),
        "market": market.value,
        "system": system,
        "birth_date": birth_date,
        "transits": transits,
        "count": len(transits),
    }
