'use client'

import Link from 'next/link'
import type { TrendingStock } from '@/types'
import { getTrendingStocks } from '@/lib/mock-data'
import { PLATFORM_META } from '@/lib/platform-info'
import { formatPrice, formatLiquidity } from '@/lib/utils'
import StockLogo from './StockLogo'

const CHAIN_LABEL: Record<string, string> = { solana: 'SOL', ethereum: 'ETH', polygon: 'POL' }
const CHAIN_COLOR: Record<string, string> = { solana: '#c084fc', ethereum: '#818cf8', polygon: '#a78bfa' }

const COL = {
  rank:    '30px',
  asset:   '1fr',
  price:   '100px',
  change:  '70px',
  liq:     '90px',
  venue:   '130px',
  venues:  '55px',
}

const GRID = `${COL.rank} ${COL.asset} ${COL.price} ${COL.change} ${COL.liq} ${COL.venue} ${COL.venues}`

function HeaderCell({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'var(--text-3)', textAlign: right ? 'right' : 'left',
      display: 'block',
    }}>
      {children}
    </span>
  )
}

export default function TrendingStocks() {
  const stocks   = getTrendingStocks()
  const maxScore = stocks[0]?.score ?? 1

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="fin-section">
          <h2>Hot Names</h2>
        </div>
        <Link href="/markets" style={{
          fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-3)', textDecoration: 'none',
        }} className="hover:text-white transition-colors">
          All Markets →
        </Link>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: GRID,
          padding: '8px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'var(--surface-2)',
          alignItems: 'center', gap: 8,
        }}>
          <HeaderCell>#</HeaderCell>
          <HeaderCell>Asset</HeaderCell>
          <HeaderCell right>Price</HeaderCell>
          <HeaderCell right>24H</HeaderCell>
          <HeaderCell right>Liquidity</HeaderCell>
          <HeaderCell>Best Venue</HeaderCell>
          <HeaderCell right>Venues</HeaderCell>
        </div>

        {stocks.map((s, i) => {
          const up         = s.changePct >= 0
          const meta       = PLATFORM_META[s.bestPlatform]
          const chainColor = CHAIN_COLOR[s.bestChain] ?? '#666'
          const actPct     = (s.score / maxScore) * 100

          return (
            <Link
              key={s.ticker}
              href={`/markets?ticker=${s.ticker}`}
              style={{
                display: 'grid', gridTemplateColumns: GRID,
                padding: '9px 14px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                textDecoration: 'none', alignItems: 'center', gap: 8,
              }}
              className="hover:bg-white/[0.02] transition-colors"
            >
              {/* Rank */}
              <span style={{
                fontSize: 11, color: i < 3 ? 'var(--amber)' : 'var(--text-3)',
                fontFamily: 'var(--font-mono, monospace)', fontWeight: 600,
              }}>
                {i + 1}
              </span>

              {/* Asset */}
              <div className="flex items-center gap-2">
                <StockLogo ticker={s.ticker} size={24} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: '#fff',
                      letterSpacing: '-0.01em', fontFamily: 'var(--font-mono, monospace)',
                    }}>
                      {s.ticker}
                    </span>
                    {s.assetType === 'etf' && (
                      <span style={{ fontSize: 8, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.08em' }}>ETF</span>
                    )}
                  </div>
                  {/* Activity bar */}
                  <div style={{ width: 36, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, marginTop: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${actPct}%`, height: '100%', background: 'var(--amber)', borderRadius: 1, opacity: 0.6 }} />
                  </div>
                </div>
              </div>

              {/* Price */}
              <span style={{
                fontSize: 12, fontWeight: 600, color: 'var(--text)', textAlign: 'right',
                fontFamily: 'var(--font-mono, monospace)', fontVariantNumeric: 'tabular-nums',
                display: 'block',
              }}>
                {formatPrice(s.price)}
              </span>

              {/* 24h change */}
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: up ? 'var(--up)' : 'var(--down)',
                  fontFamily: 'var(--font-mono, monospace)', fontVariantNumeric: 'tabular-nums',
                  background: up ? 'var(--up-dim)' : 'var(--down-dim)',
                  padding: '1px 5px', borderRadius: 2,
                }}>
                  {up ? '+' : ''}{s.changePct.toFixed(2)}%
                </span>
              </div>

              {/* Total liquidity */}
              <span style={{
                fontSize: 11, color: 'var(--text-2)', textAlign: 'right',
                fontFamily: 'var(--font-mono, monospace)', display: 'block',
              }}>
                {formatLiquidity(s.totalLiquidityUsd)}
              </span>

              {/* Best venue */}
              <div className="flex items-center gap-1">
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                  padding: '2px 6px', borderRadius: 2,
                  color: meta.color, background: `${meta.color}14`,
                  border: `1px solid ${meta.color}30`,
                }}>
                  {meta.label.toUpperCase()}
                </span>
                <span style={{
                  fontSize: 8, fontWeight: 600, color: chainColor,
                  background: `${chainColor}12`, border: `1px solid ${chainColor}28`,
                  borderRadius: 2, padding: '1px 4px',
                }}>
                  {CHAIN_LABEL[s.bestChain] ?? s.bestChain}
                </span>
              </div>

              {/* Venue count */}
              <span style={{
                fontSize: 12, textAlign: 'right', display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                color: s.venueCount > 2 ? 'var(--amber)' : s.venueCount > 1 ? 'var(--text-2)' : 'var(--text-3)',
                fontWeight: s.venueCount > 1 ? 600 : 400,
              }}>
                {s.venueCount}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
