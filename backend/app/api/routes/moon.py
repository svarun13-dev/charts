"""Moon phase and lunar cycle endpoints"""

from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timedelta

from app.services.astrology.calculator import AstrologyCalculator
from app.services.astrology.moon import MoonCalculator
from app.models.schemas import (
    MoonPhaseResponse,
    LunarCalendarResponse,
    AstrologySystem,
)

router = APIRouter()


@router.get("/phase", response_model=MoonPhaseResponse)
async def get_moon_phase(
    timestamp: Optional[datetime] = None,
):
    """
    Get the current moon phase.

    Returns phase name, illumination percentage, and days until next phase.
    """
    moon_calc = MoonCalculator()
    phase = moon_calc.get_current_phase(timestamp)

    return MoonPhaseResponse(
        timestamp=timestamp or datetime.utcnow(),
        **phase,
    )


@router.get("/position")
async def get_moon_position(
    system: AstrologySystem = Query(AstrologySystem.WESTERN),
    timestamp: Optional[datetime] = None,
):
    """
    Get the Moon's current zodiac position.

    For Vedic system, also includes Nakshatra information.
    """
    calculator = AstrologyCalculator(system=system.value)
    position = calculator.get_planet_position("moon", timestamp)

    result = {
        "timestamp": timestamp or datetime.utcnow(),
        "system": system.value,
        **position,
    }

    if system == AstrologySystem.VEDIC:
        moon_calc = MoonCalculator()
        result["nakshatra"] = moon_calc.get_moon_nakshatra(timestamp)

    return result


@router.get("/calendar", response_model=LunarCalendarResponse)
async def get_lunar_calendar(
    days: int = Query(30, ge=1, le=90, description="Number of days to forecast"),
    start_date: Optional[datetime] = None,
):
    """
    Get a lunar calendar with upcoming moon phases.

    Shows new moons, full moons, and quarter phases.
    """
    moon_calc = MoonCalculator()
    start = start_date or datetime.utcnow()

    events = moon_calc.get_lunar_calendar(start, days)

    return LunarCalendarResponse(
        start_date=start,
        days=days,
        events=events,
    )


@router.get("/void-of-course")
async def get_void_of_course(
    days: int = Query(7, ge=1, le=30),
):
    """
    Get upcoming void-of-course Moon periods.

    The Moon is void-of-course after making its last major aspect
    in a sign until it enters the next sign. Traditionally considered
    unfavorable for starting new ventures.
    """
    moon_calc = MoonCalculator()
    voc_periods = moon_calc.get_void_of_course_periods(days)

    return {
        "days_ahead": days,
        "periods": voc_periods,
        "count": len(voc_periods),
    }


@router.get("/eclipses")
async def get_upcoming_eclipses(
    months: int = Query(12, ge=1, le=24),
):
    """
    Get upcoming solar and lunar eclipses.

    Eclipses are traditionally significant in both Western and Vedic astrology.
    """
    moon_calc = MoonCalculator()
    eclipses = moon_calc.get_upcoming_eclipses(months)

    return {
        "months_ahead": months,
        "eclipses": eclipses,
        "count": len(eclipses),
    }


@router.get("/tithi")
async def get_tithi(
    timestamp: Optional[datetime] = None,
):
    """
    Get the current Tithi (Vedic lunar day).

    There are 30 tithis in a lunar month, each with its own significance.
    """
    moon_calc = MoonCalculator()
    tithi = moon_calc.get_tithi(timestamp)

    return {
        "timestamp": timestamp or datetime.utcnow(),
        **tithi,
    }
