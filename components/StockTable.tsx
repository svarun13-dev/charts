'use client'

import { useState, useEffect, useCallback } from 'react'
import type { QuotesApiResponse, StockWithQuotes } from '@/types'
import { timeAgo } from '@/lib/utils'
import StockRow from './StockRow'
import SearchBar from './SearchBar'

const POLL_INTERVAL_MS = 30_000

const COL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  color: '#333',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  paddingBottom: 10,
}

function LoadingSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <td className="py-3.5 pl-5 pr-4">
            <div className="h-3.5 w-10 rounded animate-pulse" style={{ background: '#111' }} />
          </td>
          <td className="py-3.5 px-4 hidden sm:table-cell">
            <div className="h-3 w-36 rounded animate-pulse" style={{ background: '#111' }} />
          </td>
          <td className="py-3.5 px-4 hidden md:table-cell">
            <div className="h-5 w-14 rounded animate-pulse" style={{ background: '#111' }} />
          </td>
          <td className="py-3.5 px-4">
            <div className="h-3.5 w-20 rounded animate-pulse" style={{ background: '#111' }} />
          </td>
          <td className="py-3.5 px-4">
            <div className="h-3 w-10 rounded animate-pulse" style={{ background: '#111' }} />
          </td>
          <td className="py-3.5 px-4 hidden lg:table-cell">
            <div className="h-3 w-12 rounded animate-pulse" style={{ background: '#111' }} />
          </td>
          <td className="py-3.5 pl-4 pr-5 hidden md:table-cell" />
        </tr>
      ))}
    </tbody>
  )
}

export default function StockTable() {
  const [data, setData] = useState<QuotesApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch('/api/quotes', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: QuotesApiResponse = await res.json()
      setData(json)
      setLastFetch(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuotes()
    const id = setInterval(fetchQuotes, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchQuotes])

  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000)
    return () => clearInterval(id)
  }, [])

  const filteredStocks: StockWithQuotes[] = (data?.stocks ?? []).filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  })

  return (
    <div>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between mb-0 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <SearchBar value={search} onChange={setSearch} count={filteredStocks.length} />
        <div className="flex items-center gap-3" style={{ color: '#333', fontSize: 12 }}>
          {lastFetch && <span>{timeAgo(lastFetch.toISOString())}</span>}
          <button
            onClick={fetchQuotes}
            title="Refresh"
            className="hover:text-white transition-colors"
            style={{ color: '#333', lineHeight: 1 }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr>
            <th style={{ ...COL_STYLE, paddingLeft: 20, paddingRight: 16, width: 120, textAlign: 'left', paddingTop: 14 }}>Ticker</th>
            <th style={{ ...COL_STYLE, padding: '14px 16px 10px', textAlign: 'left' }} className="hidden sm:table-cell">Name</th>
            <th style={{ ...COL_STYLE, padding: '14px 16px 10px', textAlign: 'left', width: 110 }} className="hidden md:table-cell">Best venue</th>
            <th style={{ ...COL_STYLE, padding: '14px 16px 10px', textAlign: 'left', width: 110 }}>Price</th>
            <th style={{ ...COL_STYLE, padding: '14px 16px 10px', textAlign: 'left', width: 80 }}>Spread</th>
            <th style={{ ...COL_STYLE, padding: '14px 16px 10px', textAlign: 'left', width: 90 }} className="hidden lg:table-cell">Liquidity</th>
            <th style={{ ...COL_STYLE, padding: '14px 20px 10px', textAlign: 'left' }} className="hidden md:table-cell">Also on</th>
          </tr>
        </thead>

        {loading && <LoadingSkeleton />}

        {!loading && !error && (
          <tbody>
            {filteredStocks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center" style={{ color: '#333', fontSize: 13 }}>
                  {search ? `No results for "${search}"` : 'No quotes available yet.'}
                </td>
              </tr>
            ) : (
              filteredStocks.map((stock) => (
                <StockRow
                  key={stock.ticker}
                  stock={stock}
                  isExpanded={expandedTicker === stock.ticker}
                  onToggle={() =>
                    setExpandedTicker(expandedTicker === stock.ticker ? null : stock.ticker)
                  }
                />
              ))
            )}
          </tbody>
        )}
      </table>

      {error && (
        <div className="py-20 text-center" style={{ color: '#444', fontSize: 13 }}>
          <p style={{ color: '#666' }}>{error}</p>
          <button
            onClick={fetchQuotes}
            className="mt-3 hover:text-white transition-colors underline underline-offset-2"
            style={{ color: '#444' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Footer */}
      {!loading && !error && data && (
        <p className="mt-8 text-xs" style={{ color: '#2a2a2a' }}>
          {data.stocks.length} assets · Spreads from on-chain pools · Not financial advice
        </p>
      )}
    </div>
  )
}
