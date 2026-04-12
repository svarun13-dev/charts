import type { StockWithQuotes, Quote, EarnOpportunity } from '@/types'
import { computeBestVenue } from './utils'
import { PLATFORM_META } from './platform-info'

/**
 * Off-chain reference prices — last NYSE/NASDAQ close.
 * In production these would come from Yahoo Finance, Polygon.io, or Finnhub.
 * On-chain prices are compared against these to compute the basis (premium/discount).
 */
export const REF_PRICES: Record<string, number> = {
  AAPL:    193.89,   // slightly above on-chain → on-chain trades at a discount
  AMZN:    189.10,   // on-chain cheaper → discount
  'BRK.B': 457.60,   // on-chain slightly above → small premium
  COIN:    197.40,   // on-chain slightly above → small premium
  GLD:     247.50,   // on-chain cheaper → discount
  GOOGL:   172.30,   // on-chain slightly above ref → small premium
  META:    492.80,   // on-chain slightly above → small premium
  MSFT:    384.75,   // on-chain cheaper → discount
  NFLX:    622.50,   // on-chain cheaper → discount
  NVDA:    865.20,   // on-chain cheaper → discount
  QQQ:     452.00,   // on-chain slightly above → small premium
  SPY:     533.80,   // on-chain slightly above → small premium
  TSLA:    172.90,   // on-chain cheaper → discount
}

// Mock 24h change % — replace with real historical data when backend is live
export const DAILY_CHANGE: Record<string, number> = {
  AAPL:    +1.24,
  AMZN:    -0.87,
  'BRK.B': +0.41,
  COIN:    +3.82,
  GLD:     +0.63,
  GOOGL:   -1.15,
  META:    +2.07,
  MSFT:    +0.93,
  NFLX:    -2.31,
  NVDA:    +4.56,
  QQQ:     +0.78,
  SPY:     +0.52,
  TSLA:    -1.94,
}

function makeQuote(
  platform: Quote['platform'],
  chain: Quote['chain'],
  mid: number,
  spreadPct: number,
  liquidityUsd: number,
  minBuyUsd: number,
  buyUrl: string,
): Quote {
  const half = spreadPct / 2
  const bid = mid * (1 - half / 100)
  const ask = mid * (1 + half / 100)
  const meta = PLATFORM_META[platform]
  return {
    platform, chain, bid, ask, mid, spreadPct, liquidityUsd, minBuyUsd, buyUrl,
    kycRequired: meta.kycRequired,
    tradingHours: meta.tradingHours,
    stale: false,
    recordedAt: new Date().toISOString(),
  }
}

// Realistic minimums per platform:
//   xstocks  → $100  (retail-friendly, no KYC)
//   swarm    → $100  (no KYC, Polygon)
//   backed   → $1,000  (KYC, Swiss-regulated)
//   securitize → $10,000 (KYC, broker-dealer)
//   ondo     → $100,000 (KYC, institutional)

const RAW: { ticker: string; name: string; assetType: 'equity' | 'etf'; quotes: Quote[] }[] = [
  {
    ticker: 'AAPL', name: 'Apple Inc.', assetType: 'equity',
    quotes: [
      makeQuote('xstocks',    'solana',   193.42, 0.04,  38_200_000,     100, 'https://app.xstocks.com/trade/AAPL'),
      makeQuote('backed',     'ethereum', 193.55, 0.12,  11_800_000,   1_000, 'https://backed.fi/products/bAAPL'),
      makeQuote('securitize', 'ethereum', 193.60, 0.18,  21_400_000,  10_000, 'https://securitize.io/invest/AAPL'),
    ],
  },
  {
    ticker: 'AMZN', name: 'Amazon.com Inc.', assetType: 'equity',
    quotes: [
      makeQuote('xstocks',    'solana',   188.74, 0.05,  29_100_000,     100, 'https://app.xstocks.com/trade/AMZN'),
      makeQuote('securitize', 'ethereum', 188.90, 0.20,  16_300_000,  10_000, 'https://securitize.io/invest/AMZN'),
    ],
  },
  {
    ticker: 'BRK.B', name: 'Berkshire Hathaway B', assetType: 'equity',
    quotes: [
      makeQuote('securitize', 'ethereum', 458.30, 0.22,  8_900_000, 10_000, 'https://securitize.io/invest/BRKB'),
    ],
  },
  {
    ticker: 'COIN', name: 'Coinbase Global Inc.', assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana', 197.88, 0.06, 14_600_000, 100, 'https://app.xstocks.com/trade/COIN'),
    ],
  },
  {
    ticker: 'GLD', name: 'SPDR Gold Trust ETF', assetType: 'etf',
    quotes: [
      makeQuote('backed', 'ethereum', 247.15, 0.10, 24_700_000, 1_000, 'https://backed.fi/products/bGLD'),
    ],
  },
  {
    ticker: 'GOOGL', name: 'Alphabet Inc.', assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',   172.55, 0.04,  31_900_000,       100, 'https://app.xstocks.com/trade/GOOGL'),
      makeQuote('ondo',    'ethereum', 172.70, 0.10,  48_200_000,   100_000, 'https://ondo.finance/trade/GOOGL'),
    ],
  },
  {
    ticker: 'META', name: 'Meta Platforms Inc.', assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',   493.12, 0.04,  27_500_000,     100, 'https://app.xstocks.com/trade/META'),
      makeQuote('backed',  'ethereum', 493.40, 0.15,   5_100_000,   1_000, 'https://backed.fi/products/bMETA'),
    ],
  },
  {
    ticker: 'MSFT', name: 'Microsoft Corporation', assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',   384.20, 0.04,  33_400_000,       100, 'https://app.xstocks.com/trade/MSFT'),
      makeQuote('ondo',    'ethereum', 384.55, 0.10,  61_800_000,   100_000, 'https://ondo.finance/trade/MSFT'),
    ],
  },
  {
    ticker: 'NFLX', name: 'Netflix Inc.', assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',  621.80, 0.05, 18_300_000, 100, 'https://app.xstocks.com/trade/NFLX'),
      makeQuote('swarm',   'polygon', 622.10, 0.14,  1_400_000, 100, 'https://swarm.com/trade/NFLX'),
    ],
  },
  {
    ticker: 'NVDA', name: 'NVIDIA Corporation', assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',  864.40, 0.04, 52_100_000, 100, 'https://app.xstocks.com/trade/NVDA'),
      makeQuote('swarm',   'polygon', 864.90, 0.13,  2_800_000, 100, 'https://swarm.com/trade/NVDA'),
    ],
  },
  {
    ticker: 'QQQ', name: 'Invesco QQQ Trust', assetType: 'etf',
    quotes: [
      makeQuote('ondo', 'ethereum', 452.30, 0.10, 74_600_000, 100_000, 'https://ondo.finance/trade/QQQ'),
    ],
  },
  {
    ticker: 'SPY', name: 'SPDR S&P 500 ETF', assetType: 'etf',
    quotes: [
      makeQuote('xstocks', 'solana',   534.10, 0.04, 44_200_000,       100, 'https://app.xstocks.com/trade/SPY'),
      makeQuote('ondo',    'ethereum', 534.35, 0.10, 88_500_000,   100_000, 'https://ondo.finance/trade/SPY'),
    ],
  },
  {
    ticker: 'TSLA', name: 'Tesla Inc.', assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',   172.41, 0.04, 42_100_000,     100, 'https://app.xstocks.com/trade/TSLA'),
      makeQuote('backed',  'ethereum', 172.55, 0.12,  8_400_000,   1_000, 'https://backed.fi/products/bTSLA'),
      makeQuote('swarm',   'polygon',  172.60, 0.16,  3_100_000,     100, 'https://swarm.com/trade/TSLA'),
    ],
  },
]

export function getMockQuotes(): StockWithQuotes[] {
  return RAW.map(({ ticker, name, assetType, quotes }) => {
    const sorted = [...quotes].sort((a, b) =>
      a.spreadPct !== b.spreadPct ? a.spreadPct - b.spreadPct : b.liquidityUsd - a.liquidityUsd
    )
    return {
      ticker, name, assetType,
      bestQuote: computeBestVenue(quotes),
      allQuotes: sorted,
      refPrice: REF_PRICES[ticker] ?? 0,
      refPriceSource: 'NYSE close',
    }
  }).sort((a, b) => a.ticker.localeCompare(b.ticker))
}

// ---------------------------------------------------------------------------
// Earn opportunities mock data
// ---------------------------------------------------------------------------

export const EARN_OPPORTUNITIES: EarnOpportunity[] = [
  // --- Treasury / yield products ---
  {
    id: 'ondo-usdy',
    protocol: 'ondo',
    name: 'USDY',
    description: 'Tokenised US Treasury yield, redeemable on-demand. Backed by short-term T-bills.',
    type: 'treasury',
    apy: 5.12,
    tvlUsd: 432_000_000,
    minDepositUsd: 500,
    chain: 'ethereum',
    depositAsset: 'USDC',
    risk: 'low',
    kycRequired: true,
    tradingHours: '24/7',
    url: 'https://ondo.finance/usdy',
  },
  {
    id: 'ondo-ousg',
    protocol: 'ondo',
    name: 'OUSG',
    description: 'Tokenised iShares Short Treasury Bond ETF. Institutional minimum.',
    type: 'treasury',
    apy: 5.04,
    tvlUsd: 289_000_000,
    minDepositUsd: 100_000,
    chain: 'ethereum',
    depositAsset: 'USDC',
    risk: 'low',
    kycRequired: true,
    tradingHours: 'market-hours',
    url: 'https://ondo.finance/ousg',
  },
  {
    id: 'backed-ibta',
    protocol: 'backed',
    name: 'bIBTA',
    description: 'Tokenised iShares $ Treasury Bond ETF. Daily NAV, redeemable via Backed.',
    type: 'treasury',
    apy: 4.81,
    tvlUsd: 18_400_000,
    minDepositUsd: 100,
    chain: 'ethereum',
    depositAsset: 'USDC',
    risk: 'low',
    kycRequired: true,
    tradingHours: 'market-hours',
    url: 'https://backed.fi/products/bIBTA',
  },
  // --- LP positions ---
  {
    id: 'xstocks-tsla-lp',
    protocol: 'xstocks',
    name: 'TSLA / USDC LP',
    description: 'Earn swap fees providing liquidity to the TSLA pool on Jupiter. Subject to impermanent loss.',
    type: 'lp',
    apy: 12.4,
    apyLabel: '~12.4%',
    tvlUsd: 8_200_000,
    minDepositUsd: 1,
    chain: 'solana',
    depositAsset: 'TSLA + USDC',
    risk: 'medium',
    kycRequired: false,
    tradingHours: '24/7',
    url: 'https://app.xstocks.com/pools/TSLA',
  },
  {
    id: 'xstocks-nvda-lp',
    protocol: 'xstocks',
    name: 'NVDA / USDC LP',
    description: 'Earn swap fees providing liquidity to the NVDA pool on Jupiter.',
    type: 'lp',
    apy: 14.2,
    apyLabel: '~14.2%',
    tvlUsd: 4_100_000,
    minDepositUsd: 1,
    chain: 'solana',
    depositAsset: 'NVDA + USDC',
    risk: 'medium',
    kycRequired: false,
    tradingHours: '24/7',
    url: 'https://app.xstocks.com/pools/NVDA',
  },
  {
    id: 'xstocks-spy-lp',
    protocol: 'xstocks',
    name: 'SPY / USDC LP',
    description: 'Lower-volatility LP position. SPY tracks the S&P 500 so impermanent loss is reduced.',
    type: 'lp',
    apy: 8.6,
    apyLabel: '~8.6%',
    tvlUsd: 11_300_000,
    minDepositUsd: 1,
    chain: 'solana',
    depositAsset: 'SPY + USDC',
    risk: 'medium',
    kycRequired: false,
    tradingHours: '24/7',
    url: 'https://app.xstocks.com/pools/SPY',
  },
  {
    id: 'ondo-msft-lp',
    protocol: 'ondo',
    name: 'MSFT / USDC LP',
    description: 'Concentrated Uniswap v3 position on the MSFT pool. Fee tier 0.05%.',
    type: 'lp',
    apy: 7.2,
    apyLabel: '~7.2%',
    tvlUsd: 61_800_000,
    minDepositUsd: 50,
    chain: 'ethereum',
    depositAsset: 'MSFT + USDC',
    risk: 'medium',
    kycRequired: true,
    tradingHours: '24/7',
    url: 'https://ondo.finance/pools/MSFT',
  },
  {
    id: 'swarm-nflx-lp',
    protocol: 'swarm',
    name: 'NFLX / USDC LP',
    description: 'QuickSwap v3 LP on Polygon. No KYC, low gas fees.',
    type: 'lp',
    apy: 9.8,
    apyLabel: '~9.8%',
    tvlUsd: 1_400_000,
    minDepositUsd: 1,
    chain: 'polygon',
    depositAsset: 'NFLX + USDC',
    risk: 'medium',
    kycRequired: false,
    tradingHours: '24/7',
    url: 'https://swarm.com/pools/NFLX',
  },
  // --- Lending ---
  {
    id: 'ondo-lending',
    protocol: 'ondo',
    name: 'RWA Lending',
    description: 'Lend USDC to verified institutions using tokenised securities as collateral. Fixed-rate tranches.',
    type: 'lending',
    apy: 6.8,
    apyLabel: '~6.8%',
    tvlUsd: 94_000_000,
    minDepositUsd: 10_000,
    chain: 'ethereum',
    depositAsset: 'USDC',
    risk: 'low',
    kycRequired: true,
    tradingHours: 'market-hours',
    url: 'https://ondo.finance/lending',
  },
]
