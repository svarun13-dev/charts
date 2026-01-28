"""
Core Astrology Calculator

Handles planetary position calculations for both Western (Tropical)
and Vedic (Sidereal) systems using Swiss Ephemeris.
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import math

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False

from app.core.constants import (
    PLANETS,
    WESTERN_ZODIAC,
    VEDIC_ZODIAC,
    VEDIC_NAKSHATRAS,
    AYANAMSA_TYPES,
)
from app.core.config import settings


class AstrologyCalculator:
    """
    Calculator for planetary positions supporting Western and Vedic systems.
    """

    # Ayanamsa offset for Vedic calculations (approximate Lahiri for 2024)
    # In production, this should be calculated precisely using Swiss Ephemeris
    LAHIRI_AYANAMSA_2024 = 24.17

    def __init__(self, system: str = "western"):
        """
        Initialize the calculator.

        Args:
            system: Either "western" (tropical) or "vedic" (sidereal)
        """
        self.system = system.lower()
        self._init_ephemeris()

    def _init_ephemeris(self):
        """Initialize Swiss Ephemeris if available"""
        if SWISSEPH_AVAILABLE:
            # Set Lahiri ayanamsa for Vedic calculations
            if self.system == "vedic":
                ayanamsa_type = AYANAMSA_TYPES.get(settings.vedic_ayanamsa, 1)
                swe.set_sid_mode(ayanamsa_type)

    def _datetime_to_jd(self, dt: Optional[datetime] = None) -> float:
        """Convert datetime to Julian Day number"""
        if dt is None:
            dt = datetime.utcnow()

        if SWISSEPH_AVAILABLE:
            return swe.julday(
                dt.year, dt.month, dt.day,
                dt.hour + dt.minute / 60.0 + dt.second / 3600.0
            )
        else:
            # Simplified Julian Day calculation
            a = (14 - dt.month) // 12
            y = dt.year + 4800 - a
            m = dt.month + 12 * a - 3
            jdn = dt.day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045
            return jdn + (dt.hour - 12) / 24.0 + dt.minute / 1440.0 + dt.second / 86400.0

    def _get_ayanamsa(self, jd: float) -> float:
        """Get ayanamsa value for a given Julian Day"""
        if SWISSEPH_AVAILABLE:
            return swe.get_ayanamsa(jd)
        else:
            # Approximate Lahiri ayanamsa (increases ~50" per year)
            # Reference: 24.17° for 2024
            years_from_2024 = (jd - 2460310.5) / 365.25  # JD for Jan 1, 2024
            return self.LAHIRI_AYANAMSA_2024 + (years_from_2024 * 50 / 3600)

    def _calculate_planet_position(
        self,
        planet_id: int,
        jd: float,
        apply_ayanamsa: bool = False
    ) -> Dict[str, Any]:
        """
        Calculate a single planet's position.

        Returns longitude, latitude, and daily speed.
        """
        if SWISSEPH_AVAILABLE:
            flags = swe.FLG_SWIEPH | swe.FLG_SPEED
            if apply_ayanamsa:
                flags |= swe.FLG_SIDEREAL

            result = swe.calc_ut(jd, planet_id, flags)
            longitude = result[0][0]
            latitude = result[0][1]
            speed = result[0][3]
        else:
            # Simplified calculation without Swiss Ephemeris
            # Using approximate mean longitudes
            longitude = self._approximate_longitude(planet_id, jd)
            latitude = 0
            speed = self._approximate_speed(planet_id)

            if apply_ayanamsa:
                longitude -= self._get_ayanamsa(jd)
                longitude = longitude % 360

        return {
            "longitude": longitude % 360,
            "latitude": latitude,
            "speed": speed,
            "retrograde": speed < 0
        }

    def _approximate_longitude(self, planet_id: int, jd: float) -> float:
        """
        Approximate planetary longitude when Swiss Ephemeris is not available.
        Uses simplified mean motion calculations.
        """
        # Days since J2000.0 (Jan 1, 2000, 12:00 TT)
        d = jd - 2451545.0

        # Mean orbital periods in days and base longitudes
        orbital_data = {
            0: (365.25, 280.46),      # Sun (apparent)
            1: (27.32, 218.32),       # Moon
            2: (87.97, 252.25),       # Mercury
            3: (224.70, 181.98),      # Venus
            4: (686.98, 355.45),      # Mars
            5: (4332.59, 34.35),      # Jupiter
            6: (10759.22, 50.08),     # Saturn
            7: (30688.5, 314.06),     # Uranus
            8: (60182.0, 304.35),     # Neptune
            9: (90560.0, 238.96),     # Pluto
            10: (6798.38, 125.04),    # North Node (mean)
        }

        if planet_id == 11:  # South Node
            north_node = self._approximate_longitude(10, jd)
            return (north_node + 180) % 360

        if planet_id in orbital_data:
            period, base_lon = orbital_data[planet_id]
            daily_motion = 360 / period
            return (base_lon + daily_motion * d) % 360

        return 0

    def _approximate_speed(self, planet_id: int) -> float:
        """Get approximate daily motion for a planet"""
        speeds = {
            0: 0.985,    # Sun
            1: 13.176,   # Moon
            2: 1.38,     # Mercury (average)
            3: 1.20,     # Venus (average)
            4: 0.52,     # Mars
            5: 0.083,    # Jupiter
            6: 0.034,    # Saturn
            7: 0.012,    # Uranus
            8: 0.006,    # Neptune
            9: 0.004,    # Pluto
            10: -0.053,  # North Node (always retrograde in mean motion)
            11: -0.053,  # South Node
        }
        return speeds.get(planet_id, 0)

    def _get_sign_from_longitude(self, longitude: float) -> Dict[str, Any]:
        """Determine zodiac sign from ecliptic longitude"""
        zodiac = VEDIC_ZODIAC if self.system == "vedic" else WESTERN_ZODIAC

        sign_index = int(longitude / 30)
        degree_in_sign = longitude % 30

        sign = zodiac[sign_index]

        return {
            "sign": sign["name"],
            "sign_symbol": sign["symbol"],
            "degree_in_sign": round(degree_in_sign, 4),
            "sign_index": sign_index,
        }

    def _get_nakshatra(self, longitude: float) -> Dict[str, Any]:
        """
        Get Nakshatra information for a given sidereal longitude.
        Each nakshatra spans 13°20' (13.333°).
        """
        nakshatra_span = 360 / 27  # 13.333...
        nakshatra_index = int(longitude / nakshatra_span)
        degree_in_nakshatra = longitude % nakshatra_span
        pada = int(degree_in_nakshatra / (nakshatra_span / 4)) + 1

        nakshatra = VEDIC_NAKSHATRAS[nakshatra_index]

        return {
            "nakshatra": nakshatra["name"],
            "nakshatra_lord": nakshatra["lord"],
            "nakshatra_pada": pada,
            "nakshatra_deity": nakshatra["deity"],
        }

    def get_planet_position(
        self,
        planet_name: str,
        timestamp: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get the position of a specific planet.

        Args:
            planet_name: Name of the planet (e.g., "sun", "moon", "mars")
            timestamp: Optional timestamp (default: now)

        Returns:
            Dictionary with position data
        """
        planet_info = PLANETS.get(planet_name.lower())
        if not planet_info:
            raise ValueError(f"Unknown planet: {planet_name}")

        jd = self._datetime_to_jd(timestamp)
        apply_ayanamsa = self.system == "vedic"

        position = self._calculate_planet_position(
            planet_info["id"],
            jd,
            apply_ayanamsa
        )

        sign_info = self._get_sign_from_longitude(position["longitude"])

        result = {
            "planet": planet_name.lower(),
            "planet_name": planet_info["name"] if self.system == "western" else planet_info["vedic_name"],
            "symbol": planet_info["symbol"],
            "longitude": round(position["longitude"], 4),
            "latitude": round(position["latitude"], 4),
            "speed": round(position["speed"], 4),
            "retrograde": position["retrograde"],
            **sign_info,
        }

        # Add nakshatra for Vedic system
        if self.system == "vedic":
            nakshatra_info = self._get_nakshatra(position["longitude"])
            result.update(nakshatra_info)

        return result

    def get_all_positions(
        self,
        timestamp: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Get positions of all planets.

        Args:
            timestamp: Optional timestamp (default: now)

        Returns:
            List of position dictionaries for all planets
        """
        positions = []

        for planet_name in PLANETS.keys():
            try:
                position = self.get_planet_position(planet_name, timestamp)
                positions.append(position)
            except Exception as e:
                print(f"Error calculating {planet_name}: {e}")
                continue

        return positions

    def get_retrograde_planets(
        self,
        timestamp: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all planets currently in retrograde.

        Sun and Moon never retrograde.
        """
        retrogrades = []
        positions = self.get_all_positions(timestamp)

        for pos in positions:
            if pos["retrograde"] and pos["planet"] not in ["sun", "moon"]:
                retrogrades.append({
                    "planet": pos["planet"],
                    "planet_name": pos["planet_name"],
                    "is_retrograde": True,
                    "sign": pos["sign"],
                    "degree": pos["degree_in_sign"],
                    "started": None,  # Would need additional calculation
                    "ends": None,     # Would need additional calculation
                })

        return retrogrades

    def get_nakshatra_positions(
        self,
        timestamp: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Get nakshatra positions for all planets (Vedic only).
        """
        if self.system != "vedic":
            return []

        positions = self.get_all_positions(timestamp)
        return [
            {
                "planet": pos["planet"],
                "nakshatra": pos.get("nakshatra"),
                "nakshatra_lord": pos.get("nakshatra_lord"),
                "pada": pos.get("nakshatra_pada"),
            }
            for pos in positions
            if "nakshatra" in pos
        ]

    def get_upcoming_transits(
        self,
        planet_name: str,
        days_ahead: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get upcoming transits (sign changes) for a planet.

        Args:
            planet_name: Name of the planet
            days_ahead: Number of days to look ahead

        Returns:
            List of upcoming transit events
        """
        transits = []
        current_time = datetime.utcnow()

        # Get current position
        current_pos = self.get_planet_position(planet_name, current_time)
        current_sign = current_pos["sign"]

        # Check each day for sign changes
        for day in range(1, days_ahead + 1):
            check_time = current_time + timedelta(days=day)
            pos = self.get_planet_position(planet_name, check_time)

            if pos["sign"] != current_sign:
                transits.append({
                    "event_type": "ingress",
                    "date": check_time,
                    "planet": planet_name,
                    "description": f"{pos['planet_name']} enters {pos['sign']}",
                    "details": {
                        "from_sign": current_sign,
                        "to_sign": pos["sign"],
                    }
                })
                current_sign = pos["sign"]

        return transits
