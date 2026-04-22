export type Platform = 'xstocks' | 'ondo' | 'backed' | 'swarm' | 'securitize'
export type Chain = 'solana' | 'ethereum' | 'polygon'
export type TradingHours = '24/7' | 'market-hours'
export type RiskLevel = 'low' | 'medium' | 'high'
export type EarnType = 'treasury' | 'lp' | 'lending'

export interface Quote {
  platform: Platform
  chain: Chain
  bid: number
  ask: number
  mid: number
  spreadPct: number
  liquidityUsd: number
  buyUrl: string
  minBuyUsd: number
  kycRequired: boolean
  tradingHours: TradingHours
  stale: boolean
  recordedAt: string
}

export interface StockWithQuotes {
  ticker: string
  name: string
  assetType: 'equity' | 'etf'
  bestQuote: Quote
  allQuotes: Quote[]
  /** Off-chain reference price (e.g. last NYSE close from Yahoo Finance / Polygon.io) */
  refPrice: number
  /** Human-readable source label */
  refPriceSource: string
}

export interface QuotesApiResponse {
  updatedAt: string
  stocks: StockWithQuotes[]
}

/** A single platform-listing event — emitted each time a stock appears on a new venue */
export interface ListingEvent {
  id: string           // e.g. "aapl-xstocks-solana"
  ticker: string
  name: string
  assetType: 'equity' | 'etf'
  platform: Platform
  chain: Chain
  listedAt: string     // ISO timestamp
  priceAtListing: number
  liquidityUsd: number
  kycRequired: boolean
  tradingHours: TradingHours
  buyUrl: string
}

/** Aggregated trending entry for a ticker */
export interface TrendingStock {
  ticker: string
  name: string
  assetType: 'equity' | 'etf'
  changePct: number          // 24h price change
  totalLiquidityUsd: number  // sum across all venues
  venueCount: number
  bestSpreadPct: number
  bestPlatform: Platform
  bestChain: Chain
  price: number
  score: number              // composite trending score
}

export interface EarnOpportunity {
  id: string
  protocol: Platform
  name: string
  description: string
  type: EarnType
  apy: number
  apyLabel?: string        // e.g. "variable" or "up to 14%"
  tvlUsd: number
  minDepositUsd: number
  chain: Chain
  depositAsset: string     // e.g. "USDC" or "USDC + TSLA"
  risk: RiskLevel
  kycRequired: boolean
  tradingHours: TradingHours
  url: string
}

// Raw shape stored in Redis
export interface RedisQuote {
  bid: number
  ask: number
  mid: number
  spreadPct: number
  liquidityUsd: number
  recordedAt: string
}
