"""Astrological constants and definitions"""

from enum import Enum
from typing import Dict, List, Tuple

# Swiss Ephemeris planet codes
class Planet(Enum):
    SUN = 0
    MOON = 1
    MERCURY = 2
    VENUS = 3
    MARS = 4
    JUPITER = 5
    SATURN = 6
    URANUS = 7
    NEPTUNE = 8
    PLUTO = 9
    NORTH_NODE = 10  # Rahu in Vedic
    SOUTH_NODE = 11  # Ketu in Vedic (calculated)


PLANETS: Dict[str, Dict] = {
    "sun": {"id": 0, "symbol": "☉", "name": "Sun", "vedic_name": "Surya"},
    "moon": {"id": 1, "symbol": "☽", "name": "Moon", "vedic_name": "Chandra"},
    "mercury": {"id": 2, "symbol": "☿", "name": "Mercury", "vedic_name": "Budha"},
    "venus": {"id": 3, "symbol": "♀", "name": "Venus", "vedic_name": "Shukra"},
    "mars": {"id": 4, "symbol": "♂", "name": "Mars", "vedic_name": "Mangala"},
    "jupiter": {"id": 5, "symbol": "♃", "name": "Jupiter", "vedic_name": "Guru"},
    "saturn": {"id": 6, "symbol": "♄", "name": "Saturn", "vedic_name": "Shani"},
    "uranus": {"id": 7, "symbol": "♅", "name": "Uranus", "vedic_name": "Uranus"},
    "neptune": {"id": 8, "symbol": "♆", "name": "Neptune", "vedic_name": "Neptune"},
    "pluto": {"id": 9, "symbol": "♇", "name": "Pluto", "vedic_name": "Pluto"},
    "rahu": {"id": 10, "symbol": "☊", "name": "North Node", "vedic_name": "Rahu"},
    "ketu": {"id": 11, "symbol": "☋", "name": "South Node", "vedic_name": "Ketu"},
}

# Western Tropical Zodiac Signs
WESTERN_ZODIAC: List[Dict] = [
    {"name": "Aries", "symbol": "♈", "element": "fire", "quality": "cardinal", "start_degree": 0},
    {"name": "Taurus", "symbol": "♉", "element": "earth", "quality": "fixed", "start_degree": 30},
    {"name": "Gemini", "symbol": "♊", "element": "air", "quality": "mutable", "start_degree": 60},
    {"name": "Cancer", "symbol": "♋", "element": "water", "quality": "cardinal", "start_degree": 90},
    {"name": "Leo", "symbol": "♌", "element": "fire", "quality": "fixed", "start_degree": 120},
    {"name": "Virgo", "symbol": "♍", "element": "earth", "quality": "mutable", "start_degree": 150},
    {"name": "Libra", "symbol": "♎", "element": "air", "quality": "cardinal", "start_degree": 180},
    {"name": "Scorpio", "symbol": "♏", "element": "water", "quality": "fixed", "start_degree": 210},
    {"name": "Sagittarius", "symbol": "♐", "element": "fire", "quality": "mutable", "start_degree": 240},
    {"name": "Capricorn", "symbol": "♑", "element": "earth", "quality": "cardinal", "start_degree": 270},
    {"name": "Aquarius", "symbol": "♒", "element": "air", "quality": "fixed", "start_degree": 300},
    {"name": "Pisces", "symbol": "♓", "element": "water", "quality": "mutable", "start_degree": 330},
]

# Vedic Sidereal Zodiac Signs (Rashis)
VEDIC_ZODIAC: List[Dict] = [
    {"name": "Mesha", "western": "Aries", "symbol": "♈", "lord": "Mars", "element": "fire"},
    {"name": "Vrishabha", "western": "Taurus", "symbol": "♉", "lord": "Venus", "element": "earth"},
    {"name": "Mithuna", "western": "Gemini", "symbol": "♊", "lord": "Mercury", "element": "air"},
    {"name": "Karka", "western": "Cancer", "symbol": "♋", "lord": "Moon", "element": "water"},
    {"name": "Simha", "western": "Leo", "symbol": "♌", "lord": "Sun", "element": "fire"},
    {"name": "Kanya", "western": "Virgo", "symbol": "♍", "lord": "Mercury", "element": "earth"},
    {"name": "Tula", "western": "Libra", "symbol": "♎", "lord": "Venus", "element": "air"},
    {"name": "Vrishchika", "western": "Scorpio", "symbol": "♏", "lord": "Mars", "element": "water"},
    {"name": "Dhanu", "western": "Sagittarius", "symbol": "♐", "lord": "Jupiter", "element": "fire"},
    {"name": "Makara", "western": "Capricorn", "symbol": "♑", "lord": "Saturn", "element": "earth"},
    {"name": "Kumbha", "western": "Aquarius", "symbol": "♒", "lord": "Saturn", "element": "air"},
    {"name": "Meena", "western": "Pisces", "symbol": "♓", "lord": "Jupiter", "element": "water"},
]

# Vedic Nakshatras (27 lunar mansions)
VEDIC_NAKSHATRAS: List[Dict] = [
    {"name": "Ashwini", "lord": "Ketu", "start_degree": 0, "deity": "Ashwini Kumaras"},
    {"name": "Bharani", "lord": "Venus", "start_degree": 13.333, "deity": "Yama"},
    {"name": "Krittika", "lord": "Sun", "start_degree": 26.667, "deity": "Agni"},
    {"name": "Rohini", "lord": "Moon", "start_degree": 40, "deity": "Brahma"},
    {"name": "Mrigashira", "lord": "Mars", "start_degree": 53.333, "deity": "Soma"},
    {"name": "Ardra", "lord": "Rahu", "start_degree": 66.667, "deity": "Rudra"},
    {"name": "Punarvasu", "lord": "Jupiter", "start_degree": 80, "deity": "Aditi"},
    {"name": "Pushya", "lord": "Saturn", "start_degree": 93.333, "deity": "Brihaspati"},
    {"name": "Ashlesha", "lord": "Mercury", "start_degree": 106.667, "deity": "Nagas"},
    {"name": "Magha", "lord": "Ketu", "start_degree": 120, "deity": "Pitris"},
    {"name": "Purva Phalguni", "lord": "Venus", "start_degree": 133.333, "deity": "Bhaga"},
    {"name": "Uttara Phalguni", "lord": "Sun", "start_degree": 146.667, "deity": "Aryaman"},
    {"name": "Hasta", "lord": "Moon", "start_degree": 160, "deity": "Savitar"},
    {"name": "Chitra", "lord": "Mars", "start_degree": 173.333, "deity": "Vishvakarma"},
    {"name": "Swati", "lord": "Rahu", "start_degree": 186.667, "deity": "Vayu"},
    {"name": "Vishakha", "lord": "Jupiter", "start_degree": 200, "deity": "Indra-Agni"},
    {"name": "Anuradha", "lord": "Saturn", "start_degree": 213.333, "deity": "Mitra"},
    {"name": "Jyeshtha", "lord": "Mercury", "start_degree": 226.667, "deity": "Indra"},
    {"name": "Mula", "lord": "Ketu", "start_degree": 240, "deity": "Nirriti"},
    {"name": "Purva Ashadha", "lord": "Venus", "start_degree": 253.333, "deity": "Apas"},
    {"name": "Uttara Ashadha", "lord": "Sun", "start_degree": 266.667, "deity": "Vishvadevas"},
    {"name": "Shravana", "lord": "Moon", "start_degree": 280, "deity": "Vishnu"},
    {"name": "Dhanishta", "lord": "Mars", "start_degree": 293.333, "deity": "Vasus"},
    {"name": "Shatabhisha", "lord": "Rahu", "start_degree": 306.667, "deity": "Varuna"},
    {"name": "Purva Bhadrapada", "lord": "Jupiter", "start_degree": 320, "deity": "Aja Ekapada"},
    {"name": "Uttara Bhadrapada", "lord": "Saturn", "start_degree": 333.333, "deity": "Ahir Budhnya"},
    {"name": "Revati", "lord": "Mercury", "start_degree": 346.667, "deity": "Pushan"},
]

# Planetary Aspects
ASPECTS: Dict[str, Dict] = {
    "conjunction": {"angle": 0, "orb": 10, "symbol": "☌", "nature": "neutral", "strength": 10},
    "sextile": {"angle": 60, "orb": 6, "symbol": "⚹", "nature": "harmonious", "strength": 3},
    "square": {"angle": 90, "orb": 8, "symbol": "□", "nature": "challenging", "strength": 7},
    "trine": {"angle": 120, "orb": 8, "symbol": "△", "nature": "harmonious", "strength": 8},
    "opposition": {"angle": 180, "orb": 10, "symbol": "☍", "nature": "challenging", "strength": 9},
    "quincunx": {"angle": 150, "orb": 3, "symbol": "⚻", "nature": "adjusting", "strength": 4},
    "semisextile": {"angle": 30, "orb": 2, "symbol": "⚺", "nature": "mild", "strength": 2},
}

# Zodiac alias for backward compatibility
ZODIAC_SIGNS = WESTERN_ZODIAC

# Moon Phases
MOON_PHASES: List[Dict] = [
    {"name": "New Moon", "start_angle": 0, "end_angle": 45, "symbol": "🌑"},
    {"name": "Waxing Crescent", "start_angle": 45, "end_angle": 90, "symbol": "🌒"},
    {"name": "First Quarter", "start_angle": 90, "end_angle": 135, "symbol": "🌓"},
    {"name": "Waxing Gibbous", "start_angle": 135, "end_angle": 180, "symbol": "🌔"},
    {"name": "Full Moon", "start_angle": 180, "end_angle": 225, "symbol": "🌕"},
    {"name": "Waning Gibbous", "start_angle": 225, "end_angle": 270, "symbol": "🌖"},
    {"name": "Last Quarter", "start_angle": 270, "end_angle": 315, "symbol": "🌗"},
    {"name": "Waning Crescent", "start_angle": 315, "end_angle": 360, "symbol": "🌘"},
]

# Ayanamsa values (approximate, for reference)
# The actual calculation uses Swiss Ephemeris
AYANAMSA_TYPES: Dict[str, int] = {
    "lahiri": 1,  # Chitrapaksha - most common in India
    "raman": 3,   # B.V. Raman's ayanamsa
    "krishnamurti": 5,  # KP system
    "fagan_bradley": 0,  # Western sidereal
}

# Trading signal strength thresholds
SIGNAL_STRENGTH: Dict[str, Tuple[int, int]] = {
    "weak": (1, 3),
    "moderate": (4, 6),
    "strong": (7, 8),
    "very_strong": (9, 10),
}

# Market types
MARKET_TYPES = ["crypto", "stocks", "commodities"]

# Default tracked assets
DEFAULT_ASSETS: Dict[str, List[str]] = {
    "crypto": ["BTC", "ETH", "SOL", "XRP", "ADA"],
    "stocks": ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"],
    "commodities": ["GOLD", "SILVER", "OIL", "NATGAS"],
}
