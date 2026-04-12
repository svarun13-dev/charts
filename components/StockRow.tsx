'use client'

import type { StockWithQuotes, Platform } from '@/types'
import { formatPrice, formatSpread, formatLiquidity, spreadColorClass } from '@/lib/utils'
import VenuePill from './VenuePill'
import StockRowExpanded from './StockRowExpanded'

interface StockRowProps {
  stock: StockWithQuotes
  isExpanded: boolean
  onToggle: () => void
}

export default function StockRow({ stock, isExpanded, onToggle }: StockRowProps) {
  const { bestQuote } = stock

  const otherPlatforms = stock.allQuotes
    .filter((q) => !(q.platform === bestQuote.platform && q.chain === bestQuote.chain))
    .map((q) => q.platform)

  return (
    <>
      <tr
        onClick={onToggle}
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          cursor: 'pointer',
          opacity: bestQuote.stale ? 0.5 : 1,
          background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
          transition: 'background 0.1s',
        }}
        className="group hover:bg-white/[0.02]"
      >
        {/* Ticker */}
        <td className="py-3.5 pl-5 pr-4 whitespace-nowrap">
          <div className="flex items-center gap-2.5">
            <svg
              className="flex-shrink-0 transition-transform"
              style={{
                width: 10,
                height: 10,
                color: '#333',
                transform: isExpanded ? 'rotate(90deg)' : 'none',
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium text-white text-sm tracking-tight">
              {stock.ticker}
            </span>
            {stock.assetType === 'etf' && (
              <span style={{ fontSize: 9, color: '#444', fontWeight: 500, letterSpacing: '0.06em' }}>
                ETF
              </span>
            )}
          </div>
        </td>

        {/* Name */}
        <td className="py-3.5 px-4 text-sm hidden sm:table-cell" style={{ color: '#555' }}>
          {stock.name}
        </td>

        {/* Best venue */}
        <td className="py-3.5 px-4 hidden md:table-cell">
          <VenuePill platform={bestQuote.platform as Platform} />
        </td>

        {/* Price */}
        <td className="py-3.5 px-4 font-mono text-sm tabular-nums" style={{ color: '#ddd' }}>
          {formatPrice(bestQuote.mid)}
        </td>

        {/* Spread */}
        <td className={`py-3.5 px-4 font-mono text-xs tabular-nums ${spreadColorClass(bestQuote.spreadPct)}`}>
          {formatSpread(bestQuote.spreadPct)}
        </td>

        {/* Liquidity */}
        <td className="py-3.5 px-4 text-xs hidden lg:table-cell" style={{ color: '#555' }}>
          {formatLiquidity(bestQuote.liquidityUsd)}
        </td>

        {/* Other venues */}
        <td className="py-3.5 pl-4 pr-5 hidden md:table-cell">
          <div className="flex items-center gap-1.5">
            {otherPlatforms.map((p) => (
              <VenuePill key={p} platform={p as Platform} size="xs" muted />
            ))}
          </div>
        </td>
      </tr>

      {isExpanded && <StockRowExpanded stock={stock} />}
    </>
  )
}
