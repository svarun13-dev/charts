"""Tests for the astrology calculator"""

import pytest
from datetime import datetime
from app.services.astrology.calculator import AstrologyCalculator


class TestAstrologyCalculator:
    """Test suite for AstrologyCalculator"""

    def test_western_calculator_init(self):
        """Test Western calculator initialization"""
        calc = AstrologyCalculator(system="western")
        assert calc.system == "western"

    def test_vedic_calculator_init(self):
        """Test Vedic calculator initialization"""
        calc = AstrologyCalculator(system="vedic")
        assert calc.system == "vedic"

    def test_get_sun_position(self):
        """Test getting Sun position"""
        calc = AstrologyCalculator(system="western")
        position = calc.get_planet_position("sun")

        assert position is not None
        assert "longitude" in position
        assert "sign" in position
        assert 0 <= position["longitude"] < 360

    def test_get_moon_position(self):
        """Test getting Moon position"""
        calc = AstrologyCalculator(system="western")
        position = calc.get_planet_position("moon")

        assert position is not None
        assert "longitude" in position
        assert "sign" in position

    def test_get_all_positions(self):
        """Test getting all planetary positions"""
        calc = AstrologyCalculator(system="western")
        positions = calc.get_all_positions()

        assert len(positions) > 0
        assert any(p["planet"] == "sun" for p in positions)
        assert any(p["planet"] == "moon" for p in positions)

    def test_vedic_includes_nakshatra(self):
        """Test that Vedic system includes nakshatra"""
        calc = AstrologyCalculator(system="vedic")
        position = calc.get_planet_position("moon")

        assert "nakshatra" in position
        assert "nakshatra_lord" in position

    def test_retrograde_detection(self):
        """Test retrograde planet detection"""
        calc = AstrologyCalculator(system="western")
        retrogrades = calc.get_retrograde_planets()

        # Retrogrades is a list (may or may not have entries)
        assert isinstance(retrogrades, list)

    def test_specific_timestamp(self):
        """Test calculation at specific timestamp"""
        calc = AstrologyCalculator(system="western")
        timestamp = datetime(2024, 1, 1, 12, 0, 0)
        position = calc.get_planet_position("sun", timestamp)

        assert position is not None
        # Sun should be in Capricorn on Jan 1
        assert position["sign"] == "Capricorn"

    def test_invalid_planet(self):
        """Test handling of invalid planet name"""
        calc = AstrologyCalculator(system="western")

        with pytest.raises(ValueError):
            calc.get_planet_position("invalid_planet")


class TestAspectCalculator:
    """Test suite for AspectCalculator"""

    def test_find_aspects(self):
        """Test finding aspects between planets"""
        from app.services.astrology.aspects import AspectCalculator
        from app.services.astrology.calculator import AstrologyCalculator

        calc = AstrologyCalculator(system="western")
        positions = calc.get_all_positions()

        aspect_calc = AspectCalculator()
        aspects = aspect_calc.find_all_aspects(positions)

        assert isinstance(aspects, list)

    def test_aspect_properties(self):
        """Test aspect has required properties"""
        from app.services.astrology.aspects import AspectCalculator
        from app.services.astrology.calculator import AstrologyCalculator

        calc = AstrologyCalculator(system="western")
        positions = calc.get_all_positions()

        aspect_calc = AspectCalculator()
        aspects = aspect_calc.find_all_aspects(positions)

        if aspects:
            aspect = aspects[0]
            assert "planet1" in aspect
            assert "planet2" in aspect
            assert "aspect_type" in aspect
            assert "strength" in aspect
            assert "nature" in aspect


class TestMoonCalculator:
    """Test suite for MoonCalculator"""

    def test_get_current_phase(self):
        """Test getting current moon phase"""
        from app.services.astrology.moon import MoonCalculator

        moon_calc = MoonCalculator()
        phase = moon_calc.get_current_phase()

        assert "phase_name" in phase
        assert "illumination" in phase
        assert 0 <= phase["illumination"] <= 100

    def test_get_tithi(self):
        """Test getting Vedic tithi"""
        from app.services.astrology.moon import MoonCalculator

        moon_calc = MoonCalculator()
        tithi = moon_calc.get_tithi()

        assert "number" in tithi
        assert "name" in tithi
        assert "paksha" in tithi
        assert 1 <= tithi["number"] <= 30
