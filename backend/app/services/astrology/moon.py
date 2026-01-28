"""
Moon Calculator

Handles moon phase calculations, lunar cycles, void-of-course periods,
eclipses, and Vedic tithi calculations.
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import math

from app.core.constants import MOON_PHASES, VEDIC_NAKSHATRAS
from app.services.astrology.calculator import AstrologyCalculator


class MoonCalculator:
    """
    Calculator for moon phases and lunar cycles.
    """

    # Synodic month (new moon to new moon) in days
    SYNODIC_MONTH = 29.53059

    def __init__(self):
        self.calculator = AstrologyCalculator(system="western")
        self.vedic_calculator = AstrologyCalculator(system="vedic")

    def _get_sun_moon_angle(self, timestamp: Optional[datetime] = None) -> float:
        """
        Get the angle between Sun and Moon (moon phase angle).

        0° = New Moon
        90° = First Quarter
        180° = Full Moon
        270° = Last Quarter
        """
        sun_pos = self.calculator.get_planet_position("sun", timestamp)
        moon_pos = self.calculator.get_planet_position("moon", timestamp)

        angle = moon_pos["longitude"] - sun_pos["longitude"]
        if angle < 0:
            angle += 360

        return angle

    def get_current_phase(
        self,
        timestamp: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get the current moon phase.

        Args:
            timestamp: Optional timestamp (default: now)

        Returns:
            Dictionary with phase information
        """
        angle = self._get_sun_moon_angle(timestamp)

        # Determine phase
        phase_name = "New Moon"
        phase_symbol = "🌑"

        for phase in MOON_PHASES:
            if phase["start_angle"] <= angle < phase["end_angle"]:
                phase_name = phase["name"]
                phase_symbol = phase["symbol"]
                break

        # Calculate illumination (0-100%)
        # Illumination is based on the absolute value of cos(angle)
        illumination = (1 - math.cos(math.radians(angle))) / 2 * 100

        # Get moon position
        moon_pos = self.calculator.get_planet_position("moon", timestamp)

        # Calculate days until new/full moon
        days_until_new = ((360 - angle) / 360) * self.SYNODIC_MONTH
        days_until_full = abs(180 - angle) / 360 * self.SYNODIC_MONTH

        return {
            "phase_name": phase_name,
            "phase_symbol": phase_symbol,
            "illumination": round(illumination, 1),
            "angle": round(angle, 2),
            "days_until_new": round(days_until_new, 1),
            "days_until_full": round(days_until_full, 1),
            "moon_sign": moon_pos["sign"],
            "moon_degree": moon_pos["degree_in_sign"],
        }

    def get_lunar_calendar(
        self,
        start_date: datetime,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get a lunar calendar with major moon events.

        Args:
            start_date: Start date for the calendar
            days: Number of days to include

        Returns:
            List of lunar events
        """
        events = []
        current_date = start_date

        prev_angle = self._get_sun_moon_angle(current_date)

        for day in range(days):
            check_date = current_date + timedelta(days=day)
            angle = self._get_sun_moon_angle(check_date)

            # Check for new moon (angle crosses 0/360)
            if prev_angle > 350 and angle < 10:
                moon_pos = self.calculator.get_planet_position("moon", check_date)
                events.append({
                    "date": check_date,
                    "event_type": "new_moon",
                    "sign": moon_pos["sign"],
                })

            # Check for full moon (angle crosses 180)
            if prev_angle < 180 < angle or (prev_angle > 170 and angle > 180 and angle < 190):
                moon_pos = self.calculator.get_planet_position("moon", check_date)
                events.append({
                    "date": check_date,
                    "event_type": "full_moon",
                    "sign": moon_pos["sign"],
                })

            # Check for first quarter (angle crosses 90)
            if prev_angle < 90 < angle:
                moon_pos = self.calculator.get_planet_position("moon", check_date)
                events.append({
                    "date": check_date,
                    "event_type": "first_quarter",
                    "sign": moon_pos["sign"],
                })

            # Check for last quarter (angle crosses 270)
            if prev_angle < 270 < angle:
                moon_pos = self.calculator.get_planet_position("moon", check_date)
                events.append({
                    "date": check_date,
                    "event_type": "last_quarter",
                    "sign": moon_pos["sign"],
                })

            prev_angle = angle

        return events

    def get_moon_nakshatra(
        self,
        timestamp: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get the Moon's current nakshatra (Vedic lunar mansion).

        Args:
            timestamp: Optional timestamp

        Returns:
            Nakshatra information
        """
        moon_pos = self.vedic_calculator.get_planet_position("moon", timestamp)

        return {
            "nakshatra": moon_pos.get("nakshatra"),
            "lord": moon_pos.get("nakshatra_lord"),
            "pada": moon_pos.get("nakshatra_pada"),
            "deity": moon_pos.get("nakshatra_deity"),
        }

    def get_tithi(
        self,
        timestamp: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get the current Tithi (Vedic lunar day).

        There are 30 tithis in a lunar month:
        - Tithis 1-15: Shukla Paksha (waxing moon)
        - Tithis 16-30: Krishna Paksha (waning moon)

        Args:
            timestamp: Optional timestamp

        Returns:
            Tithi information
        """
        angle = self._get_sun_moon_angle(timestamp)

        # Each tithi is 12 degrees
        tithi_number = int(angle / 12) + 1
        if tithi_number > 30:
            tithi_number = 1

        # Determine paksha (lunar fortnight)
        if tithi_number <= 15:
            paksha = "Shukla"
            paksha_tithi = tithi_number
        else:
            paksha = "Krishna"
            paksha_tithi = tithi_number - 15

        tithi_names = [
            "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
            "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
            "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
        ]

        tithi_name = tithi_names[(paksha_tithi - 1) % 15]
        if paksha_tithi == 15:
            tithi_name = "Purnima" if paksha == "Shukla" else "Amavasya"

        # Tithi lords (based on traditional assignments)
        tithi_lords = [
            "Sun", "Moon", "Mars", "Mercury", "Jupiter",
            "Venus", "Saturn", "Rahu", "Sun", "Moon",
            "Mars", "Mercury", "Jupiter", "Venus", "Saturn"
        ]

        return {
            "number": tithi_number,
            "name": tithi_name,
            "paksha": paksha,
            "paksha_tithi": paksha_tithi,
            "lord": tithi_lords[(paksha_tithi - 1) % 15],
            "angle": round(angle, 2),
        }

    def get_void_of_course_periods(
        self,
        days: int = 7
    ) -> List[Dict[str, Any]]:
        """
        Calculate void-of-course Moon periods.

        The Moon is void-of-course from its last major aspect in a sign
        until it enters the next sign.

        Args:
            days: Number of days to look ahead

        Returns:
            List of void-of-course periods
        """
        # Simplified implementation - would need full aspect checking
        voc_periods = []
        current_time = datetime.utcnow()

        # For now, return approximate VOC windows
        # In production, this would calculate actual last aspects
        moon_pos = self.calculator.get_planet_position("moon", current_time)
        degree = moon_pos["degree_in_sign"]

        # Estimate VOC when Moon is in last 3 degrees of a sign
        if degree > 27:
            hours_until_ingress = (30 - degree) / 0.55  # Moon moves ~13° per day
            voc_periods.append({
                "sign": moon_pos["sign"],
                "start": current_time,
                "end": current_time + timedelta(hours=hours_until_ingress),
                "duration_hours": round(hours_until_ingress, 1),
            })

        return voc_periods

    def get_upcoming_eclipses(
        self,
        months: int = 12
    ) -> List[Dict[str, Any]]:
        """
        Get upcoming solar and lunar eclipses.

        Note: This is a simplified implementation. For production,
        use Swiss Ephemeris eclipse calculation functions.

        Args:
            months: Months to look ahead

        Returns:
            List of upcoming eclipses
        """
        # Eclipses occur near the lunar nodes when there's a new or full moon
        # This would need proper ephemeris calculation for accurate predictions
        # For now, return a placeholder structure

        return [
            {
                "type": "note",
                "message": "Eclipse calculation requires Swiss Ephemeris. "
                           "Enable pyswisseph for accurate eclipse predictions.",
            }
        ]

    def get_moon_sign_change(
        self,
        days: int = 7
    ) -> List[Dict[str, Any]]:
        """
        Get upcoming Moon sign changes.

        The Moon changes signs approximately every 2.5 days.

        Args:
            days: Days to look ahead

        Returns:
            List of sign changes
        """
        changes = []
        current_time = datetime.utcnow()

        current_pos = self.calculator.get_planet_position("moon", current_time)
        current_sign = current_pos["sign"]

        # Check every 6 hours for sign changes
        for hours in range(0, days * 24, 6):
            check_time = current_time + timedelta(hours=hours)
            pos = self.calculator.get_planet_position("moon", check_time)

            if pos["sign"] != current_sign:
                changes.append({
                    "date": check_time,
                    "from_sign": current_sign,
                    "to_sign": pos["sign"],
                })
                current_sign = pos["sign"]

        return changes
