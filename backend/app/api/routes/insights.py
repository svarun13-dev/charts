"""
Insights API Routes

Provides cosmic sentiment, recommendations, and actionable trading insights.
"""

from fastapi import APIRouter, Query
from datetime import datetime
from typing import Optional

from app.services.astrology.calculator import AstrologyCalculator
from app.services.astrology.aspects import AspectCalculator
from app.services.astrology.moon import MoonCalculator
from app.services.signals.generator import SignalGenerator, format_planet_name
from app.core.constants import PLANETS

router = APIRouter()


def calculate_cosmic_sentiment(
    aspects: list,
    retrogrades: list,
    moon_phase: dict
) -> dict:
    """
    Calculate overall cosmic sentiment based on current configurations.

    Returns a score from -100 (very bearish) to +100 (very bullish)
    and categorized sentiment.
    """
    score = 0
    factors = []

    # Analyze aspects
    for aspect in aspects:
        nature = aspect.get("nature", "neutral")
        strength = aspect.get("strength", 5)
        p1 = format_planet_name(aspect.get("planet1", ""))
        p2 = format_planet_name(aspect.get("planet2", ""))

        if nature == "harmonious":
            points = strength * 2
            score += points
            factors.append({
                "factor": f"{p1}-{p2} {aspect['aspect_type']}",
                "impact": "positive",
                "points": points,
                "description": "Harmonious energy supports growth"
            })
        elif nature == "challenging":
            points = strength * 1.5
            score -= points
            factors.append({
                "factor": f"{p1}-{p2} {aspect['aspect_type']}",
                "impact": "negative",
                "points": -points,
                "description": "Challenging aspect creates tension"
            })

    # Analyze retrogrades
    for retro in retrogrades:
        planet = retro.get("planet", "")
        if planet == "mercury":
            score -= 15
            factors.append({
                "factor": "Mercury Retrograde",
                "impact": "negative",
                "points": -15,
                "description": "Communication & tech issues likely"
            })
        elif planet == "venus":
            score -= 10
            factors.append({
                "factor": "Venus Retrograde",
                "impact": "negative",
                "points": -10,
                "description": "Financial matters may face delays"
            })
        elif planet == "mars":
            score -= 8
            factors.append({
                "factor": "Mars Retrograde",
                "impact": "negative",
                "points": -8,
                "description": "Momentum and action stalled"
            })

    # Analyze moon phase
    phase_name = moon_phase.get("phase_name", "")
    if phase_name == "Full Moon":
        factors.append({
            "factor": "Full Moon",
            "impact": "volatile",
            "points": 0,
            "description": "Peak energy - watch for reversals"
        })
    elif phase_name == "New Moon":
        factors.append({
            "factor": "New Moon",
            "impact": "neutral",
            "points": 0,
            "description": "New cycle beginning"
        })
    elif "Waxing" in phase_name:
        score += 5
        factors.append({
            "factor": phase_name,
            "impact": "positive",
            "points": 5,
            "description": "Growing energy supports building"
        })
    elif "Waning" in phase_name:
        score -= 3
        factors.append({
            "factor": phase_name,
            "impact": "neutral",
            "points": -3,
            "description": "Releasing energy - time to consolidate"
        })

    # Clamp score to -100 to 100
    score = max(-100, min(100, score))

    # Determine sentiment category
    if score >= 30:
        sentiment = "bullish"
        emoji = "🟢"
    elif score >= 10:
        sentiment = "slightly_bullish"
        emoji = "🟡"
    elif score <= -30:
        sentiment = "bearish"
        emoji = "🔴"
    elif score <= -10:
        sentiment = "slightly_bearish"
        emoji = "🟠"
    else:
        sentiment = "neutral"
        emoji = "⚪"

    # Check for high volatility conditions
    volatility = "low"
    if any(r.get("planet") == "mercury" for r in retrogrades):
        volatility = "high"
    elif len([a for a in aspects if a.get("nature") == "challenging"]) >= 2:
        volatility = "elevated"
    elif phase_name in ["Full Moon", "New Moon"]:
        volatility = "elevated"

    return {
        "score": round(score),
        "sentiment": sentiment,
        "emoji": emoji,
        "volatility": volatility,
        "factors": sorted(factors, key=lambda x: abs(x["points"]), reverse=True)[:8]
    }


def generate_recommendations(
    sentiment: dict,
    aspects: list,
    retrogrades: list,
    moon_phase: dict,
    market: Optional[str] = None
) -> dict:
    """Generate actionable recommendations based on current cosmic weather."""

    recommendations = {
        "overall_action": "",
        "do": [],
        "avoid": [],
        "watch": [],
        "market_specific": {}
    }

    score = sentiment["score"]
    volatility = sentiment["volatility"]

    # Overall action
    if score >= 30:
        recommendations["overall_action"] = "Favorable conditions for growth. Consider expanding positions."
    elif score >= 10:
        recommendations["overall_action"] = "Mildly positive conditions. Proceed with calculated optimism."
    elif score <= -30:
        recommendations["overall_action"] = "Challenging conditions. Focus on capital preservation."
    elif score <= -10:
        recommendations["overall_action"] = "Exercise caution. Reduce exposure and wait for clarity."
    else:
        recommendations["overall_action"] = "Mixed signals. Stay nimble and avoid major commitments."

    # Things to DO
    if score > 0:
        recommendations["do"].append("Review existing positions for scaling opportunities")
    if volatility == "low":
        recommendations["do"].append("Execute planned trades with normal position sizes")
    if "Waxing" in moon_phase.get("phase_name", ""):
        recommendations["do"].append("Initiate new positions aligned with your strategy")

    # Always good advice
    recommendations["do"].append("Set stop-losses on all open positions")
    recommendations["do"].append("Review your risk management parameters")

    # Things to AVOID
    mercury_retro = any(r.get("planet") == "mercury" for r in retrogrades)
    if mercury_retro:
        recommendations["avoid"].append("Signing contracts or making major commitments")
        recommendations["avoid"].append("Launching new trading systems or strategies")
        recommendations["avoid"].append("Making impulsive decisions based on news")

    if volatility in ["high", "elevated"]:
        recommendations["avoid"].append("Overleveraging or oversizing positions")
        recommendations["avoid"].append("Trading against the trend without confirmation")

    if score < 0:
        recommendations["avoid"].append("FOMO trades or chasing pumps")
        recommendations["avoid"].append("Adding to losing positions")

    # Things to WATCH
    for aspect in aspects[:3]:
        p1 = format_planet_name(aspect.get("planet1", ""))
        p2 = format_planet_name(aspect.get("planet2", ""))
        recommendations["watch"].append(f"{p1}-{p2} {aspect['aspect_type']} forming")

    if moon_phase.get("days_until_full", 99) < 3:
        recommendations["watch"].append("Full Moon approaching - potential reversal point")
    if moon_phase.get("days_until_new", 99) < 3:
        recommendations["watch"].append("New Moon approaching - watch for trend changes")

    # Market-specific advice
    recommendations["market_specific"] = {
        "crypto": {
            "sentiment": "bullish" if score > 10 else "bearish" if score < -10 else "neutral",
            "advice": _get_crypto_advice(score, volatility, mercury_retro)
        },
        "stocks": {
            "sentiment": "bullish" if score > 5 else "bearish" if score < -15 else "neutral",
            "advice": _get_stocks_advice(score, volatility)
        },
        "commodities": {
            "sentiment": "bullish" if score > 0 else "bearish" if score < -5 else "neutral",
            "advice": _get_commodities_advice(score, aspects)
        }
    }

    return recommendations


def _get_crypto_advice(score: int, volatility: str, mercury_retro: bool) -> str:
    if mercury_retro:
        return "High caution advised. Mercury retrograde historically correlates with crypto volatility and flash crashes."
    if volatility == "high":
        return "Expect wild swings. Reduce position sizes and widen stops."
    if score > 20:
        return "Conditions favor crypto. Watch for breakout opportunities in majors."
    if score < -20:
        return "Risk-off environment. Consider reducing exposure or hedging."
    return "Mixed conditions. Focus on BTC/ETH, avoid low-cap speculation."


def _get_stocks_advice(score: int, volatility: str) -> str:
    if volatility == "high":
        return "Elevated volatility expected. Consider protective puts or reduced exposure."
    if score > 15:
        return "Favorable for equities. Growth and tech sectors may outperform."
    if score < -15:
        return "Defensive posture recommended. Consider value stocks and dividends."
    return "Selective approach advised. Focus on quality names with strong fundamentals."


def _get_commodities_advice(score: int, aspects: list) -> str:
    mars_involved = any("mars" in str(a).lower() for a in aspects)
    if mars_involved:
        return "Mars activity suggests energy sector movement. Watch oil and metals."
    if score > 10:
        return "Expansion energy favors commodity bulls. Gold may see demand."
    if score < -10:
        return "Contraction energy. Commodities may face headwinds."
    return "Monitor geopolitical factors alongside planetary indicators."


@router.get("/sentiment")
async def get_cosmic_sentiment(system: str = Query(default="western")):
    """Get current cosmic sentiment and overall market outlook."""
    calculator = AstrologyCalculator(system=system)
    aspect_calc = AspectCalculator()
    moon_calc = MoonCalculator()

    now = datetime.utcnow()

    positions = calculator.get_all_positions(now)
    aspects = aspect_calc.find_all_aspects(positions, min_strength=4)
    retrogrades = calculator.get_retrograde_planets(now)
    moon_phase = moon_calc.get_current_phase(now)

    sentiment = calculate_cosmic_sentiment(aspects, retrogrades, moon_phase)

    return {
        "timestamp": now,
        "system": system,
        "sentiment": sentiment,
        "moon_phase": moon_phase["phase_name"],
        "active_retrogrades": [format_planet_name(r["planet"]) for r in retrogrades],
        "major_aspects": [
            f"{format_planet_name(a['planet1'])}-{format_planet_name(a['planet2'])} {a['aspect_type']}"
            for a in aspects[:5]
        ]
    }


@router.get("/recommendations")
async def get_recommendations(
    system: str = Query(default="western"),
    market: Optional[str] = Query(default=None)
):
    """Get actionable trading recommendations based on current cosmic weather."""
    calculator = AstrologyCalculator(system=system)
    aspect_calc = AspectCalculator()
    moon_calc = MoonCalculator()

    now = datetime.utcnow()

    positions = calculator.get_all_positions(now)
    aspects = aspect_calc.find_all_aspects(positions, min_strength=4)
    retrogrades = calculator.get_retrograde_planets(now)
    moon_phase = moon_calc.get_current_phase(now)

    sentiment = calculate_cosmic_sentiment(aspects, retrogrades, moon_phase)
    recommendations = generate_recommendations(
        sentiment, aspects, retrogrades, moon_phase, market
    )

    return {
        "timestamp": now,
        "system": system,
        "sentiment_score": sentiment["score"],
        "sentiment_label": sentiment["sentiment"],
        "volatility": sentiment["volatility"],
        "recommendations": recommendations,
        "valid_until": now.replace(hour=23, minute=59, second=59),
        "next_update": "Real-time (planetary positions update continuously)"
    }


@router.get("/today")
async def get_todays_outlook(system: str = Query(default="western")):
    """Get complete outlook for today including sentiment, recommendations, and key events."""
    calculator = AstrologyCalculator(system=system)
    aspect_calc = AspectCalculator()
    moon_calc = MoonCalculator()
    signal_gen = SignalGenerator(system=system)

    now = datetime.utcnow()

    positions = calculator.get_all_positions(now)
    aspects = aspect_calc.find_all_aspects(positions, min_strength=4)
    retrogrades = calculator.get_retrograde_planets(now)
    moon_phase = moon_calc.get_current_phase(now)
    active_signals = signal_gen.get_active_signals()

    sentiment = calculate_cosmic_sentiment(aspects, retrogrades, moon_phase)
    recommendations = generate_recommendations(
        sentiment, aspects, retrogrades, moon_phase
    )

    return {
        "date": now.strftime("%Y-%m-%d"),
        "timestamp": now,
        "system": system,
        "headline": _generate_headline(sentiment, retrogrades, moon_phase),
        "sentiment": sentiment,
        "moon": {
            "phase": moon_phase["phase_name"],
            "sign": moon_phase["moon_sign"],
            "illumination": moon_phase["illumination"]
        },
        "retrogrades": [
            {"planet": format_planet_name(r["planet"]), "sign": r["sign"]}
            for r in retrogrades
        ],
        "key_aspects": [
            {
                "aspect": f"{format_planet_name(a['planet1'])}-{format_planet_name(a['planet2'])}",
                "type": a["aspect_type"],
                "nature": a["nature"],
                "strength": a["strength"]
            }
            for a in aspects[:5]
        ],
        "recommendations": recommendations,
        "active_signals_count": len(active_signals),
        "update_info": {
            "frequency": "Real-time",
            "note": "Planetary positions are calculated live. No manual updates needed.",
            "auto_refresh": "Dashboard refreshes every 5 minutes automatically"
        }
    }


def _generate_headline(sentiment: dict, retrogrades: list, moon_phase: dict) -> str:
    """Generate a headline summary for the day."""
    score = sentiment["score"]
    mercury_retro = any(r.get("planet") == "mercury" for r in retrogrades)
    phase = moon_phase.get("phase_name", "")

    if mercury_retro and score < 0:
        return "⚠️ Mercury Retrograde + Challenging Aspects - Trade with Extra Caution"
    if mercury_retro:
        return "⚠️ Mercury Retrograde Active - Double-Check Everything"
    if score >= 30:
        return "🟢 Favorable Cosmic Weather - Conditions Support Growth"
    if score >= 10:
        return "🟡 Mildly Positive Outlook - Proceed with Optimism"
    if score <= -30:
        return "🔴 Challenging Day Ahead - Focus on Risk Management"
    if score <= -10:
        return "🟠 Mixed Signals - Exercise Caution"
    if "Full Moon" in phase:
        return "🌕 Full Moon Energy - Watch for Emotional Extremes"
    if "New Moon" in phase:
        return "🌑 New Moon - Fresh Starts & New Cycles"
    return "⚪ Neutral Conditions - Stay Flexible"
