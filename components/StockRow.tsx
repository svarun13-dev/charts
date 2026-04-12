'use client'

import type { StockWithQuotes, Platform } from '@/types'
import { formatPrice, formatSpread, formatLiquidity, spreadColorClass } from '@/lib/utils'
import { DAILY_CHANGE } from '@/lib/mock-data'
import VenuePill from './VenuePill'
import StockRowExpanded from './StockRowExpanded'
import StockLogo from './StockLogo'

interface StockRowProps {
  stock: StockWithQuotes
  isExpanded: boolean
  onToggle: () => void
}

export default function StockRow({ stock, isExpanded, onToggle }: StockRowProps) {
  const { bestQuote } = stock
  const changePct = DAILY_CHANGE[stock.ticker] ?? 0
  const changeUp = changePct >= 0
  const changeColor = changeUp ? '#34d399' : '#f87171'

  const otherPlatforms = stock.allQuotes
    .filter(q => !(q.platform === bestQuote.platform && q.chain === bestQuote.chain))
    .map(q => q.platform)

  return (
    <>
      <tr
        onClick={onToggle}
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer',
          opacity: bestQuote.stale ? 0.5 : 1,
          background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
          transition: 'background 0.1s',
        }}
        className="group hover:bg-white/[0.03]"
      >
        {/* Logo + Ticker */}
        <td className="py-3 pl-5 pr-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <svg
              className="flex-shrink-0 transition-transform"
              style={{ width: 10, height: 10, color: '#555', transform: isExpanded ? 'rotate(90deg)' : 'none' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <StockLogo ticker={stock.ticker} size={28} />
            <div className="flex flex-col gap-0.5">
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>
                {stock.ticker}
              </span>
              {stock.assetType === 'etf' && (
                <span style={{ fontSize: 9, color: '#666', fontWeight: 500, letterSpacing: '0.06em', lineHeight: 1.4 }}>ETF</span>
              )}
            </div>
          </div>
        </td>

        {/* Name */}
        <td className="py-3 px-4 hidden sm:table-cell" style={{ fontSize: 13, color: '#999' }}>
          {stock.name}
        </td>

        {/* Best venue */}
        <td className="py-3 px-4 hidden md:table-cell">
          <VenuePill platform={bestQuote.platform as Platform} />
        </td>

        {/* Price */}
        <td className="py-3 px-4 font-mono tabular-nums" style={{ fontSize: 13, color: '#f0f0f0', fontWeight: 500 }}>
          {formatPrice(bestQuote.mid)}
        </td>

        {/* 24h change */}
        <td className="py-3 px-4 tabular-nums whitespace-nowrap">
          <span style={{ fontSize: 12, fontWeight: 600, color: changeColor }}>
            {changeUp ? '+' : ''}{changePct.toFixed(2)}%
          </span>
        </td>

        {/* Spread */}
        <td className={`py-3 px-4 font-mono tabular-nums font-semibold text-xs ${spreadColorClass(bestQuote.spreadPct)}`}>
          {formatSpread(bestQuote.spreadPct)}
        </td>

        {/* Liquidity */}
        <td className="py-3 px-4 hidden lg:table-cell tabular-nums" style={{ fontSize: 13, color: '#888' }}>
          {formatLiquidity(bestQuote.liquidityUsd)}
        </td>

        {/* Other venues */}
        <td className="py-3 pl-4 pr-5 hidden md:table-cell">
          <div className="flex items-center gap-1.5">
            {otherPlatforms.map(p => (
              <VenuePill key={p} platform={p as Platform} size="xs" muted />
            ))}
          </div>
        </td>
      </tr>

      {isExpanded && <StockRowExpanded stock={stock} />}
    </>
  )
}
