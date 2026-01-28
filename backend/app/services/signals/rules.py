"""
Signal Rules Configuration

Manages the rules and configurations for signal generation.
"""

from typing import Dict, Any, List, Optional
from app.core.constants import ASPECTS, PLANETS


class SignalRules:
    """
    Manages signal generation rules and configurations.

    Rules determine which astrological configurations trigger signals
    and how those signals are interpreted.
    """

    # Default rules configuration
    DEFAULT_RULES = {
        "enabled_aspects": ["conjunction", "square", "trine", "opposition", "sextile"],
        "enabled_planets": list(PLANETS.keys()),
        "enabled_markets": ["crypto", "stocks", "commodities"],
        "min_aspect_strength": 5,
        "include_retrogrades": True,
        "include_lunar": True,
        "aspect_rules": {
            "conjunction": {
                "min_strength": 4,
                "direction_bias": None,  # Depends on planets involved
                "description": "Planets merge energies - intensification",
            },
            "opposition": {
                "min_strength": 5,
                "direction_bias": "volatile",
                "description": "Tension between opposing forces",
            },
            "square": {
                "min_strength": 5,
                "direction_bias": "bearish",
                "description": "Challenging aspect - friction and obstacles",
            },
            "trine": {
                "min_strength": 4,
                "direction_bias": "bullish",
                "description": "Harmonious flow - easy energy",
            },
            "sextile": {
                "min_strength": 3,
                "direction_bias": "bullish",
                "description": "Opportunity aspect - requires action",
            },
        },
        "planet_rules": {
            "sun": {
                "influence": "core identity, leadership, vitality",
                "markets": ["stocks"],
                "strength_modifier": 1.0,
            },
            "moon": {
                "influence": "emotions, public mood, short-term fluctuations",
                "markets": ["crypto", "stocks"],
                "strength_modifier": 0.8,
            },
            "mercury": {
                "influence": "communication, technology, transactions",
                "markets": ["crypto", "stocks"],
                "strength_modifier": 1.2,
                "retrograde_impact": "high",
            },
            "venus": {
                "influence": "value, luxury, finances, relationships",
                "markets": ["stocks", "commodities"],
                "strength_modifier": 1.0,
            },
            "mars": {
                "influence": "energy, aggression, action, competition",
                "markets": ["crypto", "commodities"],
                "strength_modifier": 1.1,
            },
            "jupiter": {
                "influence": "expansion, growth, optimism, excess",
                "markets": ["crypto", "stocks", "commodities"],
                "strength_modifier": 1.3,
            },
            "saturn": {
                "influence": "restriction, discipline, structure, reality",
                "markets": ["stocks", "commodities"],
                "strength_modifier": 1.2,
            },
            "uranus": {
                "influence": "sudden change, innovation, disruption",
                "markets": ["crypto"],
                "strength_modifier": 1.4,
            },
            "neptune": {
                "influence": "illusion, oil/gas, pharmaceuticals, confusion",
                "markets": ["commodities"],
                "strength_modifier": 0.9,
            },
            "pluto": {
                "influence": "transformation, power, control, regeneration",
                "markets": ["stocks", "commodities"],
                "strength_modifier": 1.1,
            },
            "rahu": {
                "influence": "destiny, growth direction, collective purpose",
                "markets": ["crypto", "stocks"],
                "strength_modifier": 0.7,
            },
            "ketu": {
                "influence": "release, past patterns, letting go",
                "markets": ["crypto", "stocks"],
                "strength_modifier": 0.7,
            },
        },
        "retrograde_rules": {
            "mercury": {
                "alert_level": "high",
                "default_direction": "volatile",
                "affected_markets": ["crypto", "stocks"],
                "advice": "Avoid major transactions, expect miscommunication",
            },
            "venus": {
                "alert_level": "moderate",
                "default_direction": "bearish",
                "affected_markets": ["stocks"],
                "advice": "Review financial commitments",
            },
            "mars": {
                "alert_level": "moderate",
                "default_direction": "bearish",
                "affected_markets": ["crypto", "commodities"],
                "advice": "Reduce aggressive positions",
            },
        },
        "lunar_rules": {
            "new_moon": {
                "signal_type": "reversal_possible",
                "strength": "moderate",
                "description": "New cycle begins - watch for trend changes",
            },
            "full_moon": {
                "signal_type": "reversal_possible",
                "strength": "strong",
                "description": "Peak energy - potential exhaustion point",
            },
            "first_quarter": {
                "signal_type": "momentum",
                "strength": "weak",
                "description": "Action point - momentum building",
            },
            "last_quarter": {
                "signal_type": "momentum",
                "strength": "weak",
                "description": "Release point - momentum waning",
            },
        },
    }

    def __init__(self):
        """Initialize with default rules"""
        self.rules = self.DEFAULT_RULES.copy()
        self.custom_rules: List[Dict[str, Any]] = []

    def get_current_rules(self) -> Dict[str, Any]:
        """Get the current rules configuration"""
        return {
            "default_rules": self.rules,
            "custom_rules": self.custom_rules,
            "enabled_aspects": self.rules["enabled_aspects"],
            "enabled_planets": self.rules["enabled_planets"],
            "enabled_markets": self.rules["enabled_markets"],
        }

    def update_config(self, config: Dict[str, Any]) -> None:
        """
        Update rules configuration.

        Args:
            config: New configuration values
        """
        if "rules" in config:
            for rule in config["rules"]:
                self._add_or_update_custom_rule(rule)

        if "default_min_strength" in config:
            self.rules["min_aspect_strength"] = config["default_min_strength"]

        if "enabled_aspects" in config:
            self.rules["enabled_aspects"] = config["enabled_aspects"]

        if "enabled_markets" in config:
            self.rules["enabled_markets"] = config["enabled_markets"]

    def _add_or_update_custom_rule(self, rule: Dict[str, Any]) -> None:
        """Add or update a custom rule"""
        existing_idx = None
        for i, existing in enumerate(self.custom_rules):
            if existing.get("name") == rule.get("name"):
                existing_idx = i
                break

        if existing_idx is not None:
            self.custom_rules[existing_idx] = rule
        else:
            self.custom_rules.append(rule)

    def get_aspect_rule(self, aspect_type: str) -> Dict[str, Any]:
        """Get rule for a specific aspect type"""
        return self.rules["aspect_rules"].get(aspect_type, {
            "min_strength": 5,
            "direction_bias": None,
            "description": "Custom aspect",
        })

    def get_planet_rule(self, planet: str) -> Dict[str, Any]:
        """Get rule for a specific planet"""
        return self.rules["planet_rules"].get(planet.lower(), {
            "influence": "general planetary influence",
            "markets": ["crypto", "stocks", "commodities"],
            "strength_modifier": 1.0,
        })

    def get_retrograde_rule(self, planet: str) -> Optional[Dict[str, Any]]:
        """Get retrograde rule for a planet"""
        return self.rules["retrograde_rules"].get(planet.lower())

    def get_lunar_rule(self, event_type: str) -> Dict[str, Any]:
        """Get rule for a lunar event"""
        return self.rules["lunar_rules"].get(event_type.lower().replace(" ", "_"), {
            "signal_type": "observation",
            "strength": "weak",
            "description": "Lunar event",
        })

    def is_aspect_enabled(self, aspect_type: str) -> bool:
        """Check if an aspect type is enabled for signals"""
        return aspect_type.lower() in self.rules["enabled_aspects"]

    def is_planet_enabled(self, planet: str) -> bool:
        """Check if a planet is enabled for signals"""
        return planet.lower() in self.rules["enabled_planets"]

    def is_market_enabled(self, market: str) -> bool:
        """Check if a market is enabled for signals"""
        return market.lower() in self.rules["enabled_markets"]

    def calculate_signal_strength(
        self,
        base_strength: int,
        planets: List[str],
        aspect_type: str
    ) -> int:
        """
        Calculate final signal strength based on rules.

        Args:
            base_strength: Initial strength value
            planets: Planets involved
            aspect_type: Type of aspect

        Returns:
            Modified strength value (1-10)
        """
        strength = base_strength

        # Apply planet modifiers
        for planet in planets:
            rule = self.get_planet_rule(planet)
            strength *= rule.get("strength_modifier", 1.0)

        # Apply aspect modifier
        aspect_rule = self.get_aspect_rule(aspect_type)
        min_required = aspect_rule.get("min_strength", 5)

        # Ensure minimum threshold
        if strength < min_required:
            return 0  # Signal doesn't meet threshold

        # Clamp to 1-10 range
        return max(1, min(10, int(strength)))

    def get_direction_for_aspect(
        self,
        aspect_type: str,
        planets: List[str]
    ) -> str:
        """
        Determine signal direction based on aspect and planets.

        Args:
            aspect_type: Type of aspect
            planets: Planets involved

        Returns:
            Direction: bullish, bearish, neutral, or volatile
        """
        aspect_rule = self.get_aspect_rule(aspect_type)
        direction = aspect_rule.get("direction_bias")

        if direction:
            return direction

        # Determine from planets if no aspect bias
        benefics = ["venus", "jupiter"]
        malefics = ["mars", "saturn", "pluto"]

        benefic_count = sum(1 for p in planets if p.lower() in benefics)
        malefic_count = sum(1 for p in planets if p.lower() in malefics)

        if benefic_count > malefic_count:
            return "bullish"
        elif malefic_count > benefic_count:
            return "bearish"
        else:
            return "neutral"

    def export_rules(self) -> Dict[str, Any]:
        """Export current rules as JSON-serializable dict"""
        return {
            "version": "1.0",
            "rules": self.rules,
            "custom_rules": self.custom_rules,
        }

    def import_rules(self, data: Dict[str, Any]) -> None:
        """Import rules from dict"""
        if "rules" in data:
            self.rules.update(data["rules"])
        if "custom_rules" in data:
            self.custom_rules = data["custom_rules"]
