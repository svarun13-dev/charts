'use client'

import type { StockWithQuotes } from '@/types'
import type { Platform } from '@/types'
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

  // Other venues (not the best)
  const otherPlatforms = stock.allQuotes
    .filter((q) => !(q.platform === bestQuote.platform && q.chain === bestQuote.chain))
    .map((q) => q.platform)

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-t border-[#2a2a3d] transition-colors hover:bg-[#1a1a26] ${
          isExpanded ? 'bg-[#1a1a26]' : ''
        } ${bestQuote.stale ? 'opacity-60' : ''}`}
      >
        {/* Expand indicator + ticker */}
        <td className="py-3.5 pl-4 pr-3 whitespace-nowrap">
          <div className="flex items-center gap-2.5">
            <svg
              className={`w-3.5 h-3.5 text-[#6b6b8a] transition-transform flex-shrink-0 ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <div>
              <span className="font-semibold text-[#e8e8f0] text-sm">{stock.ticker}</span>
              {stock.assetType === 'etf' && (
                <span className="ml-1.5 text-[10px] text-[#6b6b8a] border border-[#2a2a3d] rounded px-1">
                  ETF
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Name */}
        <td className="py-3.5 px-3 text-sm text-[#6b6b8a] hidden sm:table-cell">
          {stock.name}
        </td>

        {/* Best venue */}
        <td className="py-3.5 px-3 hidden md:table-cell">
          <VenuePill platform={bestQuote.platform as Platform} />
        </td>

        {/* Price */}
        <td className="py-3.5 px-3 font-mono text-sm text-[#e8e8f0] whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            {formatPrice(bestQuote.mid)}
            {bestQuote.stale && (
              <svg
                className="w-3.5 h-3.5 text-[#6b6b8a]"
                title="Quote is stale"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
            )}
          </div>
        </td>

        {/* Spread */}
        <td className={`py-3.5 px-3 font-mono text-sm whitespace-nowrap ${spreadColorClass(bestQuote.spreadPct)}`}>
          {formatSpread(bestQuote.spreadPct)}
        </td>

        {/* Liquidity */}
        <td className="py-3.5 px-3 text-sm text-[#6b6b8a] hidden lg:table-cell whitespace-nowrap">
          {formatLiquidity(bestQuote.liquidityUsd)}
        </td>

        {/* Other venues */}
        <td className="py-3.5 pl-3 pr-4 hidden md:table-cell">
          <div className="flex items-center gap-1 flex-wrap">
            {otherPlatforms.map((p) => (
              <VenuePill key={p} platform={p as Platform} size="xs" />
            ))}
          </div>
        </td>
      </tr>

      {isExpanded && <StockRowExpanded stock={stock} />}
    </>
  )
}
