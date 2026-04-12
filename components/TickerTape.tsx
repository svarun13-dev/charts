'use client'

import { useEffect, useState } from 'react'
import type { QuotesApiResponse, StockWithQuotes } from '@/types'
import { formatPrice } from '@/lib/utils'
import { DAILY_CHANGE } from '@/lib/mock-data'

interface TickerItem {
  ticker: string
  mid: number
  changePct: number
}

function TickerCell({ item }: { item: TickerItem }) {
  const up = item.changePct >= 0
  const changeColor = up ? '#34d399' : '#f87171'
  const sign = up ? '+' : ''

  return (
    <div
      className="flex items-center gap-2 px-5"
      style={{ borderRight: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, color: '#e5e5e5', letterSpacing: '0.01em' }}>
        {item.ticker}
      </span>
      <span style={{ fontSize: 12, color: '#888', fontVariantNumeric: 'tabular-nums' }}>
        {formatPrice(item.mid)}
      </span>
      <span style={{ fontSize: 11, fontWeight: 500, color: changeColor, fontVariantNumeric: 'tabular-nums' }}>
        {sign}{item.changePct.toFixed(2)}%
      </span>
      <span style={{ fontSize: 10, color: up ? '#34d39944' : '#f8717144' }}>
        {up ? '▲' : '▼'}
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
        setItems(
          data.stocks.map((s: StockWithQuotes) => ({
            ticker: s.ticker,
            mid: s.bestQuote.mid,
            changePct: DAILY_CHANGE[s.ticker] ?? 0,
          }))
        )
      } catch {
        // silently skip — tape is non-critical
      }
    }

    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  if (items.length === 0) return null

  // Duplicate so the scroll loop is seamless
  const doubled = [...items, ...items]

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#050505',
        height: 36,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fade edges */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, zIndex: 2,
        background: 'linear-gradient(to right, #050505, transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, zIndex: 2,
        background: 'linear-gradient(to left, #050505, transparent)',
        pointerEvents: 'none',
      }} />

      <div className="ticker-track" style={{ height: '100%', alignItems: 'center' }}>
        {doubled.map((item, i) => (
          <TickerCell key={`${item.ticker}-${i}`} item={item} />
        ))}
      </div>
    </div>
  )
}
