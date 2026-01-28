"""
Market Data Fetcher

Fetches price data for crypto, stocks, and commodities
from various free and paid APIs.
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import httpx
import asyncio

from app.core.config import settings
from app.core.constants import DEFAULT_ASSETS


class MarketDataFetcher:
    """
    Fetches market data from various sources.

    Supported markets:
    - Crypto: CoinGecko (free), CoinMarketCap (API key)
    - Stocks: Alpha Vantage, Yahoo Finance
    - Commodities: Alpha Vantage, custom sources
    """

    # API endpoints
    COINGECKO_BASE = "https://api.coingecko.com/api/v3"

    # Asset mappings for different APIs
    CRYPTO_IDS = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "SOL": "solana",
        "XRP": "ripple",
        "ADA": "cardano",
        "DOGE": "dogecoin",
        "DOT": "polkadot",
        "MATIC": "matic-network",
        "LINK": "chainlink",
        "AVAX": "avalanche-2",
    }

    # Known asset birth dates (for natal charts)
    ASSET_BIRTH_DATES = {
        # Crypto - genesis block or significant launch dates
        "BTC": datetime(2009, 1, 3, 18, 15, 5),  # Bitcoin genesis block
        "ETH": datetime(2015, 7, 30, 15, 26, 13),  # Ethereum genesis
        "SOL": datetime(2020, 3, 16),  # Solana mainnet beta
        "XRP": datetime(2012, 1, 1),  # XRP launch (approximate)
        "ADA": datetime(2017, 9, 29),  # Cardano mainnet
        "DOGE": datetime(2013, 12, 6),  # Dogecoin launch

        # Stocks - IPO dates
        "AAPL": datetime(1980, 12, 12),
        "MSFT": datetime(1986, 3, 13),
        "GOOGL": datetime(2004, 8, 19),
        "AMZN": datetime(1997, 5, 15),
        "TSLA": datetime(2010, 6, 29),
        "META": datetime(2012, 5, 18),
        "NVDA": datetime(1999, 1, 22),

        # Commodities - use standard reference dates
        "GOLD": datetime(1971, 8, 15),  # End of gold standard
        "SILVER": datetime(1971, 8, 15),
        "OIL": datetime(1983, 3, 30),  # NYMEX crude oil futures
    }

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def get_current_price(
        self,
        symbol: str,
        market: str
    ) -> Dict[str, Any]:
        """
        Get current price for an asset.

        Args:
            symbol: Asset symbol (e.g., BTC, AAPL)
            market: Market type (crypto, stocks, commodities)

        Returns:
            Price data dictionary
        """
        if market == "crypto":
            return await self._get_crypto_price(symbol)
        elif market == "stocks":
            return await self._get_stock_price(symbol)
        elif market == "commodities":
            return await self._get_commodity_price(symbol)
        else:
            raise ValueError(f"Unknown market: {market}")

    async def _get_crypto_price(self, symbol: str) -> Dict[str, Any]:
        """Fetch crypto price from CoinGecko"""
        coin_id = self.CRYPTO_IDS.get(symbol.upper(), symbol.lower())

        try:
            response = await self.client.get(
                f"{self.COINGECKO_BASE}/simple/price",
                params={
                    "ids": coin_id,
                    "vs_currencies": "usd",
                    "include_24hr_change": "true",
                    "include_24hr_vol": "true",
                }
            )
            response.raise_for_status()
            data = response.json()

            if coin_id in data:
                coin_data = data[coin_id]
                return {
                    "price": coin_data.get("usd", 0),
                    "change_24h": coin_data.get("usd_24h_change"),
                    "change_percent_24h": coin_data.get("usd_24h_change"),
                    "volume_24h": coin_data.get("usd_24h_vol"),
                }
        except Exception as e:
            print(f"Error fetching crypto price: {e}")

        # Return mock data if API fails
        return self._get_mock_price(symbol, "crypto")

    async def _get_stock_price(self, symbol: str) -> Dict[str, Any]:
        """Fetch stock price (mock for now - would use Alpha Vantage/Yahoo)"""
        # In production, integrate with Alpha Vantage or Yahoo Finance
        return self._get_mock_price(symbol, "stocks")

    async def _get_commodity_price(self, symbol: str) -> Dict[str, Any]:
        """Fetch commodity price (mock for now)"""
        return self._get_mock_price(symbol, "commodities")

    def _get_mock_price(self, symbol: str, market: str) -> Dict[str, Any]:
        """Generate mock price data for demo purposes"""
        import random

        base_prices = {
            # Crypto
            "BTC": 45000,
            "ETH": 2500,
            "SOL": 100,
            "XRP": 0.55,
            "ADA": 0.45,
            # Stocks
            "AAPL": 175,
            "MSFT": 380,
            "GOOGL": 140,
            "AMZN": 155,
            "TSLA": 250,
            # Commodities
            "GOLD": 2000,
            "SILVER": 23,
            "OIL": 75,
            "NATGAS": 2.5,
        }

        base = base_prices.get(symbol.upper(), 100)
        variation = random.uniform(-0.05, 0.05)
        price = base * (1 + variation)

        return {
            "price": round(price, 2),
            "change_24h": round(price * random.uniform(-0.03, 0.03), 2),
            "change_percent_24h": round(random.uniform(-3, 3), 2),
            "volume_24h": round(random.uniform(1000000, 100000000), 0),
        }

    async def get_historical_data(
        self,
        symbol: str,
        market: str,
        days: int = 30,
        interval: str = "1d"
    ) -> List[Dict[str, Any]]:
        """
        Get historical OHLCV data.

        Args:
            symbol: Asset symbol
            market: Market type
            days: Number of days of history
            interval: Data interval

        Returns:
            List of OHLCV data points
        """
        if market == "crypto":
            return await self._get_crypto_history(symbol, days)
        else:
            return self._get_mock_history(symbol, days)

    async def _get_crypto_history(
        self,
        symbol: str,
        days: int
    ) -> List[Dict[str, Any]]:
        """Fetch crypto historical data from CoinGecko"""
        coin_id = self.CRYPTO_IDS.get(symbol.upper(), symbol.lower())

        try:
            response = await self.client.get(
                f"{self.COINGECKO_BASE}/coins/{coin_id}/ohlc",
                params={"vs_currency": "usd", "days": str(days)}
            )
            response.raise_for_status()
            data = response.json()

            history = []
            for candle in data:
                history.append({
                    "timestamp": datetime.fromtimestamp(candle[0] / 1000),
                    "open": candle[1],
                    "high": candle[2],
                    "low": candle[3],
                    "close": candle[4],
                    "volume": None,
                })

            return history
        except Exception as e:
            print(f"Error fetching crypto history: {e}")
            return self._get_mock_history(symbol, days)

    def _get_mock_history(
        self,
        symbol: str,
        days: int
    ) -> List[Dict[str, Any]]:
        """Generate mock historical data"""
        import random

        history = []
        now = datetime.utcnow()

        base_prices = {
            "BTC": 45000, "ETH": 2500, "SOL": 100, "XRP": 0.55,
            "AAPL": 175, "MSFT": 380, "GOLD": 2000, "OIL": 75,
        }
        price = base_prices.get(symbol.upper(), 100)

        for i in range(days, 0, -1):
            date = now - timedelta(days=i)
            daily_change = random.uniform(-0.03, 0.03)
            price = price * (1 + daily_change)

            high = price * (1 + random.uniform(0, 0.02))
            low = price * (1 - random.uniform(0, 0.02))
            open_price = random.uniform(low, high)
            close = random.uniform(low, high)

            history.append({
                "timestamp": date,
                "open": round(open_price, 2),
                "high": round(high, 2),
                "low": round(low, 2),
                "close": round(close, 2),
                "volume": round(random.uniform(1000000, 50000000), 0),
            })

        return history

    def get_available_assets(self, market: str) -> List[Dict[str, str]]:
        """Get list of available assets for a market"""
        assets = DEFAULT_ASSETS.get(market, [])

        return [
            {"symbol": asset, "name": self._get_asset_name(asset)}
            for asset in assets
        ]

    def _get_asset_name(self, symbol: str) -> str:
        """Get full name for asset symbol"""
        names = {
            "BTC": "Bitcoin", "ETH": "Ethereum", "SOL": "Solana",
            "XRP": "XRP", "ADA": "Cardano", "DOGE": "Dogecoin",
            "AAPL": "Apple Inc.", "MSFT": "Microsoft", "GOOGL": "Alphabet",
            "AMZN": "Amazon", "TSLA": "Tesla", "META": "Meta Platforms",
            "GOLD": "Gold", "SILVER": "Silver", "OIL": "Crude Oil",
            "NATGAS": "Natural Gas",
        }
        return names.get(symbol.upper(), symbol)

    async def get_trending_assets(
        self,
        market: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get trending assets"""
        # In production, would fetch actual trending data
        # For now, return top assets by market cap

        if market == "crypto":
            try:
                response = await self.client.get(
                    f"{self.COINGECKO_BASE}/search/trending"
                )
                response.raise_for_status()
                data = response.json()

                trending = []
                for coin in data.get("coins", [])[:limit]:
                    item = coin.get("item", {})
                    trending.append({
                        "symbol": item.get("symbol", "").upper(),
                        "name": item.get("name"),
                        "market_cap_rank": item.get("market_cap_rank"),
                    })
                return trending
            except Exception:
                pass

        # Default trending list
        return [
            {"symbol": asset, "name": self._get_asset_name(asset)}
            for asset in DEFAULT_ASSETS.get(market or "crypto", [])[:limit]
        ]

    def get_asset_birth_date(
        self,
        symbol: str,
        market: str
    ) -> Optional[datetime]:
        """Get the birth date of an asset for natal chart calculations"""
        return self.ASSET_BIRTH_DATES.get(symbol.upper())

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
