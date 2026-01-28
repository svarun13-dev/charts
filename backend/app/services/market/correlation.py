"""
Correlation Analyzer

Analyzes correlations between astrological events and price movements.
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from app.services.astrology.calculator import AstrologyCalculator
from app.services.astrology.aspects import AspectCalculator
from app.services.market.data_fetcher import MarketDataFetcher


class CorrelationAnalyzer:
    """
    Analyzes historical correlations between astrological events
    and market price movements.

    This helps identify which planetary configurations have historically
    been associated with specific market behaviors.
    """

    def __init__(self):
        self.calculator = AstrologyCalculator()
        self.aspect_calc = AspectCalculator()
        self.data_fetcher = MarketDataFetcher()

    async def analyze_correlations(
        self,
        symbol: str,
        market: str,
        planet: Optional[str] = None,
        aspect: Optional[str] = None,
        days: int = 365
    ) -> List[Dict[str, Any]]:
        """
        Analyze correlations between astrological events and price movements.

        Args:
            symbol: Asset symbol
            market: Market type
            planet: Optional specific planet to analyze
            aspect: Optional specific aspect type
            days: Historical period to analyze

        Returns:
            List of correlation findings
        """
        # Get historical price data
        history = await self.data_fetcher.get_historical_data(
            symbol, market, days=days
        )

        if len(history) < 30:
            return [{
                "event_type": "insufficient_data",
                "message": "Not enough historical data for correlation analysis"
            }]

        correlations = []

        # Analyze retrograde correlations
        retro_corr = self._analyze_retrograde_correlations(history, planet)
        if retro_corr:
            correlations.extend(retro_corr)

        # Analyze aspect correlations
        aspect_corr = self._analyze_aspect_correlations(history, planet, aspect)
        if aspect_corr:
            correlations.extend(aspect_corr)

        # Analyze lunar correlations
        lunar_corr = self._analyze_lunar_correlations(history)
        if lunar_corr:
            correlations.extend(lunar_corr)

        # Sort by significance
        correlations.sort(
            key=lambda x: abs(x.get("avg_price_change", 0)),
            reverse=True
        )

        return correlations

    def _analyze_retrograde_correlations(
        self,
        history: List[Dict[str, Any]],
        planet: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Analyze how retrograde periods correlate with price changes"""
        correlations = []
        planets_to_check = [planet] if planet else ["mercury", "venus", "mars"]

        for p in planets_to_check:
            retro_periods = []
            non_retro_periods = []

            for i, candle in enumerate(history[:-1]):
                timestamp = candle["timestamp"]
                positions = self.calculator.get_all_positions(timestamp)

                planet_pos = next(
                    (pos for pos in positions if pos["planet"] == p),
                    None
                )

                if planet_pos:
                    price_change = (
                        (history[i + 1]["close"] - candle["close"])
                        / candle["close"] * 100
                    )

                    if planet_pos.get("retrograde"):
                        retro_periods.append(price_change)
                    else:
                        non_retro_periods.append(price_change)

            if retro_periods and non_retro_periods:
                avg_retro = sum(retro_periods) / len(retro_periods)
                avg_non_retro = sum(non_retro_periods) / len(non_retro_periods)

                correlations.append({
                    "event_type": f"{p}_retrograde",
                    "occurrences": len(retro_periods),
                    "avg_price_change": round(avg_retro, 3),
                    "avg_non_event_change": round(avg_non_retro, 3),
                    "positive_correlation": round(
                        sum(1 for x in retro_periods if x > 0) / len(retro_periods),
                        3
                    ),
                    "negative_correlation": round(
                        sum(1 for x in retro_periods if x < 0) / len(retro_periods),
                        3
                    ),
                    "neutral": round(
                        sum(1 for x in retro_periods if x == 0) / len(retro_periods),
                        3
                    ),
                    "significance": self._calculate_significance(
                        avg_retro, avg_non_retro, len(retro_periods)
                    ),
                })

        return correlations

    def _analyze_aspect_correlations(
        self,
        history: List[Dict[str, Any]],
        planet: Optional[str] = None,
        aspect_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Analyze how specific aspects correlate with price changes"""
        correlations = []
        aspect_types = [aspect_type] if aspect_type else [
            "conjunction", "opposition", "square", "trine"
        ]

        for a_type in aspect_types:
            aspect_periods = []

            for i, candle in enumerate(history[:-1]):
                timestamp = candle["timestamp"]
                positions = self.calculator.get_all_positions(timestamp)
                aspects = self.aspect_calc.find_all_aspects(positions)

                # Filter aspects
                relevant_aspects = [
                    asp for asp in aspects
                    if asp["aspect_type"] == a_type
                    and (not planet or planet in [asp["planet1"], asp["planet2"]])
                ]

                if relevant_aspects:
                    price_change = (
                        (history[i + 1]["close"] - candle["close"])
                        / candle["close"] * 100
                    )
                    aspect_periods.append({
                        "change": price_change,
                        "aspects": relevant_aspects,
                    })

            if aspect_periods:
                changes = [p["change"] for p in aspect_periods]
                avg_change = sum(changes) / len(changes)

                correlations.append({
                    "event_type": f"{a_type}_aspect",
                    "occurrences": len(aspect_periods),
                    "avg_price_change": round(avg_change, 3),
                    "positive_correlation": round(
                        sum(1 for x in changes if x > 0) / len(changes),
                        3
                    ),
                    "negative_correlation": round(
                        sum(1 for x in changes if x < 0) / len(changes),
                        3
                    ),
                    "neutral": round(
                        sum(1 for x in changes if abs(x) < 0.1) / len(changes),
                        3
                    ),
                    "significance": "moderate" if len(aspect_periods) > 10 else "low",
                })

        return correlations

    def _analyze_lunar_correlations(
        self,
        history: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze lunar cycle correlations"""
        from app.services.astrology.moon import MoonCalculator

        moon_calc = MoonCalculator()
        correlations = []

        phase_changes = {
            "new_moon": [],
            "full_moon": [],
            "first_quarter": [],
            "last_quarter": [],
        }

        for i, candle in enumerate(history[:-1]):
            timestamp = candle["timestamp"]
            phase = moon_calc.get_current_phase(timestamp)

            price_change = (
                (history[i + 1]["close"] - candle["close"])
                / candle["close"] * 100
            )

            phase_name = phase["phase_name"].lower().replace(" ", "_")
            if phase_name in phase_changes:
                phase_changes[phase_name].append(price_change)

        for phase_name, changes in phase_changes.items():
            if changes:
                avg_change = sum(changes) / len(changes)
                correlations.append({
                    "event_type": phase_name,
                    "occurrences": len(changes),
                    "avg_price_change": round(avg_change, 3),
                    "positive_correlation": round(
                        sum(1 for x in changes if x > 0) / len(changes),
                        3
                    ),
                    "negative_correlation": round(
                        sum(1 for x in changes if x < 0) / len(changes),
                        3
                    ),
                    "neutral": round(
                        sum(1 for x in changes if abs(x) < 0.1) / len(changes),
                        3
                    ),
                    "significance": "moderate",
                })

        return correlations

    def _calculate_significance(
        self,
        event_avg: float,
        non_event_avg: float,
        sample_size: int
    ) -> str:
        """Calculate statistical significance of a correlation"""
        diff = abs(event_avg - non_event_avg)

        if sample_size < 5:
            return "insufficient_data"
        elif sample_size < 20:
            if diff > 1.0:
                return "moderate"
            return "low"
        else:
            if diff > 1.5:
                return "high"
            elif diff > 0.5:
                return "moderate"
            return "low"

    async def get_best_trading_days(
        self,
        symbol: str,
        market: str,
        days_ahead: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Identify potentially favorable trading days based on
        historical correlations.

        Args:
            symbol: Asset symbol
            market: Market type
            days_ahead: Days to forecast

        Returns:
            List of days with their astrological favorability
        """
        best_days = []
        now = datetime.utcnow()

        for day in range(days_ahead):
            check_date = now + timedelta(days=day)
            positions = self.calculator.get_all_positions(check_date)
            aspects = self.aspect_calc.find_all_aspects(positions)

            # Score the day based on aspects
            score = 0
            factors = []

            for aspect in aspects:
                if aspect["nature"] == "harmonious":
                    score += aspect["strength"]
                    factors.append(f"{aspect['planet1']}-{aspect['planet2']} {aspect['aspect_type']} (+)")
                elif aspect["nature"] == "challenging":
                    score -= aspect["strength"] * 0.5
                    factors.append(f"{aspect['planet1']}-{aspect['planet2']} {aspect['aspect_type']} (-)")

            # Check for retrogrades
            for pos in positions:
                if pos.get("retrograde") and pos["planet"] in ["mercury", "venus", "mars"]:
                    score -= 3
                    factors.append(f"{pos['planet']} retrograde (-)")

            if score > 5 or score < -5:  # Only include notable days
                best_days.append({
                    "date": check_date,
                    "score": round(score, 1),
                    "outlook": "favorable" if score > 0 else "cautious",
                    "factors": factors[:5],
                })

        # Sort by absolute score
        best_days.sort(key=lambda x: abs(x["score"]), reverse=True)

        return best_days[:10]
