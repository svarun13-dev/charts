'use client'

import { useState, useEffect, useCallback } from 'react'
import type { QuotesApiResponse, StockWithQuotes } from '@/types'
import { timeAgo } from '@/lib/utils'
import StockRow from './StockRow'
import SearchBar from './SearchBar'

const POLL_INTERVAL_MS = 30_000

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border-t border-[#2a2a3d] px-4 py-3.5 flex items-center gap-4">
          <div className="h-4 w-12 bg-[#1a1a26] rounded" />
          <div className="h-3 w-32 bg-[#1a1a26] rounded hidden sm:block" />
          <div className="h-5 w-16 bg-[#1a1a26] rounded hidden md:block" />
          <div className="h-4 w-20 bg-[#1a1a26] rounded ml-auto" />
          <div className="h-4 w-12 bg-[#1a1a26] rounded" />
        </div>
      ))}
    </div>
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

  // Re-render "X seconds ago" ticker every 10s
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
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} count={filteredStocks.length} />
        <div className="flex items-center gap-2 text-xs text-[#6b6b8a]">
          {lastFetch && (
            <span>Updated {timeAgo(lastFetch.toISOString())}</span>
          )}
          <button
            onClick={fetchQuotes}
            className="ml-1 p-1 rounded hover:bg-[#1a1a26] transition-colors"
            title="Refresh now"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#2a2a3d] bg-[#12121a] overflow-hidden">
        {/* Column headers */}
        <div className="hidden sm:block border-b border-[#2a2a3d]">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#6b6b8a]">
                <th className="py-3 pl-4 pr-3 text-left font-medium w-[110px]">Ticker</th>
                <th className="py-3 px-3 text-left font-medium hidden sm:table-cell">Name</th>
                <th className="py-3 px-3 text-left font-medium hidden md:table-cell w-[110px]">Best venue</th>
                <th className="py-3 px-3 text-left font-medium w-[110px]">Price</th>
                <th className="py-3 px-3 text-left font-medium w-[90px]">Spread</th>
                <th className="py-3 px-3 text-left font-medium hidden lg:table-cell w-[100px]">Liquidity</th>
                <th className="py-3 pl-3 pr-4 text-left font-medium hidden md:table-cell">Also on</th>
              </tr>
            </thead>
          </table>
        </div>

        {loading && <LoadingSkeleton />}

        {error && (
          <div className="py-16 text-center text-sm text-[#6b6b8a]">
            <p className="text-red-400 mb-2">Failed to load quotes</p>
            <p>{error}</p>
            <button
              onClick={fetchQuotes}
              className="mt-3 text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredStocks.length === 0 ? (
              <div className="py-16 text-center text-sm text-[#6b6b8a]">
                {search ? `No stocks matching "${search}"` : 'No quotes available yet. Workers may still be starting up.'}
              </div>
            ) : (
              <table className="w-full">
                <tbody>
                  {filteredStocks.map((stock) => (
                    <StockRow
                      key={stock.ticker}
                      stock={stock}
                      isExpanded={expandedTicker === stock.ticker}
                      onToggle={() =>
                        setExpandedTicker(
                          expandedTicker === stock.ticker ? null : stock.ticker
                        )
                      }
                    />
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Footer note */}
      {!loading && !error && data && (
        <p className="mt-4 text-xs text-[#6b6b8a]">
          {data.stocks.length} tokenized {data.stocks.length === 1 ? 'stock' : 'stocks'} tracked &middot; Spreads sourced from on-chain pools &middot; Not financial advice
        </p>
      )}
    </div>
  )
}
