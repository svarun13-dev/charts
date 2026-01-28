// Astrology Types
export type AstrologySystem = 'western' | 'vedic'

export interface PlanetPosition {
  planet: string
  planet_name: string
  symbol: string
  longitude: number
  latitude: number
  speed: number
  retrograde: boolean
  sign: string
  sign_symbol: string
  degree_in_sign: number
  // Vedic specific
  nakshatra?: string
  nakshatra_lord?: string
  nakshatra_pada?: number
}

export interface Aspect {
  planet1: string
  planet2: string
  aspect_type: string
  symbol: string
  angle: number
  orb: number
  nature: 'harmonious' | 'challenging' | 'neutral'
  strength: number
  applying: boolean
}

export interface MoonPhase {
  phase_name: string
  phase_symbol: string
  illumination: number
  days_until_new: number
  days_until_full: number
  moon_sign: string
  moon_degree: number
}

// Signal Types
export type SignalDirection = 'bullish' | 'bearish' | 'neutral' | 'volatile'
export type SignalStrength = 'weak' | 'moderate' | 'strong' | 'very_strong'
export type MarketType = 'crypto' | 'stocks' | 'commodities'

export interface TradingSignal {
  id: string
  timestamp: string
  signal_type: string
  direction: SignalDirection
  strength: SignalStrength
  markets: string[]
  assets?: string[]
  trigger: string
  planetary_config: Record<string, unknown>
  description: string
  expires?: string
}

export interface RetrogradeAlert {
  planet: string
  sign: string
  alert_level: 'high' | 'moderate' | 'low'
  message: string
  trading_advice: string
}

// Market Types
export interface PriceData {
  symbol: string
  market: MarketType
  price: number
  change_24h?: number
  change_percent_24h?: number
  volume_24h?: number
}

export interface HistoricalDataPoint {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

// Vedic Types
export interface Nakshatra {
  name: string
  lord: string
  pada: number
  deity: string
}

export interface Tithi {
  number: number
  name: string
  paksha: 'Shukla' | 'Krishna'
  lord: string
}

// UI State Types
export interface AppState {
  system: AstrologySystem
  selectedMarket: MarketType | 'all'
  darkMode: boolean
}
