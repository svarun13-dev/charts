'use client'

import type { StockWithQuotes, Quote } from '@/types'
import { formatPrice, formatSpread, formatLiquidity, spreadColorClass } from '@/lib/utils'
import VenuePill from './VenuePill'

interface StockRowExpandedProps {
  stock: StockWithQuotes
}

const CHAIN_LABEL: Record<string, string> = {
  solana:   'Solana',
  ethereum: 'Ethereum',
  polygon:  'Polygon',
}

function QuoteRow({ quote, isBest }: { quote: Quote; isBest: boolean }) {
  return (
    <tr
      style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        opacity: quote.stale ? 0.4 : 1,
      }}
    >
      {/* Venue */}
      <td className="py-3 pl-12 pr-4">
        <div className="flex items-center gap-2.5">
          <VenuePill platform={quote.platform} />
          {isBest && (
            <span style={{ fontSize: 10, color: '#fff', fontWeight: 500, letterSpacing: '0.05em' }}>
              ★
            </span>
          )}
        </div>
      </td>

      {/* Chain */}
      <td className="py-3 px-4 text-xs" style={{ color: '#444' }}>
        {CHAIN_LABEL[quote.chain] ?? quote.chain}
      </td>

      {/* Price */}
      <td className="py-3 px-4 font-mono text-sm tabular-nums" style={{ color: '#ccc' }}>
        {formatPrice(quote.mid)}
      </td>

      {/* Spread */}
      <td className={`py-3 px-4 font-mono text-xs tabular-nums ${spreadColorClass(quote.spreadPct)}`}>
        {formatSpread(quote.spreadPct)}
      </td>

      {/* Liquidity */}
      <td className="py-3 px-4 text-xs" style={{ color: '#555' }}>
        {formatLiquidity(quote.liquidityUsd)}
      </td>

      {/* Min buy */}
      <td className="py-3 px-4 text-xs" style={{ color: '#555' }}>
        ${quote.minBuyUsd === 1 ? '1' : quote.minBuyUsd.toFixed(0)}
      </td>

      {/* Buy link */}
      <td className="py-3 pl-4 pr-10 text-right">
        <a
          href={quote.buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs hover:text-white transition-colors"
          style={{ color: '#666' }}
        >
          Buy ↗
        </a>
      </td>
    </tr>
  )
}

export default function StockRowExpanded({ stock }: StockRowExpandedProps) {
  return (
    <tr>
      <td colSpan={7} className="p-0">
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#050505' }}>
          <table className="w-full">
            <thead>
              <tr>
                <th
                  colSpan={7}
                  className="pl-12 pr-4 pt-3 pb-1 text-left"
                  style={{ fontSize: 10, color: '#333', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  All venues — ranked by spread
                </th>
              </tr>
            </thead>
            <tbody>
              {stock.allQuotes.map((quote) => (
                <QuoteRow
                  key={`${quote.platform}-${quote.chain}`}
                  quote={quote}
                  isBest={
                    quote.platform === stock.bestQuote.platform &&
                    quote.chain === stock.bestQuote.chain
                  }
                />
              ))}
            </tbody>
          </table>
          <div className="pl-12 pb-3 pt-1" style={{ fontSize: 11, color: '#333' }}>
            Min buy · Chain · Spread shown for best single-side execution
          </div>
        </div>
      </td>
    </tr>
  )
}
