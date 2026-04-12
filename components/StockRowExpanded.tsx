'use client'

import type { StockWithQuotes, Quote } from '@/types'
import { formatPrice, formatSpread, formatLiquidity, formatSlippage, estimateSlippage, spreadColorClass, timeAgo } from '@/lib/utils'
import VenuePill from './VenuePill'

interface StockRowExpandedProps { stock: StockWithQuotes }

const CHAIN_CONFIG: Record<string, { label: string; color: string }> = {
  solana:   { label: 'Solana',   color: '#c084fc' },
  ethereum: { label: 'Ethereum', color: '#818cf8' },
  polygon:  { label: 'Polygon',  color: '#a78bfa' },
}

function ChainBadge({ chain }: { chain: string }) {
  const cfg = CHAIN_CONFIG[chain] ?? { label: chain, color: '#666' }
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, color: cfg.color,
      background: `${cfg.color}12`, border: `1px solid ${cfg.color}30`,
      borderRadius: 4, padding: '1px 7px', whiteSpace: 'nowrap' as const,
    }}>
      {cfg.label}
    </span>
  )
}

function KycBadge({ required }: { required: boolean }) {
  return required ? (
    <span style={{ fontSize: 10, fontWeight: 500, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 3, padding: '1px 6px', whiteSpace: 'nowrap' as const }}
      data-tooltip="KYC verification required before trading">
      KYC
    </span>
  ) : (
    <span style={{ fontSize: 10, fontWeight: 500, color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 3, padding: '1px 6px', whiteSpace: 'nowrap' as const }}
      data-tooltip="No KYC required — connect wallet and trade">
      Open
    </span>
  )
}

function HoursBadge({ hours }: { hours: Quote['tradingHours'] }) {
  const is24 = hours === '24/7'
  return (
    <span style={{ fontSize: 10, fontWeight: 500, color: is24 ? '#34d399' : '#888', whiteSpace: 'nowrap' as const }}
      data-tooltip={is24 ? 'Trades 24/7 on a DEX — no market hours' : 'Prices update during NYSE market hours (9:30–16:00 ET)'}>
      {is24 ? '24/7' : 'Mkt hrs'}
    </span>
  )
}

function QuoteRow({ quote, isBest }: { quote: Quote; isBest: boolean }) {
  const slippage = estimateSlippage(10_000, quote.liquidityUsd)

  return (
    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)', opacity: quote.stale ? 0.4 : 1 }}>
      {/* Venue */}
      <td className="py-3 pl-12 pr-3">
        <div className="flex items-center gap-2">
          <VenuePill platform={quote.platform} />
          {isBest && <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 600 }}>BEST</span>}
        </div>
      </td>

      {/* Chain */}
      <td className="py-3 px-3"><ChainBadge chain={quote.chain} /></td>

      {/* Price */}
      <td className="py-3 px-3 font-mono tabular-nums font-medium" style={{ fontSize: 13, color: '#f0f0f0' }}>
        {formatPrice(quote.mid)}
      </td>

      {/* Spread */}
      <td className={`py-3 px-3 font-mono tabular-nums font-semibold text-xs ${spreadColorClass(quote.spreadPct)}`}>
        {formatSpread(quote.spreadPct)}
      </td>

      {/* Liquidity */}
      <td className="py-3 px-3 text-xs tabular-nums hidden lg:table-cell" style={{ color: '#888' }}>
        {formatLiquidity(quote.liquidityUsd)}
      </td>

      {/* Slip $10k */}
      <td className="py-3 px-3 text-xs tabular-nums" style={{ color: '#888' }}
        data-tooltip="Estimated slippage for a $10,000 market order">
        {formatSlippage(slippage)}
      </td>

      {/* Min buy */}
      <td className="py-3 px-3 text-xs" style={{ color: '#999' }}>
        ${quote.minBuyUsd >= 1000 ? `${(quote.minBuyUsd / 1000).toFixed(0)}k` : quote.minBuyUsd.toFixed(0)}
      </td>

      {/* KYC */}
      <td className="py-3 px-3"><KycBadge required={quote.kycRequired} /></td>

      {/* Trading hours */}
      <td className="py-3 px-3 hidden md:table-cell"><HoursBadge hours={quote.tradingHours} /></td>

      {/* Updated */}
      <td className="py-3 px-3 text-xs hidden xl:table-cell"
        style={{ color: quote.stale ? '#92400e' : '#444' }}>
        {quote.stale ? '⚠ ' : ''}{timeAgo(quote.recordedAt)}
      </td>

      {/* Buy link */}
      <td className="py-3 pl-3 pr-8 text-right">
        <a href={quote.buyUrl} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-xs font-medium transition-colors hover:text-white"
          style={{ color: '#666' }}>
          Buy ↗
        </a>
      </td>
    </tr>
  )
}

export default function StockRowExpanded({ stock }: StockRowExpandedProps) {
  const TH = (s: React.CSSProperties = {}) => ({
    fontSize: 10, color: '#444', fontWeight: 500, letterSpacing: '0.07em',
    textTransform: 'uppercase' as const, textAlign: 'left' as const, padding: '10px 12px',
    ...s,
  })

  return (
    <tr>
      <td colSpan={8} className="p-0">
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#060606' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <th style={{ ...TH(), paddingLeft: 48 }}>Venue</th>
                <th style={TH()}>Chain</th>
                <th style={TH()}>Price</th>
                <th style={TH()}>Spread</th>
                <th style={{ ...TH() }} className="hidden lg:table-cell">Liquidity</th>
                <th style={TH()} data-tooltip="Est. slippage for a $10,000 market order">Slip $10k</th>
                <th style={TH()}>Min buy</th>
                <th style={TH()}>KYC</th>
                <th style={{ ...TH() }} className="hidden md:table-cell">Hours</th>
                <th style={{ ...TH() }} className="hidden xl:table-cell">Updated</th>
                <th style={{ ...TH({ paddingRight: 32, textAlign: 'right' }) }} />
              </tr>
            </thead>
            <tbody>
              {stock.allQuotes.map(quote => (
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
