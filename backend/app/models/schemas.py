"""Pydantic schemas for API requests and responses"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class AstrologySystem(str, Enum):
    WESTERN = "western"
    VEDIC = "vedic"


class MarketType(str, Enum):
    CRYPTO = "crypto"
    STOCKS = "stocks"
    COMMODITIES = "commodities"


class SignalStrength(str, Enum):
    WEAK = "weak"
    MODERATE = "moderate"
    STRONG = "strong"
    VERY_STRONG = "very_strong"


class SignalDirection(str, Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"
    NEUTRAL = "neutral"
    VOLATILE = "volatile"


# Planet Schemas
class PlanetPosition(BaseModel):
    planet: str
    longitude: float = Field(..., description="Ecliptic longitude in degrees")
    latitude: float = Field(default=0, description="Ecliptic latitude in degrees")
    sign: str
    sign_symbol: str
    degree_in_sign: float
    retrograde: bool = False
    speed: float = Field(default=0, description="Daily motion in degrees")

    # Vedic-specific fields
    nakshatra: Optional[str] = None
    nakshatra_lord: Optional[str] = None
    nakshatra_pada: Optional[int] = None


class PlanetaryPositionsResponse(BaseModel):
    system: str
    timestamp: datetime
    positions: List[PlanetPosition]


# Aspect Schemas
class Aspect(BaseModel):
    planet1: str
    planet2: str
    aspect_type: str
    symbol: str
    angle: float
    orb: float = Field(..., description="Deviation from exact aspect in degrees")
    nature: str = Field(..., description="harmonious, challenging, or neutral")
    strength: int = Field(..., ge=1, le=10)
    applying: bool = Field(default=True, description="Whether aspect is applying or separating")


class AspectsResponse(BaseModel):
    system: str
    timestamp: datetime
    aspects: List[Aspect]
    count: int


# Retrograde Schemas
class RetrogradeInfo(BaseModel):
    planet: str
    is_retrograde: bool
    started: Optional[datetime] = None
    ends: Optional[datetime] = None
    sign: str
    degree: float


class RetrogradeResponse(BaseModel):
    system: str
    timestamp: datetime
    retrogrades: List[RetrogradeInfo]
    count: int


# Transit Schemas
class Transit(BaseModel):
    event_type: str  # ingress, aspect, station
    date: datetime
    planet: str
    description: str
    details: Optional[Dict[str, Any]] = None


class TransitResponse(BaseModel):
    planet: str
    system: str
    days_ahead: int
    transits: List[Transit]


# Moon Schemas
class MoonPhaseResponse(BaseModel):
    timestamp: datetime
    phase_name: str
    phase_symbol: str
    illumination: float = Field(..., ge=0, le=100)
    days_until_new: float
    days_until_full: float
    moon_sign: str
    moon_degree: float


class LunarEvent(BaseModel):
    date: datetime
    event_type: str  # new_moon, full_moon, first_quarter, last_quarter
    sign: str


class LunarCalendarResponse(BaseModel):
    start_date: datetime
    days: int
    events: List[LunarEvent]


# Signal Schemas
class TradingSignal(BaseModel):
    id: str
    timestamp: datetime
    signal_type: str
    direction: SignalDirection
    strength: SignalStrength
    markets: List[str]
    assets: Optional[List[str]] = None
    trigger: str = Field(..., description="What triggered this signal")
    planetary_config: Dict[str, Any]
    description: str
    expires: Optional[datetime] = None


class SignalResponse(BaseModel):
    system: str
    timestamp: datetime
    signals: List[TradingSignal]
    count: int


class SignalHistoryEntry(BaseModel):
    signal: TradingSignal
    outcome: Optional[str] = None
    accuracy: Optional[float] = None


class SignalHistoryResponse(BaseModel):
    system: str
    days: int
    signals: List[SignalHistoryEntry]
    count: int


class SignalRule(BaseModel):
    name: str
    enabled: bool = True
    aspect_types: Optional[List[str]] = None
    planets: Optional[List[str]] = None
    markets: List[str] = ["crypto", "stocks", "commodities"]
    min_strength: int = 5
    direction_bias: Optional[SignalDirection] = None


class SignalConfigRequest(BaseModel):
    rules: List[SignalRule]
    default_min_strength: int = Field(default=5, ge=1, le=10)
    enabled_aspects: List[str] = ["conjunction", "square", "trine", "opposition"]
    enabled_markets: List[str] = ["crypto", "stocks", "commodities"]


# Market Schemas
class PriceData(BaseModel):
    price: float
    change_24h: Optional[float] = None
    change_percent_24h: Optional[float] = None
    volume_24h: Optional[float] = None
    high_24h: Optional[float] = None
    low_24h: Optional[float] = None


class PriceResponse(BaseModel):
    symbol: str
    market: str
    timestamp: datetime
    price: float
    change_24h: Optional[float] = None
    change_percent_24h: Optional[float] = None
    volume_24h: Optional[float] = None


class HistoricalDataPoint(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: Optional[float] = None


class HistoricalDataResponse(BaseModel):
    symbol: str
    market: str
    interval: str
    data: List[HistoricalDataPoint]
    count: int


class CorrelationEntry(BaseModel):
    event_type: str
    occurrences: int
    avg_price_change: float
    positive_correlation: float
    negative_correlation: float
    neutral: float
    significance: str


class CorrelationResponse(BaseModel):
    symbol: str
    market: str
    analysis_period_days: int
    correlations: List[CorrelationEntry]


# Vedic-specific Schemas
class NakshatraInfo(BaseModel):
    name: str
    lord: str
    pada: int
    degree_start: float
    degree_end: float
    deity: str


class TithiInfo(BaseModel):
    number: int
    name: str
    paksha: str  # Shukla (waxing) or Krishna (waning)
    lord: str
    nature: str
