"""
Aspect Calculator

Calculates planetary aspects (angular relationships) between planets.
Supports all major and minor aspects with customizable orbs.
"""

from typing import List, Dict, Any, Optional
from app.core.constants import ASPECTS


class AspectCalculator:
    """
    Calculator for planetary aspects.

    An aspect is a specific angular relationship between two planets
    that is considered significant in astrology.
    """

    def __init__(self, custom_orbs: Optional[Dict[str, float]] = None):
        """
        Initialize aspect calculator.

        Args:
            custom_orbs: Optional custom orb values for aspects
        """
        self.aspects = ASPECTS.copy()
        if custom_orbs:
            for aspect_name, orb in custom_orbs.items():
                if aspect_name in self.aspects:
                    self.aspects[aspect_name]["orb"] = orb

    def _normalize_angle(self, angle: float) -> float:
        """Normalize angle to 0-360 range"""
        return angle % 360

    def _get_angle_between(self, lon1: float, lon2: float) -> float:
        """
        Get the smallest angle between two longitudes.

        Returns value between 0 and 180.
        """
        diff = abs(lon1 - lon2)
        if diff > 180:
            diff = 360 - diff
        return diff

    def _is_applying(
        self,
        planet1_speed: float,
        planet2_speed: float,
        lon1: float,
        lon2: float,
        aspect_angle: float
    ) -> bool:
        """
        Determine if an aspect is applying (getting closer) or separating.

        An applying aspect is generally considered stronger.
        """
        current_angle = self._get_angle_between(lon1, lon2)

        # Calculate angle difference from exact aspect
        orb = abs(current_angle - aspect_angle)

        # Check if faster planet is moving toward aspect
        if planet1_speed > planet2_speed:
            # Planet 1 is faster, check if it's approaching planet 2
            relative_speed = planet1_speed - planet2_speed
            # If planets are getting closer to exact aspect, it's applying
            return relative_speed > 0 and lon1 < lon2
        else:
            relative_speed = planet2_speed - planet1_speed
            return relative_speed > 0 and lon2 < lon1

    def check_aspect(
        self,
        planet1: Dict[str, Any],
        planet2: Dict[str, Any],
        aspect_name: str
    ) -> Optional[Dict[str, Any]]:
        """
        Check if two planets form a specific aspect.

        Args:
            planet1: First planet's position data
            planet2: Second planet's position data
            aspect_name: Name of aspect to check

        Returns:
            Aspect data if found, None otherwise
        """
        if aspect_name not in self.aspects:
            return None

        aspect = self.aspects[aspect_name]
        angle = self._get_angle_between(
            planet1["longitude"],
            planet2["longitude"]
        )

        orb = abs(angle - aspect["angle"])

        if orb <= aspect["orb"]:
            applying = self._is_applying(
                planet1.get("speed", 0),
                planet2.get("speed", 0),
                planet1["longitude"],
                planet2["longitude"],
                aspect["angle"]
            )

            # Calculate strength based on tightness of orb
            max_orb = aspect["orb"]
            orb_ratio = 1 - (orb / max_orb)
            strength = int(aspect["strength"] * orb_ratio)
            strength = max(1, min(10, strength))

            return {
                "planet1": planet1["planet"],
                "planet2": planet2["planet"],
                "aspect_type": aspect_name,
                "symbol": aspect["symbol"],
                "angle": round(angle, 2),
                "exact_angle": aspect["angle"],
                "orb": round(orb, 2),
                "nature": aspect["nature"],
                "strength": strength,
                "applying": applying,
            }

        return None

    def find_aspects_between(
        self,
        planet1: Dict[str, Any],
        planet2: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Find all aspects between two planets.

        Args:
            planet1: First planet's position data
            planet2: Second planet's position data

        Returns:
            List of aspects found
        """
        aspects_found = []

        for aspect_name in self.aspects:
            aspect = self.check_aspect(planet1, planet2, aspect_name)
            if aspect:
                aspects_found.append(aspect)

        return aspects_found

    def find_all_aspects(
        self,
        positions: List[Dict[str, Any]],
        min_strength: int = 1,
        aspect_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Find all aspects among a list of planetary positions.

        Args:
            positions: List of planet position dictionaries
            min_strength: Minimum strength threshold
            aspect_types: Optional list of aspect types to check

        Returns:
            List of all aspects found
        """
        all_aspects = []
        checked_pairs = set()

        types_to_check = aspect_types or list(self.aspects.keys())

        for i, planet1 in enumerate(positions):
            for j, planet2 in enumerate(positions):
                if i >= j:
                    continue

                pair_key = tuple(sorted([planet1["planet"], planet2["planet"]]))
                if pair_key in checked_pairs:
                    continue
                checked_pairs.add(pair_key)

                for aspect_type in types_to_check:
                    aspect = self.check_aspect(planet1, planet2, aspect_type)
                    if aspect and aspect["strength"] >= min_strength:
                        all_aspects.append(aspect)

        # Sort by strength (descending)
        all_aspects.sort(key=lambda x: x["strength"], reverse=True)

        return all_aspects

    def find_transits_to_natal(
        self,
        transit_positions: List[Dict[str, Any]],
        natal_positions: List[Dict[str, Any]],
        min_strength: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Find aspects between transiting planets and natal positions.

        Used for analyzing how current planetary positions affect
        a birth chart (e.g., an asset's natal chart).

        Args:
            transit_positions: Current planetary positions
            natal_positions: Natal (birth) planetary positions
            min_strength: Minimum strength threshold

        Returns:
            List of transit aspects to natal positions
        """
        transit_aspects = []

        for transit_planet in transit_positions:
            for natal_planet in natal_positions:
                aspects = self.find_aspects_between(transit_planet, natal_planet)

                for aspect in aspects:
                    if aspect["strength"] >= min_strength:
                        aspect["transit_type"] = "transit_to_natal"
                        aspect["transiting_planet"] = transit_planet["planet"]
                        aspect["natal_planet"] = natal_planet["planet"]
                        transit_aspects.append(aspect)

        transit_aspects.sort(key=lambda x: x["strength"], reverse=True)
        return transit_aspects

    def get_aspect_summary(
        self,
        aspects: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate a summary of aspects.

        Args:
            aspects: List of aspects

        Returns:
            Summary statistics
        """
        if not aspects:
            return {
                "total": 0,
                "harmonious": 0,
                "challenging": 0,
                "neutral": 0,
                "avg_strength": 0,
            }

        harmonious = sum(1 for a in aspects if a["nature"] == "harmonious")
        challenging = sum(1 for a in aspects if a["nature"] == "challenging")
        neutral = len(aspects) - harmonious - challenging

        return {
            "total": len(aspects),
            "harmonious": harmonious,
            "challenging": challenging,
            "neutral": neutral,
            "avg_strength": sum(a["strength"] for a in aspects) / len(aspects),
            "strongest": aspects[0] if aspects else None,
            "by_type": self._count_by_type(aspects),
        }

    def _count_by_type(self, aspects: List[Dict[str, Any]]) -> Dict[str, int]:
        """Count aspects by type"""
        counts = {}
        for aspect in aspects:
            aspect_type = aspect["aspect_type"]
            counts[aspect_type] = counts.get(aspect_type, 0) + 1
        return counts
