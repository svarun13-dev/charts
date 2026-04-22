'use client'

import { useState } from 'react'
import type { ListingEvent } from '@/types'
import { LISTING_EVENTS } from '@/lib/mock-data'
import { PLATFORM_META } from '@/lib/platform-info'
import { formatPrice, formatLiquidity } from '@/lib/utils'

const CHAIN_LABEL: Record<string, string> = { solana: 'SOL', ethereum: 'ETH', polygon: 'POL' }
const CHAIN_COLOR: Record<string, string> = { solana: '#c084fc', ethereum: '#818cf8', polygon: '#a78bfa' }

function daysOld(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

function timeLabel(days: number): string {
  if (days === 0) return 'TODAY'
  if (days === 1) return '1D AGO'
  if (days <  7)  return `${days}D AGO`
  if (days < 14)  return '1W AGO'
  if (days < 30)  return `${Math.floor(days / 7)}W AGO`
  return `${Math.floor(days / 30)}MO AGO`
}

function ListingCard({ event }: { event: ListingEvent }) {
  const meta       = PLATFORM_META[event.platform]
  const chainColor = CHAIN_COLOR[event.chain] ?? '#666'
  const days       = daysOld(event.listedAt)
  const isNew      = days < 7

  return (
    <a
      href={event.buyUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        background: 'var(--surface)',
        border: `1px solid ${isNew ? 'rgba(212,150,10,0.25)' : 'rgba(255,255,255,0.06)'}`,
        borderLeft: `3px solid ${isNew ? 'var(--amber)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 3,
        padding: '14px 16px',
        minWidth: 210,
        maxWidth: 240,
        textDecoration: 'none',
        flexShrink: 0,
        transition: 'border-color 0.15s',
      }}
      className="hover:border-white/20"
    >
      {/* Platform + chain */}
      <div className="flex items-center justify-between mb-3">
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
          color: meta.color, fontFamily: 'var(--font-mono, monospace)',
        }}>
          {meta.label.toUpperCase()}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 600, letterSpacing: '0.08em',
          color: chainColor,
        }}>
          {CHAIN_LABEL[event.chain] ?? event.chain}
        </span>
      </div>

      {/* Ticker */}
      <div style={{
        fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
        color: '#fff', lineHeight: 1, fontFamily: 'var(--font-mono, monospace)',
        marginBottom: 2,
      }}>
        {event.ticker}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.3 }}>
        {event.name}
      </div>

      {/* Price + liquidity */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '6px 0',
        paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 2 }}>PRICE</div>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text)',
            fontFamily: 'var(--font-mono, monospace)', fontVariantNumeric: 'tabular-nums',
          }}>
            {formatPrice(event.priceAtListing)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 2 }}>LIQUIDITY</div>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
            fontFamily: 'var(--font-mono, monospace)',
          }}>
            {formatLiquidity(event.liquidityUsd)}
          </div>
        </div>
      </div>

      {/* Time + new badge */}
      <div className="flex items-center justify-between mt-3">
        <span style={{
          fontSize: 9, color: isNew ? 'var(--amber)' : 'var(--text-3)',
          fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, letterSpacing: '0.08em',
        }}>
          {timeLabel(days)}
        </span>
        {isNew && (
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
            color: 'var(--amber-bright)',
            background: 'var(--amber-dim)',
            border: '1px solid var(--amber-border)',
            borderRadius: 2, padding: '1px 5px',
          }}>
            NEW
          </span>
        )}
        {!isNew && (
          <span style={{
            fontSize: 9, color: 'var(--text-3)',
            letterSpacing: '0.04em',
          }}>
            {event.kycRequired ? 'KYC REQ' : 'OPEN'}
          </span>
        )}
      </div>
    </a>
  )
}

const FILTERS = ['All', 'This week', 'This month'] as const
type Filter = typeof FILTERS[number]

function filterEvents(events: ListingEvent[], f: Filter): ListingEvent[] {
  const now = Date.now()
  if (f === 'This week')  return events.filter(e => now - new Date(e.listedAt).getTime() < 7  * 86_400_000)
  if (f === 'This month') return events.filter(e => now - new Date(e.listedAt).getTime() < 30 * 86_400_000)
  return events
}

export default function NewListings() {
  const [filter, setFilter] = useState<Filter>('All')
  const events   = filterEvents(LISTING_EVENTS, filter)
  const newCount = LISTING_EVENTS.filter(e => daysOld(e.listedAt) < 7).length

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="fin-section">
          <h2>Listing Watch</h2>
          {newCount > 0 && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
              color: 'var(--amber-bright)',
              background: 'var(--amber-dim)',
              border: '1px solid var(--amber-border)',
              borderRadius: 2, padding: '1px 6px',
            }}>
              {newCount} NEW
            </span>
          )}
        </div>

        <div className="flex items-center" style={{ gap: 2 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '3px 9px', borderRadius: 2, border: '1px solid', cursor: 'pointer',
              transition: 'all 0.1s',
              borderColor: filter === f ? 'var(--amber-border)' : 'transparent',
              background:   filter === f ? 'var(--amber-dim)'   : 'transparent',
              color:        filter === f ? 'var(--amber-bright)' : 'var(--text-2)',
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text-3)', padding: '24px 0', fontFamily: 'var(--font-mono, monospace)' }}>
          NO LISTINGS IN THIS PERIOD
        </p>
      ) : (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {events.map(e => <ListingCard key={e.id} event={e} />)}
        </div>
      )}
    </section>
  )
}
