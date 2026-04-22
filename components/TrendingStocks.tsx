'use client'

import Link from 'next/link'
import { getTrendingStocks } from '@/lib/mock-data'
import { PLATFORM_META } from '@/lib/platform-info'
import { formatPrice } from '@/lib/utils'
import StockLogo from './StockLogo'

const CHAIN_LABEL: Record<string, string> = { solana: 'SOL', ethereum: 'ETH', polygon: 'POL' }

export default function TrendingStocks() {
  const stocks   = getTrendingStocks()
  const maxScore = stocks[0]?.score ?? 1

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="fin-section">
          <h2>Hot Names</h2>
        </div>
        <Link href="/markets" style={{
          fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-3)', textDecoration: 'none',
        }} className="hover:text-white transition-colors">
          All →
        </Link>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        {stocks.map((s, i) => {
          const up   = s.changePct >= 0
          const meta = PLATFORM_META[s.bestPlatform]
          const actPct = (s.score / maxScore) * 100

          return (
            <Link
              key={s.ticker}
              href={`/markets?ticker=${s.ticker}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                textDecoration: 'none',
              }}
              className="hover:bg-white/[0.02] transition-colors"
            >
              {/* Rank */}
              <span style={{
                fontSize: 10, fontWeight: 700, width: 16, flexShrink: 0,
                color: i < 3 ? 'var(--amber)' : 'var(--text-3)',
                fontFamily: 'var(--font-mono, monospace)',
              }}>
                {i + 1}
              </span>

              {/* Logo */}
              <StockLogo ticker={s.ticker} size={22} />

              {/* Ticker + activity bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: '#fff',
                  fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-0.01em',
                }}>
                  {s.ticker}
                </div>
                <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, marginTop: 3 }}>
                  <div style={{ width: `${actPct}%`, height: '100%', background: 'var(--amber)', borderRadius: 1, opacity: 0.5 }} />
                </div>
              </div>

              {/* Price */}
              <span style={{
                fontSize: 11, fontWeight: 600, color: 'var(--text)',
                fontFamily: 'var(--font-mono, monospace)', fontVariantNumeric: 'tabular-nums',
              }}>
                {formatPrice(s.price)}
              </span>

              {/* Change */}
              <span style={{
                fontSize: 10, fontWeight: 700, minWidth: 52, textAlign: 'right',
                color: up ? 'var(--up)' : 'var(--down)',
                fontFamily: 'var(--font-mono, monospace)',
              }}>
                {up ? '+' : ''}{s.changePct.toFixed(2)}%
              </span>
            </Link>
          )
        })}
      </div>

      {/* Venue legend */}
      <div style={{ marginTop: 8, fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.04em' }}>
        RANKED BY LIQUIDITY + MOMENTUM + VENUE COUNT
      </div>
    </section>
  )
}
