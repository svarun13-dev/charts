'use client'

import { useState, useMemo } from 'react'
import type { EarnOpportunity, EarnType, Chain } from '@/types'
import { EARN_OPPORTUNITIES } from '@/lib/mock-data'
import { formatLiquidity, formatApy } from '@/lib/utils'
import VenuePill from './VenuePill'

type TypeFilter  = 'all' | EarnType
type ChainFilter = 'all' | Chain
type KycFilter   = 'all' | 'open' | 'kyc'
type SortKey     = 'apy' | 'tvl' | 'min'
type SortDir     = 'asc' | 'desc'

const RISK_CONFIG = {
  low:    { label: 'Low',    color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
  medium: { label: 'Medium', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)'  },
  high:   { label: 'High',   color: '#f87171', bg: 'rgba(248,113,113,0.08)',border: 'rgba(248,113,113,0.2)' },
}

const TYPE_LABEL: Record<EarnType, string> = {
  treasury: 'Treasury',
  lp: 'LP',
  lending: 'Lending',
}

const TYPE_COLOR: Record<EarnType, string> = {
  treasury: '#60a5fa',
  lp:       '#a78bfa',
  lending:  '#34d399',
}

const CHAIN_COLOR: Record<string, string> = {
  solana: '#c084fc', ethereum: '#818cf8', polygon: '#a78bfa',
}
const CHAIN_LABEL: Record<string, string> = {
  solana: 'Solana', ethereum: 'Ethereum', polygon: 'Polygon',
}

const COL: React.CSSProperties = {
  fontSize: 10, fontWeight: 500, color: '#555',
  letterSpacing: '0.07em', textTransform: 'uppercase',
  paddingBottom: 10, userSelect: 'none',
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return <span style={{ marginLeft: 3, opacity: active ? 1 : 0.3, fontSize: 8 }}>{active && dir === 'desc' ? '▼' : '▲'}</span>
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
      border: '1px solid', cursor: 'pointer', transition: 'all 0.1s',
      borderColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
      background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
      color: active ? '#ddd' : '#555',
    }}>{children}</button>
  )
}

function EarnStatsStrip({ items }: { items: EarnOpportunity[] }) {
  if (items.length === 0) return null
  const maxApy   = Math.max(...items.map(i => i.apy))
  const totalTvl = items.reduce((s, i) => s + i.tvlUsd, 0)
  const openAccess = items.filter(i => !i.kycRequired).length

  const stats = [
    { label: 'Total TVL',       value: formatLiquidity(totalTvl) },
    { label: 'Best APY',        value: `${formatApy(maxApy)}` },
    { label: 'No-KYC options',  value: `${openAccess} of ${items.length}` },
    { label: 'Strategies',      value: items.length.toString() },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mb-8"
      style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' }}>
      {stats.map(({ label, value }) => (
        <div key={label} style={{ background: '#0a0a0a', padding: '14px 18px' }}>
          <div style={{ fontSize: 10, color: '#444', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e5e5e5', letterSpacing: '-0.01em' }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

export default function EarnTable() {
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>('all')
  const [chainFilter, setChainFilter] = useState<ChainFilter>('all')
  const [kycFilter,   setKycFilter]   = useState<KycFilter>('all')
  const [sortKey,     setSortKey]     = useState<SortKey>('apy')
  const [sortDir,     setSortDir]     = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const items = useMemo(() => {
    let list = EARN_OPPORTUNITIES
    if (typeFilter  !== 'all')  list = list.filter(i => i.type === typeFilter)
    if (chainFilter !== 'all')  list = list.filter(i => i.chain === chainFilter)
    if (kycFilter === 'open')   list = list.filter(i => !i.kycRequired)
    if (kycFilter === 'kyc')    list = list.filter(i => i.kycRequired)
    return [...list].sort((a, b) => {
      const diff = sortKey === 'apy' ? a.apy - b.apy : sortKey === 'tvl' ? a.tvlUsd - b.tvlUsd : a.minDepositUsd - b.minDepositUsd
      return sortDir === 'asc' ? diff : -diff
    })
  }, [typeFilter, chainFilter, kycFilter, sortKey, sortDir])

  return (
    <div>
      <EarnStatsStrip items={EARN_OPPORTUNITIES} />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 mb-0 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Type */}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 10, color: '#444', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 4 }}>Type</span>
            {(['all', 'treasury', 'lp', 'lending'] as TypeFilter[]).map(v => (
              <FilterBtn key={v} active={typeFilter === v} onClick={() => setTypeFilter(v)}>
                {v === 'all' ? 'All' : TYPE_LABEL[v as EarnType]}
              </FilterBtn>
            ))}
          </div>
          {/* Chain */}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 10, color: '#444', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 4 }}>Chain</span>
            {(['all', 'solana', 'ethereum', 'polygon'] as ChainFilter[]).map(v => (
              <FilterBtn key={v} active={chainFilter === v} onClick={() => setChainFilter(v)}>
                {v === 'all' ? 'All' : CHAIN_LABEL[v]}
              </FilterBtn>
            ))}
          </div>
          {/* KYC */}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 10, color: '#444', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 4 }}>Access</span>
            {([['all','All'],['open','No KYC'],['kyc','KYC']] as [KycFilter,string][]).map(([v, l]) => (
              <FilterBtn key={v} active={kycFilter === v} onClick={() => setKycFilter(v)}>{l}</FilterBtn>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 12, color: '#444' }}>{items.length} strategies</span>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr>
            <th style={{ ...COL, paddingLeft: 20, paddingRight: 12, textAlign: 'left', paddingTop: 14, width: 200 }}>Strategy</th>
            <th style={{ ...COL, padding: '14px 12px 10px', textAlign: 'left' }} className="hidden sm:table-cell">Description</th>
            <th style={{ ...COL, padding: '14px 12px 10px', textAlign: 'left', width: 100 }} className="hidden md:table-cell">Chain</th>
            <th onClick={() => handleSort('apy')} style={{ ...COL, padding: '14px 12px 10px', textAlign: 'left', cursor: 'pointer', color: sortKey === 'apy' ? '#aaa' : '#555', width: 90 }}>
              APY <SortIcon active={sortKey === 'apy'} dir={sortDir} />
            </th>
            <th onClick={() => handleSort('tvl')} style={{ ...COL, padding: '14px 12px 10px', textAlign: 'left', cursor: 'pointer', color: sortKey === 'tvl' ? '#aaa' : '#555', width: 90 }} className="hidden lg:table-cell">
              TVL <SortIcon active={sortKey === 'tvl'} dir={sortDir} />
            </th>
            <th onClick={() => handleSort('min')} style={{ ...COL, padding: '14px 12px 10px', textAlign: 'left', cursor: 'pointer', color: sortKey === 'min' ? '#aaa' : '#555', width: 80 }}>
              Min <SortIcon active={sortKey === 'min'} dir={sortDir} />
            </th>
            <th style={{ ...COL, padding: '14px 12px 10px', textAlign: 'left', width: 80 }}>Risk</th>
            <th style={{ ...COL, padding: '14px 12px 10px', textAlign: 'left', width: 70 }}>Access</th>
            <th style={{ ...COL, padding: '14px 20px 10px', textAlign: 'right', width: 60 }} />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={9} className="py-20 text-center" style={{ color: '#444', fontSize: 13 }}>No strategies match the current filters.</td></tr>
          ) : items.map(item => {
            const risk = RISK_CONFIG[item.risk]
            const typeColor = TYPE_COLOR[item.type]
            const chainColor = CHAIN_COLOR[item.chain] ?? '#666'
            return (
              <tr key={item.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                className="group hover:bg-white/[0.02] transition-colors">
                {/* Strategy name + protocol */}
                <td className="py-3.5 pl-5 pr-3">
                  <div className="flex items-center gap-2.5">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{item.name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <VenuePill platform={item.protocol} size="xs" showTooltip={false} />
                        <span style={{ fontSize: 10, fontWeight: 500, color: typeColor, background: `${typeColor}12`, border: `1px solid ${typeColor}25`, borderRadius: 3, padding: '0 5px' }}>
                          {TYPE_LABEL[item.type]}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Description */}
                <td className="py-3.5 px-3 hidden sm:table-cell" style={{ fontSize: 12, color: '#777', maxWidth: 300 }}>
                  {item.description}
                </td>

                {/* Chain */}
                <td className="py-3.5 px-3 hidden md:table-cell">
                  <span style={{ fontSize: 11, fontWeight: 500, color: chainColor, background: `${chainColor}12`, border: `1px solid ${chainColor}30`, borderRadius: 4, padding: '2px 8px' }}>
                    {CHAIN_LABEL[item.chain] ?? item.chain}
                  </span>
                </td>

                {/* APY */}
                <td className="py-3.5 px-3">
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#34d399', letterSpacing: '-0.01em' }}>
                    {formatApy(item.apy)}
                  </span>
                  {item.apyLabel && (
                    <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>variable</div>
                  )}
                </td>

                {/* TVL */}
                <td className="py-3.5 px-3 hidden lg:table-cell" style={{ fontSize: 13, color: '#888' }}>
                  {formatLiquidity(item.tvlUsd)}
                </td>

                {/* Min deposit */}
                <td className="py-3.5 px-3" style={{ fontSize: 13, color: '#999' }}>
                  {item.minDepositUsd >= 1000
                    ? formatLiquidity(item.minDepositUsd)
                    : `$${item.minDepositUsd}`}
                </td>

                {/* Risk */}
                <td className="py-3.5 px-3">
                  <span style={{ fontSize: 10, fontWeight: 500, color: risk.color, background: risk.bg, border: `1px solid ${risk.border}`, borderRadius: 3, padding: '1px 6px' }}>
                    {risk.label}
                  </span>
                </td>

                {/* KYC / Open */}
                <td className="py-3.5 px-3">
                  {item.kycRequired
                    ? <span style={{ fontSize: 10, fontWeight: 500, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 3, padding: '1px 6px' }}>KYC</span>
                    : <span style={{ fontSize: 10, fontWeight: 500, color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 3, padding: '1px 6px' }}>Open</span>}
                </td>

                {/* Link */}
                <td className="py-3.5 pl-3 pr-5 text-right">
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium transition-colors hover:text-white"
                    style={{ color: '#666' }}>
                    Deposit ↗
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="mt-8 text-xs" style={{ color: '#333' }}>
        APYs are estimates and change over time · LP positions subject to impermanent loss · Not financial advice
      </p>
    </div>
  )
}
