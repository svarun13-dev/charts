"""System and utility endpoints"""

from fastapi import APIRouter
from datetime import datetime

from app.core.config import settings
from app.core.constants import (
    PLANETS,
    WESTERN_ZODIAC,
    VEDIC_ZODIAC,
    VEDIC_NAKSHATRAS,
    ASPECTS,
    MOON_PHASES,
)

router = APIRouter()


@router.get("/info")
async def get_system_info():
    """Get system information and available configurations"""
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "systems": {
            "western": {
                "name": "Western Tropical",
                "description": "Based on the seasons and vernal equinox",
                "zodiac_type": "tropical",
            },
            "vedic": {
                "name": "Vedic Sidereal (Jyotish)",
                "description": "Based on fixed star positions",
                "zodiac_type": "sidereal",
                "ayanamsa": settings.vedic_ayanamsa,
            },
        },
        "markets": ["crypto", "stocks", "commodities"],
        "timestamp": datetime.utcnow(),
    }


@router.get("/planets")
async def get_planets_info():
    """Get information about all tracked planets"""
    return {
        "planets": PLANETS,
        "count": len(PLANETS),
    }


@router.get("/zodiac")
async def get_zodiac_info(system: str = "western"):
    """Get zodiac sign information for a system"""
    if system == "vedic":
        return {
            "system": "vedic",
            "zodiac": VEDIC_ZODIAC,
            "count": len(VEDIC_ZODIAC),
        }
    return {
        "system": "western",
        "zodiac": WESTERN_ZODIAC,
        "count": len(WESTERN_ZODIAC),
    }


@router.get("/nakshatras")
async def get_nakshatras():
    """Get Vedic nakshatra information"""
    return {
        "nakshatras": VEDIC_NAKSHATRAS,
        "count": len(VEDIC_NAKSHATRAS),
        "description": "27 lunar mansions used in Vedic astrology",
    }


@router.get("/aspects")
async def get_aspects_info():
    """Get information about planetary aspects"""
    return {
        "aspects": ASPECTS,
        "count": len(ASPECTS),
    }


@router.get("/moon-phases")
async def get_moon_phases_info():
    """Get information about moon phases"""
    return {
        "phases": MOON_PHASES,
        "count": len(MOON_PHASES),
    }


@router.get("/glossary")
async def get_astrology_glossary():
    """Get glossary of astrological terms"""
    return {
        "terms": {
            "aspect": "Angular relationship between two planets",
            "conjunction": "Two planets at the same degree (0°)",
            "opposition": "Two planets opposite each other (180°)",
            "trine": "Two planets 120° apart - harmonious",
            "square": "Two planets 90° apart - challenging",
            "sextile": "Two planets 60° apart - opportunity",
            "retrograde": "Planet appears to move backward from Earth's perspective",
            "ingress": "Planet entering a new zodiac sign",
            "transit": "Current planetary movement affecting natal positions",
            "natal chart": "Chart of planetary positions at birth/origin",
            "ayanamsa": "Difference between tropical and sidereal zodiacs",
            "nakshatra": "One of 27 lunar mansions in Vedic astrology",
            "tithi": "Vedic lunar day (30 per lunar month)",
            "rashi": "Vedic term for zodiac sign",
            "graha": "Vedic term for planet",
        }
    }
