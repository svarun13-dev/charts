'use client'

import type { StockWithQuotes, Quote } from '@/types'
import { formatPrice, formatSpread, formatLiquidity, spreadColorClass } from '@/lib/utils'
import VenuePill from './VenuePill'

interface StockRowExpandedProps {
  stock: StockWithQuotes
}

const CHAIN_CONFIG: Record<string, { label: string; color: string }> = {
  solana:   { label: 'Solana',    color: '#c084fc' },
  ethereum: { label: 'Ethereum',  color: '#818cf8' },
  polygon:  { label: 'Polygon',   color: '#a78bfa' },
}

function ChainBadge({ chain }: { chain: string }) {
  const cfg = CHAIN_CONFIG[chain] ?? { label: chain, color: '#666' }
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      color: cfg.color,
      background: `${cfg.color}12`,
      border: `1px solid ${cfg.color}30`,
      borderRadius: 4,
      padding: '1px 7px',
      whiteSpace: 'nowrap' as const,
    }}>
      {cfg.label}
    </span>
  )
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
            <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 600 }}>
              BEST
            </span>
          )}
          {quote.stale && (
            <svg style={{ width: 12, height: 12, color: '#555', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
          )}
        </div>
      </td>

      {/* Chain */}
      <td className="py-3 px-4">
        <ChainBadge chain={quote.chain} />
      </td>

      {/* Price */}
      <td className="py-3 px-4 font-mono text-sm tabular-nums font-medium" style={{ color: '#f0f0f0' }}>
        {formatPrice(quote.mid)}
      </td>

      {/* Spread */}
      <td className={`py-3 px-4 font-mono text-xs tabular-nums font-semibold ${spreadColorClass(quote.spreadPct)}`}>
        {formatSpread(quote.spreadPct)}
      </td>

      {/* Liquidity */}
      <td className="py-3 px-4 text-xs tabular-nums" style={{ color: '#999' }}>
        {formatLiquidity(quote.liquidityUsd)}
      </td>

      {/* Min buy */}
      <td className="py-3 px-4 text-xs" style={{ color: '#999' }}>
        ${quote.minBuyUsd === 1 ? '1' : quote.minBuyUsd.toFixed(0)}
      </td>

      {/* Buy link */}
      <td className="py-3 pl-4 pr-8 text-right">
        <a
          href={quote.buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-medium transition-colors hover:text-white"
          style={{ color: '#888' }}
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
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#060606' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <th style={{ fontSize: 10, color: '#555', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', textAlign: 'left', padding: '10px 16px 10px 48px' }}>Venue</th>
                <th style={{ fontSize: 10, color: '#555', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', textAlign: 'left', padding: '10px 16px' }}>Chain</th>
                <th style={{ fontSize: 10, color: '#555', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', textAlign: 'left', padding: '10px 16px' }}>Price</th>
                <th style={{ fontSize: 10, color: '#555', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', textAlign: 'left', padding: '10px 16px' }}>Spread</th>
                <th style={{ fontSize: 10, color: '#555', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', textAlign: 'left', padding: '10px 16px' }}>Liquidity</th>
                <th style={{ fontSize: 10, color: '#555', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', textAlign: 'left', padding: '10px 16px' }}>Min buy</th>
                <th style={{ padding: '10px 32px 10px 16px' }} />
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
        </div>
      </td>
    </tr>
  )
}
