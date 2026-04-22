'use client'

import { useEffect, useState } from 'react'
import type { QuotesApiResponse, StockWithQuotes } from '@/types'
import { formatPrice } from '@/lib/utils'
import { DAILY_CHANGE } from '@/lib/mock-data'

interface TickerItem { ticker: string; mid: number; changePct: number }

function TickerCell({ item }: { item: TickerItem }) {
  const up = item.changePct >= 0
  return (
    <div className="flex items-center gap-2 px-5" style={{
      borderRight: '1px solid rgba(255,255,255,0.04)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        color: '#ede8de', fontFamily: 'var(--font-mono, monospace)',
      }}>
        {item.ticker}
      </span>
      <span style={{
        fontSize: 11, color: 'var(--text-2)',
        fontFamily: 'var(--font-mono, monospace)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {formatPrice(item.mid)}
      </span>
      <span style={{
        fontSize: 10, fontWeight: 600,
        color: up ? 'var(--up)' : 'var(--down)',
        fontFamily: 'var(--font-mono, monospace)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {up ? '▲' : '▼'} {up ? '+' : ''}{item.changePct.toFixed(2)}%
      </span>
    </div>
  )
}

export default function TickerTape() {
  const [items, setItems] = useState<TickerItem[]>([])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/quotes', { cache: 'no-store' })
        if (!res.ok) return
        const data: QuotesApiResponse = await res.json()
        setItems(data.stocks.map((s: StockWithQuotes) => ({
          ticker: s.ticker,
          mid: s.bestQuote.mid,
          changePct: DAILY_CHANGE[s.ticker] ?? 0,
        })))
      } catch { /* non-critical */ }
    }
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  if (items.length === 0) return null
  const doubled = [...items, ...items]

  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'var(--surface-2)',
      height: 32, overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 48, zIndex: 2,
        background: 'linear-gradient(to right, var(--surface-2), transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 48, zIndex: 2,
        background: 'linear-gradient(to left, var(--surface-2), transparent)',
        pointerEvents: 'none',
      }} />
      <div className="ticker-track" style={{ height: '100%', alignItems: 'center' }}>
        {doubled.map((item, i) => <TickerCell key={`${item.ticker}-${i}`} item={item} />)}
      </div>
    </div>
  )
}
