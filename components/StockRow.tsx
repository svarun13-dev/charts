'use client'

import type { StockWithQuotes, Platform } from '@/types'
import { formatPrice, formatSpread, formatSlippage, estimateSlippage, spreadColorClass, timeAgo } from '@/lib/utils'
import { DAILY_CHANGE } from '@/lib/mock-data'
import VenuePill from './VenuePill'
import StockRowExpanded from './StockRowExpanded'
import StockLogo from './StockLogo'

const CHAIN_LABEL: Record<string, string> = { solana: 'SOL', ethereum: 'ETH', polygon: 'POL' }
const CHAIN_COLOR: Record<string, string> = { solana: '#c084fc', ethereum: '#818cf8', polygon: '#a78bfa' }

interface StockRowProps {
  stock: StockWithQuotes
  isExpanded: boolean
  onToggle: () => void
}

export default function StockRow({ stock, isExpanded, onToggle }: StockRowProps) {
  const { bestQuote } = stock
  const changePct  = DAILY_CHANGE[stock.ticker] ?? 0
  const changeUp   = changePct >= 0
  const slippage   = estimateSlippage(10_000, bestQuote.liquidityUsd)
  const staleColor = bestQuote.stale ? '#92400e' : '#555'

  // Other venues: include full quote for spread delta
  const otherQuotes = stock.allQuotes.filter(
    q => !(q.platform === bestQuote.platform && q.chain === bestQuote.chain)
  )

  return (
    <>
      <tr
        onClick={onToggle}
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
          opacity: bestQuote.stale ? 0.6 : 1,
          background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
          transition: 'background 0.1s',
        }}
        className="group hover:bg-white/[0.03]"
      >
        {/* Logo + Ticker */}
        <td className="py-3 pl-5 pr-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <svg className="flex-shrink-0 transition-transform" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}
              style={{ width: 10, height: 10, color: '#555', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <StockLogo ticker={stock.ticker} size={28} />
            <div className="flex flex-col gap-0.5">
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>
                {stock.ticker}
              </span>
              {stock.assetType === 'etf'
                ? <span style={{ fontSize: 9, color: '#666', fontWeight: 500, letterSpacing: '0.06em', lineHeight: 1.4 }}>ETF</span>
                : null}
            </div>
          </div>
        </td>

        {/* Name */}
        <td className="py-3 px-4 hidden sm:table-cell" style={{ fontSize: 13, color: '#999' }}>
          {stock.name}
        </td>

        {/* Best venue + chain badge */}
        <td className="py-3 px-4 hidden md:table-cell">
          <div className="flex items-center gap-1.5">
            <VenuePill platform={bestQuote.platform as Platform} />
            <span style={{
              fontSize: 10, fontWeight: 500, color: CHAIN_COLOR[bestQuote.chain] ?? '#666',
              background: `${CHAIN_COLOR[bestQuote.chain] ?? '#666'}12`,
              border: `1px solid ${CHAIN_COLOR[bestQuote.chain] ?? '#666'}30`,
              borderRadius: 3, padding: '1px 5px',
            }}>
              {CHAIN_LABEL[bestQuote.chain] ?? bestQuote.chain}
            </span>
          </div>
        </td>

        {/* Price + staleness timestamp */}
        <td className="py-3 px-4 whitespace-nowrap">
          <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0', fontVariantNumeric: 'tabular-nums' }}>
            {formatPrice(bestQuote.mid)}
          </div>
          <div style={{ fontSize: 10, color: staleColor, marginTop: 1 }}>
            {bestQuote.stale ? '⚠ stale · ' : ''}{timeAgo(bestQuote.recordedAt)}
          </div>
        </td>

        {/* 24h change */}
        <td className="py-3 px-4 tabular-nums whitespace-nowrap">
          <span style={{ fontSize: 12, fontWeight: 600, color: changeUp ? '#34d399' : '#f87171' }}>
            {changeUp ? '+' : ''}{changePct.toFixed(2)}%
          </span>
        </td>

        {/* Spread */}
        <td className={`py-3 px-4 font-mono tabular-nums font-semibold text-xs ${spreadColorClass(bestQuote.spreadPct)}`}>
          {formatSpread(bestQuote.spreadPct)}
        </td>

        {/* Est. slippage $10k */}
        <td className="py-3 px-4 hidden lg:table-cell tabular-nums" style={{ fontSize: 12, color: '#888' }}>
          {formatSlippage(slippage)}
        </td>

        {/* Also on — with spread delta */}
        <td className="py-3 pl-4 pr-5 hidden md:table-cell">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {otherQuotes.map(q => {
              const delta = q.spreadPct - bestQuote.spreadPct
              return (
                <div key={`${q.platform}-${q.chain}`} className="flex items-center gap-1">
                  <VenuePill platform={q.platform as Platform} size="xs" muted />
                  <span style={{ fontSize: 10, color: '#555' }}>+{delta.toFixed(2)}%</span>
                </div>
              )
            })}
          </div>
        </td>
      </tr>

      {isExpanded && <StockRowExpanded stock={stock} />}
    </>
  )
}
