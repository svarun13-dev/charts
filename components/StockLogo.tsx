'use client'

import { useState } from 'react'

// Map ticker → company domain for Clearbit logo lookup
const TICKER_DOMAIN: Record<string, string> = {
  AAPL:    'apple.com',
  AMZN:    'amazon.com',
  'BRK.B': 'berkshirehathaway.com',
  COIN:    'coinbase.com',
  GLD:     'spdrgoldshares.com',
  GOOGL:   'abc.xyz',
  META:    'meta.com',
  MSFT:    'microsoft.com',
  NFLX:    'netflix.com',
  NVDA:    'nvidia.com',
  QQQ:     'invesco.com',
  SPY:     'ssga.com',
  TSLA:    'tesla.com',
}

// Consistent fallback bg color per ticker
const FALLBACK_COLORS: Record<string, string> = {
  AAPL:    '#1c1c1e',
  AMZN:    '#1a1500',
  'BRK.B': '#0e1a0e',
  COIN:    '#001833',
  GLD:     '#1a1400',
  GOOGL:   '#001a33',
  META:    '#001433',
  MSFT:    '#001a33',
  NFLX:    '#1a0000',
  NVDA:    '#00200d',
  QQQ:     '#1a0033',
  SPY:     '#001a1a',
  TSLA:    '#001a0d',
}

interface StockLogoProps {
  ticker: string
  size?: number
}

export default function StockLogo({ ticker, size = 28 }: StockLogoProps) {
  const [failed, setFailed] = useState(false)
  const domain = TICKER_DOMAIN[ticker]
  const fallbackBg = FALLBACK_COLORS[ticker] ?? '#111'
  const initials = ticker.replace('.', '').slice(0, 2)

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: 6,
    flexShrink: 0,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: fallbackBg,
  }

  if (!domain || failed) {
    return (
      <div style={style}>
        <span style={{
          fontSize: size * 0.33,
          fontWeight: 600,
          color: '#666',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          {initials}
        </span>
      </div>
    )
  }

  return (
    <div style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={ticker}
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain' }}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
