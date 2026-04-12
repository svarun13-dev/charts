'use client'

import type { StockWithQuotes, Quote } from '@/types'
import { formatPrice, formatSpread, formatLiquidity, spreadColorClass } from '@/lib/utils'
import VenuePill from './VenuePill'

interface StockRowExpandedProps {
  stock: StockWithQuotes
}

const CHAIN_LABEL: Record<string, string> = {
  solana: 'SOL',
  ethereum: 'ETH',
  polygon: 'MATIC',
}

function QuoteRow({ quote, isBest }: { quote: Quote; isBest: boolean }) {
  return (
    <tr className={`text-sm ${quote.stale ? 'opacity-50' : ''}`}>
      <td className="py-2.5 pl-10 pr-4">
        <div className="flex items-center gap-2">
          <VenuePill platform={quote.platform} />
          {isBest && (
            <span className="text-[10px] text-yellow-400 font-semibold">BEST</span>
          )}
          {quote.stale && (
            <span title="Quote is stale">
              <svg className="w-3.5 h-3.5 text-[#6b6b8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
            </span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-4 text-[#6b6b8a]">
        {CHAIN_LABEL[quote.chain] ?? quote.chain}
      </td>
      <td className="py-2.5 px-4 font-mono text-[#e8e8f0]">
        {formatPrice(quote.mid)}
      </td>
      <td className={`py-2.5 px-4 font-mono ${spreadColorClass(quote.spreadPct)}`}>
        {formatSpread(quote.spreadPct)}
      </td>
      <td className="py-2.5 px-4 text-[#6b6b8a]">
        {formatLiquidity(quote.liquidityUsd)}
      </td>
      <td className="py-2.5 px-4 text-[#6b6b8a]">
        ${quote.minBuyUsd.toFixed(0)}
      </td>
      <td className="py-2.5 pl-4 pr-10 text-right">
        <a
          href={quote.buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          Buy
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </td>
    </tr>
  )
}

export default function StockRowExpanded({ stock }: StockRowExpandedProps) {
  return (
    <tr>
      <td colSpan={7} className="p-0">
        <div className="border-t border-[#2a2a3d] bg-[#0d0d14]">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#6b6b8a]">
                <th className="py-2 pl-10 pr-4 text-left font-medium">Venue</th>
                <th className="py-2 px-4 text-left font-medium">Chain</th>
                <th className="py-2 px-4 text-left font-medium">Price</th>
                <th className="py-2 px-4 text-left font-medium">Spread</th>
                <th className="py-2 px-4 text-left font-medium">Liquidity</th>
                <th className="py-2 px-4 text-left font-medium">Min buy</th>
                <th className="py-2 pl-4 pr-10 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a26]">
              {stock.allQuotes.map((quote) => (
                <QuoteRow
                  key={`${quote.platform}-${quote.chain}`}
                  quote={quote}
                  isBest={quote.platform === stock.bestQuote.platform && quote.chain === stock.bestQuote.chain}
                />
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  )
}
