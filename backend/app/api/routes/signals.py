"""Trading signal endpoints"""

from fastapi import APIRouter, Query, Body
from typing import Optional, List
from datetime import datetime
from enum import Enum

from app.services.signals.generator import SignalGenerator
from app.services.signals.rules import SignalRules
from app.models.schemas import (
    SignalResponse,
    SignalHistoryResponse,
    SignalConfigRequest,
    AstrologySystem,
    MarketType,
    SignalStrength,
)

router = APIRouter()


@router.get("/active", response_model=SignalResponse)
async def get_active_signals(
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
    market: Optional[MarketType] = None,
    min_strength: SignalStrength = Query(SignalStrength.MODERATE),
):
    """
    Get currently active trading signals.

    Signals are generated based on planetary configurations and their
    historical correlation with market movements.
    """
    generator = SignalGenerator(system=system.value)
    signals = generator.get_active_signals(
        market=market.value if market else None,
        min_strength=min_strength.value,
    )

    return SignalResponse(
        system=system.value,
        timestamp=datetime.utcnow(),
        signals=signals,
        count=len(signals),
    )


@router.get("/history", response_model=SignalHistoryResponse)
async def get_signal_history(
    days: int = Query(30, ge=1, le=365),
    market: Optional[MarketType] = None,
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
):
    """
    Get historical trading signals and their outcomes.

    Shows past signals and whether the predicted move occurred.
    """
    generator = SignalGenerator(system=system.value)
    history = generator.get_signal_history(
        days=days,
        market=market.value if market else None,
    )

    return SignalHistoryResponse(
        system=system.value,
        days=days,
        signals=history,
        count=len(history),
    )


@router.get("/upcoming")
async def get_upcoming_signals(
    days: int = Query(7, ge=1, le=30),
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
    market: Optional[MarketType] = None,
):
    """
    Get predicted signals for upcoming planetary configurations.

    Based on scheduled aspects, ingresses, and other astrological events.
    """
    generator = SignalGenerator(system=system.value)
    upcoming = generator.get_upcoming_signals(
        days=days,
        market=market.value if market else None,
    )

    return {
        "system": system.value,
        "days_ahead": days,
        "signals": upcoming,
        "count": len(upcoming),
    }


@router.get("/by-aspect/{aspect_type}")
async def get_signals_by_aspect(
    aspect_type: str,
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
):
    """
    Get signals triggered by a specific aspect type.

    Valid aspects: conjunction, sextile, square, trine, opposition
    """
    generator = SignalGenerator(system=system.value)
    signals = generator.get_signals_by_aspect(aspect_type.lower())

    return {
        "aspect": aspect_type,
        "system": system.value,
        "signals": signals,
        "count": len(signals),
    }


@router.get("/by-planet/{planet}")
async def get_signals_by_planet(
    planet: str,
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
):
    """
    Get signals involving a specific planet.

    Shows all active signals where the planet plays a role.
    """
    generator = SignalGenerator(system=system.value)
    signals = generator.get_signals_by_planet(planet.lower())

    return {
        "planet": planet,
        "system": system.value,
        "signals": signals,
        "count": len(signals),
    }


@router.get("/retrograde-alerts")
async def get_retrograde_alerts(
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
):
    """
    Get trading alerts based on retrograde planets.

    Mercury retrograde is infamous, but all planetary retrogrades
    can affect markets in different ways.
    """
    generator = SignalGenerator(system=system.value)
    alerts = generator.get_retrograde_alerts()

    return {
        "system": system.value,
        "timestamp": datetime.utcnow(),
        "alerts": alerts,
        "count": len(alerts),
    }


@router.get("/lunar-signals")
async def get_lunar_signals():
    """
    Get trading signals based on lunar cycles.

    New moons, full moons, and eclipses often correlate with
    market turning points.
    """
    generator = SignalGenerator()
    signals = generator.get_lunar_signals()

    return {
        "timestamp": datetime.utcnow(),
        "signals": signals,
        "count": len(signals),
    }


@router.post("/configure")
async def configure_signals(
    config: SignalConfigRequest = Body(...),
):
    """
    Configure signal generation rules.

    Customize which aspects, planets, and thresholds trigger signals.
    """
    rules = SignalRules()
    rules.update_config(config.model_dump())

    return {
        "status": "updated",
        "config": config.model_dump(),
    }


@router.get("/rules")
async def get_signal_rules():
    """
    Get current signal generation rules.

    Shows which configurations are currently active for signal generation.
    """
    rules = SignalRules()
    return rules.get_current_rules()
