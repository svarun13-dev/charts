"""Planetary position and aspect endpoints"""

from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime
from enum import Enum

from app.services.astrology.calculator import AstrologyCalculator
from app.services.astrology.aspects import AspectCalculator
from app.models.schemas import (
    PlanetaryPositionsResponse,
    AspectsResponse,
    RetrogradeResponse,
    TransitResponse,
    AstrologySystem,
)

router = APIRouter()


@router.get("/positions", response_model=PlanetaryPositionsResponse)
async def get_planetary_positions(
    system: AstrologySystem = Query(AstrologySystem.WESTERN, description="Astrology system to use"),
    timestamp: Optional[datetime] = Query(None, description="Specific timestamp (default: now)"),
):
    """
    Get current planetary positions in all zodiac signs.

    Supports both Western (Tropical) and Vedic (Sidereal) calculations.
    """
    calculator = AstrologyCalculator(system=system.value)
    positions = calculator.get_all_positions(timestamp)

    return PlanetaryPositionsResponse(
        system=system.value,
        timestamp=timestamp or datetime.utcnow(),
        positions=positions,
    )


@router.get("/positions/{planet}")
async def get_single_planet_position(
    planet: str,
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
    timestamp: Optional[datetime] = None,
):
    """Get position of a specific planet"""
    calculator = AstrologyCalculator(system=system.value)
    position = calculator.get_planet_position(planet.lower(), timestamp)

    return {
        "planet": planet,
        "system": system.value,
        "timestamp": timestamp or datetime.utcnow(),
        **position,
    }


@router.get("/aspects", response_model=AspectsResponse)
async def get_current_aspects(
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
    min_strength: int = Query(3, ge=1, le=10, description="Minimum aspect strength"),
    timestamp: Optional[datetime] = None,
):
    """
    Get all active planetary aspects.

    Returns conjunctions, squares, trines, oppositions, and sextiles
    currently in effect.
    """
    calculator = AstrologyCalculator(system=system.value)
    positions = calculator.get_all_positions(timestamp)

    aspect_calc = AspectCalculator()
    aspects = aspect_calc.find_all_aspects(positions, min_strength=min_strength)

    return AspectsResponse(
        system=system.value,
        timestamp=timestamp or datetime.utcnow(),
        aspects=aspects,
        count=len(aspects),
    )


@router.get("/retrogrades", response_model=RetrogradeResponse)
async def get_retrograde_planets(
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
    timestamp: Optional[datetime] = None,
):
    """
    Get all planets currently in retrograde motion.

    Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto
    can all go retrograde. Sun and Moon never retrograde.
    """
    calculator = AstrologyCalculator(system=system.value)
    retrogrades = calculator.get_retrograde_planets(timestamp)

    return RetrogradeResponse(
        system=system.value,
        timestamp=timestamp or datetime.utcnow(),
        retrogrades=retrogrades,
        count=len(retrogrades),
    )


@router.get("/transits/{planet}")
async def get_planet_transits(
    planet: str,
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
    days_ahead: int = Query(30, ge=1, le=365),
):
    """
    Get upcoming sign changes and major aspects for a planet.

    Shows when the planet will enter new signs and form major aspects.
    """
    calculator = AstrologyCalculator(system=system.value)
    transits = calculator.get_upcoming_transits(planet.lower(), days_ahead)

    return TransitResponse(
        planet=planet,
        system=system.value,
        days_ahead=days_ahead,
        transits=transits,
    )


@router.get("/chart")
async def get_full_chart(
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
    timestamp: Optional[datetime] = None,
    include_aspects: bool = True,
    include_houses: bool = False,
):
    """
    Get a complete astrological chart with all planetary positions and aspects.

    This is the main endpoint for getting a full snapshot of the sky.
    """
    calculator = AstrologyCalculator(system=system.value)
    positions = calculator.get_all_positions(timestamp)

    result = {
        "system": system.value,
        "timestamp": timestamp or datetime.utcnow(),
        "positions": positions,
    }

    if include_aspects:
        aspect_calc = AspectCalculator()
        result["aspects"] = aspect_calc.find_all_aspects(positions)

    if system == AstrologySystem.VEDIC:
        result["nakshatras"] = calculator.get_nakshatra_positions(timestamp)

    return result
