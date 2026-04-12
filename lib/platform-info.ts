import type { Platform, TradingHours } from '@/types'

export interface PlatformMeta {
  label: string
  description: string
  url: string
  kycRequired: boolean
  tradingHours: TradingHours
  color: string
}

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  xstocks: {
    label: 'xStocks',
    description: 'Solana DEX-based tokenised stocks via Jupiter. No KYC, $1 min, trades 24/7.',
    url: 'https://xstocks.com',
    kycRequired: false,
    tradingHours: '24/7',
    color: '#60a5fa',
  },
  ondo: {
    label: 'Ondo Finance',
    description: 'Institutional tokenised securities on Ethereum. Uniswap v3 pools, KYC required.',
    url: 'https://ondo.finance',
    kycRequired: true,
    tradingHours: '24/7',
    color: '#34d399',
  },
  backed: {
    label: 'Backed Finance',
    description: 'ERC-20 tokens backed 1:1 by real shares. Chainlink price feeds, KYC required. Prices track NAV during market hours.',
    url: 'https://backed.fi',
    kycRequired: true,
    tradingHours: 'market-hours',
    color: '#fbbf24',
  },
  swarm: {
    label: 'Swarm Markets',
    description: 'Regulated tokenised assets on Polygon via QuickSwap. No KYC to trade, licensed in Germany.',
    url: 'https://swarm.com',
    kycRequired: false,
    tradingHours: '24/7',
    color: '#f472b6',
  },
  securitize: {
    label: 'Securitize',
    description: 'SEC-registered digital securities platform. Full KYC/AML, broker-dealer regulated. Prices follow market hours.',
    url: 'https://securitize.io',
    kycRequired: true,
    tradingHours: 'market-hours',
    color: '#a78bfa',
  },
}
