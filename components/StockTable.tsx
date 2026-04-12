'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { QuotesApiResponse, StockWithQuotes } from '@/types'
import { timeAgo, formatLiquidity } from '@/lib/utils'
import { DAILY_CHANGE } from '@/lib/mock-data'
import StockRow from './StockRow'
import SearchBar from './SearchBar'

const POLL_INTERVAL_MS = 30_000

type SortKey = 'ticker' | 'price' | 'change' | 'spread' | 'liquidity'
type SortDir = 'asc' | 'desc'
type AssetFilter = 'all' | 'equity' | 'etf'

const COL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  color: '#555',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  paddingBottom: 10,
  userSelect: 'none',
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span style={{ marginLeft: 3, opacity: active ? 1 : 0.3, fontSize: 8 }}>
      {active && dir === 'desc' ? '▼' : '▲'}
    </span>
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
          <td className="py-3 px-4 hidden md:table-cell"><div className="h-5 w-14 rounded animate-pulse" style={{ background: '#111' }} /></td>
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

function StatsStrip({ stocks }: { stocks: StockWithQuotes[] }) {
  if (stocks.length === 0) return null

  const totalLiquidity = stocks.reduce((sum, s) => sum + s.bestQuote.liquidityUsd, 0)
  const best = stocks.reduce((a, b) => a.bestQuote.spreadPct < b.bestQuote.spreadPct ? a : b)
  const platforms = new Set(stocks.flatMap(s => s.allQuotes.map(q => q.platform)))
  const gainers = stocks.filter(s => (DAILY_CHANGE[s.ticker] ?? 0) > 0).length
  const losers  = stocks.filter(s => (DAILY_CHANGE[s.ticker] ?? 0) < 0).length

  const stats = [
    { label: 'Total liquidity', value: formatLiquidity(totalLiquidity) },
    { label: 'Best spread', value: `${best.bestQuote.spreadPct.toFixed(2)}% (${best.ticker})` },
    { label: 'Platforms', value: platforms.size.toString() },
    { label: 'Gainers / Losers', value: `${gainers} / ${losers}` },
  ]

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-px mb-8"
      style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' }}
    >
      {stats.map(({ label, value }) => (
        <div key={label} style={{ background: '#0a0a0a', padding: '14px 18px' }}>
          <div style={{ fontSize: 10, color: '#555', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e5e5e5', letterSpacing: '-0.01em' }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function StockTable() {
  const [data, setData]                   = useState<QuotesApiResponse | null>(null)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null)
  const [search, setSearch]               = useState('')
  const [lastFetch, setLastFetch]         = useState<Date | null>(null)
  const [sortKey, setSortKey]             = useState<SortKey>('ticker')
  const [sortDir, setSortDir]             = useState<SortDir>('asc')
  const [assetFilter, setAssetFilter]     = useState<AssetFilter>('all')

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
    const id = setInterval(() => setTick(t => t + 1), 10_000)
    return () => clearInterval(id)
  }, [])

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'ticker' ? 'asc' : 'desc') }
  }

  const filteredStocks = useMemo(() => {
    let list = data?.stocks ?? []

    if (assetFilter !== 'all') list = list.filter(s => s.assetType === assetFilter)

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    }

    list = [...list].sort((a, b) => {
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

    return list
  }, [data, search, assetFilter, sortKey, sortDir])

  function thProps(key: SortKey, extra?: React.CSSProperties): React.CSSProperties {
    return {
      ...COL_STYLE,
      cursor: 'pointer',
      color: sortKey === key ? '#999' : '#555',
      ...extra,
    }
  }

  const FILTER_TABS: { key: AssetFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'equity', label: 'Equities' },
    { key: 'etf', label: 'ETFs' },
  ]

  return (
    <div>
      <StatsStrip stocks={data?.stocks ?? []} />

      {/* Toolbar */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 mb-0 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setAssetFilter(tab.key)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '3px 10px',
                  borderRadius: 5,
                  border: '1px solid',
                  borderColor: assetFilter === tab.key ? 'rgba(255,255,255,0.15)' : 'transparent',
                  background: assetFilter === tab.key ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: assetFilter === tab.key ? '#e5e5e5' : '#555',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <SearchBar value={search} onChange={setSearch} count={filteredStocks.length} />
        </div>

        <div className="flex items-center gap-3" style={{ color: '#555', fontSize: 12 }}>
          {lastFetch && <span>{timeAgo(lastFetch.toISOString())}</span>}
          <button
            onClick={fetchQuotes}
            title="Refresh"
            className="hover:text-white transition-colors"
            style={{ color: '#555', lineHeight: 1 }}
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
            <th
              onClick={() => handleSort('ticker')}
              style={{ ...thProps('ticker'), paddingLeft: 20, paddingRight: 16, width: 160, textAlign: 'left', paddingTop: 14 }}
            >
              Ticker <SortIcon active={sortKey === 'ticker'} dir={sortDir} />
            </th>
            <th style={{ ...COL_STYLE, padding: '14px 16px 10px', textAlign: 'left' }} className="hidden sm:table-cell">
              Name
            </th>
            <th style={{ ...COL_STYLE, padding: '14px 16px 10px', textAlign: 'left', width: 110 }} className="hidden md:table-cell">
              Best venue
            </th>
            <th
              onClick={() => handleSort('price')}
              style={{ ...thProps('price'), padding: '14px 16px 10px', textAlign: 'left', width: 110 }}
            >
              Price <SortIcon active={sortKey === 'price'} dir={sortDir} />
            </th>
            <th
              onClick={() => handleSort('change')}
              style={{ ...thProps('change'), padding: '14px 16px 10px', textAlign: 'left', width: 80 }}
            >
              24h <SortIcon active={sortKey === 'change'} dir={sortDir} />
            </th>
            <th
              onClick={() => handleSort('spread')}
              style={{ ...thProps('spread'), padding: '14px 16px 10px', textAlign: 'left', width: 80 }}
            >
              Spread <SortIcon active={sortKey === 'spread'} dir={sortDir} />
            </th>
            <th
              onClick={() => handleSort('liquidity')}
              style={{ ...thProps('liquidity'), padding: '14px 16px 10px', textAlign: 'left', width: 100 }}
              className="hidden lg:table-cell"
            >
              Liquidity <SortIcon active={sortKey === 'liquidity'} dir={sortDir} />
            </th>
            <th style={{ ...COL_STYLE, padding: '14px 20px 10px', textAlign: 'left' }} className="hidden md:table-cell">
              Also on
            </th>
          </tr>
        </thead>

        {loading && <LoadingSkeleton />}

        {!loading && !error && (
          <tbody>
            {filteredStocks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-20 text-center" style={{ color: '#444', fontSize: 13 }}>
                  {search ? `No results for "${search}"` : 'No quotes available yet.'}
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
        <div className="py-20 text-center" style={{ color: '#444', fontSize: 13 }}>
          <p style={{ color: '#666' }}>{error}</p>
          <button onClick={fetchQuotes} className="mt-3 hover:text-white transition-colors underline underline-offset-2" style={{ color: '#444' }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <p className="mt-8 text-xs" style={{ color: '#333' }}>
          {data.stocks.length} assets · Spreads from on-chain pools · Not financial advice
        </p>
      )}
    </div>
  )
}
