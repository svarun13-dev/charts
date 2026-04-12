export type Platform = 'xstocks' | 'ondo' | 'backed' | 'swarm' | 'securitize'
export type Chain = 'solana' | 'ethereum' | 'polygon'

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
  stale: boolean       // true if quote is older than 90s
  recordedAt: string   // ISO timestamp
}

export interface StockWithQuotes {
  ticker: string
  name: string
  assetType: 'equity' | 'etf'
  bestQuote: Quote         // lowest spreadPct, liquidityUsd as tiebreaker
  allQuotes: Quote[]       // all venues, sorted by spreadPct asc
}

export interface QuotesApiResponse {
  updatedAt: string
  stocks: StockWithQuotes[]
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
