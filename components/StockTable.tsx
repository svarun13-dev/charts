'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { QuotesApiResponse, StockWithQuotes, Chain } from '@/types'
import { timeAgo, formatLiquidity, computeBestVenue } from '@/lib/utils'
import { DAILY_CHANGE } from '@/lib/mock-data'
import StockRow from './StockRow'
import SearchBar from './SearchBar'

const POLL_INTERVAL_MS = 30_000

type SortKey   = 'ticker' | 'price' | 'change' | 'spread' | 'liquidity'
type SortDir   = 'asc' | 'desc'
type AssetFilter = 'all' | 'equity' | 'etf'
type ChainFilter = 'all' | Chain
type MinBuyFilter = 'any' | 100 | 1000 | 10000 | 100000 | 1000000

const COL_STYLE: React.CSSProperties = {
  fontSize: 9, fontWeight: 600, color: 'var(--text-3)',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  paddingBottom: 10, userSelect: 'none',
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span style={{ marginLeft: 3, opacity: active ? 1 : 0.25, fontSize: 7 }}>
      {active && dir === 'desc' ? '▼' : '▲'}
    </span>
  )
}

function FilterGroup({ label, options, value, onChange }: {
  label: string
  options: { key: string | number; label: string }[]
  value: string | number
  onChange: (v: string | number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <span style={{
        fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--text-3)', marginRight: 4,
      }}>
        {label}
      </span>
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '2px 8px', borderRadius: 2, border: '1px solid', cursor: 'pointer',
            transition: 'all 0.1s',
            borderColor: value === opt.key ? 'var(--amber-border)' : 'transparent',
            background:   value === opt.key ? 'var(--amber-dim)'   : 'transparent',
            color:        value === opt.key ? 'var(--amber-bright)' : 'var(--text-2)',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function StatsStrip({ stocks }: { stocks: StockWithQuotes[] }) {
  if (stocks.length === 0) return null
  const totalLiquidity = stocks.reduce((s, x) => s + x.bestQuote.liquidityUsd, 0)
  const best = stocks.reduce((a, b) => a.bestQuote.spreadPct < b.bestQuote.spreadPct ? a : b)
  const platforms = new Set(stocks.flatMap(s => s.allQuotes.map(q => q.platform)))
  const gainers = stocks.filter(s => (DAILY_CHANGE[s.ticker] ?? 0) > 0).length
  const losers  = stocks.filter(s => (DAILY_CHANGE[s.ticker] ?? 0) < 0).length

  const stats = [
    { label: 'Total liquidity',   value: formatLiquidity(totalLiquidity) },
    { label: 'Best spread',       value: `${best.bestQuote.spreadPct.toFixed(2)}% · ${best.ticker}` },
    { label: 'Platforms',         value: `${platforms.size} active` },
    { label: 'Gainers / Losers',  value: `${gainers} ↑ / ${losers} ↓` },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mb-8"
      style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
      {stats.map(({ label, value }) => (
        <div key={label} style={{ background: 'var(--surface)', padding: '12px 16px' }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 5 }}>
            {label}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', fontFamily: 'var(--font-mono, monospace)' }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <td className="py-3 pl-5 pr-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md animate-pulse" style={{ background: '#111' }} />
              <div className="h-3.5 w-10 rounded animate-pulse" style={{ background: '#111' }} />
            </div>
          </td>
          <td className="py-3 px-4 hidden sm:table-cell"><div className="h-3 w-36 rounded animate-pulse" style={{ background: '#111' }} /></td>
          <td className="py-3 px-4 hidden md:table-cell"><div className="h-5 w-24 rounded animate-pulse" style={{ background: '#111' }} /></td>
          <td className="py-3 px-4"><div className="h-3.5 w-20 rounded animate-pulse" style={{ background: '#111' }} /></td>
          <td className="py-3 px-4"><div className="h-3 w-12 rounded animate-pulse" style={{ background: '#111' }} /></td>
          <td className="py-3 px-4"><div className="h-3 w-10 rounded animate-pulse" style={{ background: '#111' }} /></td>
          <td className="py-3 px-4 hidden lg:table-cell"><div className="h-3 w-12 rounded animate-pulse" style={{ background: '#111' }} /></td>
          <td className="py-3 pl-4 pr-5 hidden md:table-cell" />
        </tr>
      ))}
    </tbody>
  )
}

export default function StockTable() {
  const [data, setData]           = useState<QuotesApiResponse | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [sortKey, setSortKey]     = useState<SortKey>('ticker')
  const [sortDir, setSortDir]     = useState<SortDir>('asc')
  const [assetFilter, setAssetFilter] = useState<AssetFilter>('all')
  const [chainFilter, setChainFilter] = useState<ChainFilter>('all')
  const [minBuyFilter, setMinBuyFilter] = useState<MinBuyFilter>('any')

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch('/api/quotes', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: QuotesApiResponse = await res.json()
      setData(json); setLastFetch(new Date()); setError(null)
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
    const id = setInterval(() => setTick(t => t + 1), 10_000)
    return () => clearInterval(id)
  }, [])

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'ticker' ? 'asc' : 'desc') }
  }

  const filteredStocks = useMemo((): StockWithQuotes[] => {
    let list = data?.stocks ?? []

    // Asset type
    if (assetFilter !== 'all') list = list.filter(s => s.assetType === assetFilter)

    // Chain — filter quotes per stock, recompute bestQuote
    if (chainFilter !== 'all') {
      list = list.flatMap(stock => {
        const filtered = stock.allQuotes.filter(q => q.chain === chainFilter)
        if (filtered.length === 0) return []
        return [{ ...stock, allQuotes: filtered, bestQuote: computeBestVenue(filtered) }]
      })
    }

    // Min buy — only show venues where minBuyUsd ≤ threshold
    if (minBuyFilter !== 'any') {
      list = list.flatMap(stock => {
        const filtered = stock.allQuotes.filter(q => q.minBuyUsd <= minBuyFilter)
        if (filtered.length === 0) return []
        return [{ ...stock, allQuotes: filtered, bestQuote: computeBestVenue(filtered) }]
      })
    }

    // Search
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    }

    // Sort
    return [...list].sort((a, b) => {
      let diff = 0
      switch (sortKey) {
        case 'ticker':    diff = a.ticker.localeCompare(b.ticker); break
        case 'price':     diff = a.bestQuote.mid - b.bestQuote.mid; break
        case 'change':    diff = (DAILY_CHANGE[a.ticker] ?? 0) - (DAILY_CHANGE[b.ticker] ?? 0); break
        case 'spread':    diff = a.bestQuote.spreadPct - b.bestQuote.spreadPct; break
        case 'liquidity': diff = a.bestQuote.liquidityUsd - b.bestQuote.liquidityUsd; break
      }
      return sortDir === 'asc' ? diff : -diff
    })
  }, [data, search, assetFilter, chainFilter, minBuyFilter, sortKey, sortDir])

  function thClick(key: SortKey, extra?: React.CSSProperties): React.CSSProperties {
    return { ...COL_STYLE, cursor: 'pointer', color: sortKey === key ? '#aaa' : '#555', ...extra }
  }

  return (
    <div>
      <StatsStrip stocks={data?.stocks ?? []} />

      {/* Filters toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 mb-0 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <FilterGroup
            label="Type"
            value={assetFilter}
            onChange={v => setAssetFilter(v as AssetFilter)}
            options={[{ key: 'all', label: 'All' }, { key: 'equity', label: 'Equities' }, { key: 'etf', label: 'ETFs' }]}
          />
          <FilterGroup
            label="Chain"
            value={chainFilter}
            onChange={v => setChainFilter(v as ChainFilter)}
            options={[
              { key: 'all', label: 'All' },
              { key: 'solana', label: 'Solana' },
              { key: 'ethereum', label: 'Ethereum' },
              { key: 'polygon', label: 'Polygon' },
            ]}
          />
          <FilterGroup
            label="Min buy"
            value={minBuyFilter}
            onChange={v => setMinBuyFilter(v as MinBuyFilter)}
            options={[
              { key: 'any',     label: 'Any'   },
              { key: 100,       label: '≤$100' },
              { key: 1000,      label: '≤$1k'  },
              { key: 10000,     label: '≤$10k' },
              { key: 100000,    label: '≤$100k' },
              { key: 1000000,   label: '≤$1M'  },
            ]}
          />
          <SearchBar value={search} onChange={setSearch} count={filteredStocks.length} />
        </div>
        <div className="flex items-center gap-3" style={{ color: '#555', fontSize: 12 }}>
          {lastFetch && <span>{timeAgo(lastFetch.toISOString())}</span>}
          <button onClick={fetchQuotes} title="Refresh" className="hover:text-white transition-colors" style={{ color: '#555', lineHeight: 1 }}>
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
            <th onClick={() => handleSort('ticker')} style={{ ...thClick('ticker'), paddingLeft: 20, paddingRight: 16, width: 170, textAlign: 'left', paddingTop: 14 }}>
              Ticker <SortIcon active={sortKey === 'ticker'} dir={sortDir} />
            </th>
            <th style={{ ...COL_STYLE, padding: '14px 16px 10px', textAlign: 'left' }} className="hidden sm:table-cell">Name</th>
            <th style={{ ...COL_STYLE, padding: '14px 16px 10px', textAlign: 'left', width: 160 }} className="hidden md:table-cell">Best venue</th>
            <th onClick={() => handleSort('price')} style={{ ...thClick('price'), padding: '14px 16px 10px', textAlign: 'left', width: 110 }}>
              Price <SortIcon active={sortKey === 'price'} dir={sortDir} />
            </th>
            <th onClick={() => handleSort('change')} style={{ ...thClick('change'), padding: '14px 16px 10px', textAlign: 'left', width: 70 }}>
              24h <SortIcon active={sortKey === 'change'} dir={sortDir} />
            </th>
            <th onClick={() => handleSort('spread')} style={{ ...thClick('spread'), padding: '14px 16px 10px', textAlign: 'left', width: 80 }}>
              Spread <SortIcon active={sortKey === 'spread'} dir={sortDir} />
            </th>
            <th onClick={() => handleSort('liquidity')} style={{ ...thClick('liquidity'), padding: '14px 16px 10px', textAlign: 'left', width: 100 }} className="hidden lg:table-cell">
              Slip $10k <SortIcon active={sortKey === 'liquidity'} dir={sortDir} />
            </th>
            <th style={{ ...COL_STYLE, padding: '14px 20px 10px', textAlign: 'left' }} className="hidden md:table-cell">Also on</th>
          </tr>
        </thead>

        {loading && <LoadingSkeleton />}

        {!loading && !error && (
          <tbody>
            {filteredStocks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-20 text-center" style={{ color: '#444', fontSize: 13 }}>
                  {search ? `No results for "${search}"` : 'No quotes match the current filters.'}
                </td>
              </tr>
            ) : (
              filteredStocks.map(stock => (
                <StockRow
                  key={stock.ticker}
                  stock={stock}
                  isExpanded={expandedTicker === stock.ticker}
                  onToggle={() => setExpandedTicker(expandedTicker === stock.ticker ? null : stock.ticker)}
                />
              ))
            )}
          </tbody>
        )}
      </table>

      {error && (
        <div className="py-20 text-center" style={{ color: '#666', fontSize: 13 }}>
          <p>{error}</p>
          <button onClick={fetchQuotes} className="mt-3 hover:text-white transition-colors underline underline-offset-2" style={{ color: '#555' }}>Retry</button>
        </div>
      )}

      {!loading && !error && data && (
        <p className="mt-8 text-xs" style={{ color: '#333' }}>
          {data.stocks.length} assets · Spreads from on-chain pools · Slip = est. slippage for $10k trade · Not financial advice
        </p>
      )}
    </div>
  )
}
