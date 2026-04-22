'use client'

import Link from 'next/link'
import type { TrendingStock } from '@/types'
import { getTrendingStocks } from '@/lib/mock-data'
import { PLATFORM_META } from '@/lib/platform-info'
import { formatPrice, formatLiquidity } from '@/lib/utils'
import StockLogo from './StockLogo'

const CHAIN_COLOR: Record<string, string> = { solana: '#c084fc', ethereum: '#818cf8', polygon: '#a78bfa' }
const CHAIN_LABEL: Record<string, string> = { solana: 'SOL', ethereum: 'ETH', polygon: 'POL' }

function SparkBar({ pct }: { pct: number }) {
  // Simple visual bar showing relative score
  return (
    <div style={{ width: 40, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
    </div>
  )
}

export default function TrendingStocks() {
  const stocks = getTrendingStocks()
  const maxScore = stocks[0]?.score ?? 1

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#e5e5e5', letterSpacing: '-0.01em' }}>
          Trending
        </h2>
        <Link href="/markets" style={{ fontSize: 11, color: '#555', textDecoration: 'none' }}
          className="hover:text-white transition-colors">
          View all →
        </Link>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 90px 80px 80px 80px 50px',
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: '#070707',
        }}>
          {['#', 'Asset', 'Price', '24h', 'Liquidity', 'Best venue', 'Venues'].map(h => (
            <span key={h} style={{ fontSize: 10, color: '#444', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {stocks.map((s, i) => {
          const up        = s.changePct >= 0
          const meta      = PLATFORM_META[s.bestPlatform]
          const chainColor = CHAIN_COLOR[s.bestChain] ?? '#666'

          return (
            <Link
              key={s.ticker}
              href={`/markets?ticker=${s.ticker}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 90px 80px 80px 80px 50px',
                padding: '11px 16px',
                borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                textDecoration: 'none',
                alignItems: 'center',
              }}
              className="hover:bg-white/[0.02] transition-colors"
            >
              {/* Rank */}
              <span style={{ fontSize: 12, color: '#333', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>

              {/* Logo + ticker + activity bar */}
              <div className="flex items-center gap-2.5">
                <StockLogo ticker={s.ticker} size={26} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>{s.ticker}</span>
                    {s.assetType === 'etf' && (
                      <span style={{ fontSize: 9, color: '#555', fontWeight: 500, letterSpacing: '0.06em' }}>ETF</span>
                    )}
                  </div>
                  <SparkBar pct={(s.score / maxScore) * 100} />
                </div>
              </div>

              {/* Price */}
              <span style={{ fontSize: 13, fontWeight: 500, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>
                {formatPrice(s.price)}
              </span>

              {/* 24h change */}
              <span style={{ fontSize: 12, fontWeight: 600, color: up ? '#34d399' : '#f87171', fontVariantNumeric: 'tabular-nums' }}>
                {up ? '+' : ''}{s.changePct.toFixed(2)}%
              </span>

              {/* Total liquidity */}
              <span style={{ fontSize: 12, color: '#666', fontVariantNumeric: 'tabular-nums' }}>
                {formatLiquidity(s.totalLiquidityUsd)}
              </span>

              {/* Best venue + chain */}
              <div className="flex items-center gap-1">
                <span style={{
                  fontSize: 10, fontWeight: 500, padding: '1px 6px',
                  color: meta.color, background: `${meta.color}14`,
                  border: `1px solid ${meta.color}35`, borderRadius: 4,
                }}>
                  {meta.label}
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 500, color: chainColor,
                  background: `${chainColor}12`, border: `1px solid ${chainColor}30`,
                  borderRadius: 3, padding: '1px 4px',
                }}>
                  {CHAIN_LABEL[s.bestChain] ?? s.bestChain}
                </span>
              </div>

              {/* Venue count */}
              <span style={{ fontSize: 12, color: s.venueCount > 1 ? '#888' : '#444' }}>
                {s.venueCount}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
