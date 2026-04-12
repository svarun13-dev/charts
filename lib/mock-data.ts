import type { StockWithQuotes, Quote } from '@/types'
import { computeBestVenue } from './utils'

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
  return {
    platform,
    chain,
    bid,
    ask,
    mid,
    spreadPct,
    liquidityUsd,
    minBuyUsd,
    buyUrl,
    stale: false,
    recordedAt: new Date().toISOString(),
  }
}

const RAW: {
  ticker: string
  name: string
  assetType: 'equity' | 'etf'
  quotes: Quote[]
}[] = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    assetType: 'equity',
    quotes: [
      makeQuote('xstocks',    'solana',   193.42, 0.04,  38_200_000, 1,  'https://app.xstocks.com/trade/AAPL'),
      makeQuote('backed',     'ethereum', 193.55, 0.12,  11_800_000, 10, 'https://backed.fi/products/bAAPL'),
      makeQuote('securitize', 'ethereum', 193.60, 0.18,  21_400_000, 50, 'https://securitize.io/invest/AAPL'),
    ],
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    assetType: 'equity',
    quotes: [
      makeQuote('xstocks',    'solana',   188.74, 0.05,  29_100_000, 1,  'https://app.xstocks.com/trade/AMZN'),
      makeQuote('securitize', 'ethereum', 188.90, 0.20,  16_300_000, 50, 'https://securitize.io/invest/AMZN'),
    ],
  },
  {
    ticker: 'BRK.B',
    name: 'Berkshire Hathaway Inc. B',
    assetType: 'equity',
    quotes: [
      makeQuote('securitize', 'ethereum', 458.30, 0.22,  8_900_000, 50, 'https://securitize.io/invest/BRKB'),
    ],
  },
  {
    ticker: 'COIN',
    name: 'Coinbase Global Inc.',
    assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana', 197.88, 0.06, 14_600_000, 1, 'https://app.xstocks.com/trade/COIN'),
    ],
  },
  {
    ticker: 'GLD',
    name: 'SPDR Gold Trust ETF',
    assetType: 'etf',
    quotes: [
      makeQuote('backed', 'ethereum', 247.15, 0.10, 24_700_000, 10, 'https://backed.fi/products/bGLD'),
    ],
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',   172.55, 0.04,  31_900_000, 1,  'https://app.xstocks.com/trade/GOOGL'),
      makeQuote('ondo',    'ethereum', 172.70, 0.10,  48_200_000, 50, 'https://ondo.finance/trade/GOOGL'),
    ],
  },
  {
    ticker: 'META',
    name: 'Meta Platforms Inc.',
    assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',   493.12, 0.04,  27_500_000, 1,  'https://app.xstocks.com/trade/META'),
      makeQuote('backed',  'ethereum', 493.40, 0.15,   5_100_000, 10, 'https://backed.fi/products/bMETA'),
    ],
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',   384.20, 0.04,  33_400_000, 1,  'https://app.xstocks.com/trade/MSFT'),
      makeQuote('ondo',    'ethereum', 384.55, 0.10,  61_800_000, 50, 'https://ondo.finance/trade/MSFT'),
    ],
  },
  {
    ticker: 'NFLX',
    name: 'Netflix Inc.',
    assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',  621.80, 0.05, 18_300_000, 1, 'https://app.xstocks.com/trade/NFLX'),
      makeQuote('swarm',   'polygon', 622.10, 0.14,  1_400_000, 1, 'https://swarm.com/trade/NFLX'),
    ],
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',  864.40, 0.04, 52_100_000, 1, 'https://app.xstocks.com/trade/NVDA'),
      makeQuote('swarm',   'polygon', 864.90, 0.13,  2_800_000, 1, 'https://swarm.com/trade/NVDA'),
    ],
  },
  {
    ticker: 'QQQ',
    name: 'Invesco QQQ Trust',
    assetType: 'etf',
    quotes: [
      makeQuote('ondo', 'ethereum', 452.30, 0.10, 74_600_000, 50, 'https://ondo.finance/trade/QQQ'),
    ],
  },
  {
    ticker: 'SPY',
    name: 'SPDR S&P 500 ETF',
    assetType: 'etf',
    quotes: [
      makeQuote('xstocks', 'solana',   534.10, 0.04, 44_200_000, 1,  'https://app.xstocks.com/trade/SPY'),
      makeQuote('ondo',    'ethereum', 534.35, 0.10, 88_500_000, 50, 'https://ondo.finance/trade/SPY'),
    ],
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    assetType: 'equity',
    quotes: [
      makeQuote('xstocks', 'solana',   172.41, 0.04, 42_100_000, 1,  'https://app.xstocks.com/trade/TSLA'),
      makeQuote('backed',  'ethereum', 172.55, 0.12,  8_400_000, 10, 'https://backed.fi/products/bTSLA'),
      makeQuote('swarm',   'polygon',  172.60, 0.16,  3_100_000, 1,  'https://swarm.com/trade/TSLA'),
    ],
  },
]

export function getMockQuotes(): StockWithQuotes[] {
  return RAW.map(({ ticker, name, assetType, quotes }) => {
    const sorted = [...quotes].sort((a, b) => {
      if (a.spreadPct !== b.spreadPct) return a.spreadPct - b.spreadPct
      return b.liquidityUsd - a.liquidityUsd
    })
    return {
      ticker,
      name,
      assetType,
      bestQuote: computeBestVenue(quotes),
      allQuotes: sorted,
    }
  }).sort((a, b) => a.ticker.localeCompare(b.ticker))
}
