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

function ListingRow({ event, rank }: { event: ListingEvent; rank: number }) {
  const meta       = PLATFORM_META[event.platform]
  const chainColor = CHAIN_COLOR[event.chain] ?? '#666'
  const days       = daysOld(event.listedAt)
  const isNew      = days < 7
  const isVeryNew  = days < 2

  return (
    <a
      href={event.buyUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 2fr 1fr 90px 80px 60px',
        alignItems: 'center',
        gap: 12,
        padding: '13px 16px',
        borderTop: rank === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
        textDecoration: 'none',
        borderLeft: `3px solid ${isVeryNew ? 'var(--amber)' : isNew ? 'rgba(212,150,10,0.3)' : 'transparent'}`,
        transition: 'background 0.1s',
      }}
      className="hover:bg-white/[0.02]"
    >
      {/* Rank */}
      <span style={{
        fontSize: 11, color: 'var(--text-3)', fontWeight: 600,
        fontFamily: 'var(--font-mono, monospace)',
      }}>
        {rank + 1}
      </span>

      {/* Asset info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{
              fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em',
              fontFamily: 'var(--font-mono, monospace)',
            }}>
              {event.ticker}
            </span>
            {isVeryNew && (
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--amber-bright)', background: 'var(--amber-dim)',
                border: '1px solid var(--amber-border)', borderRadius: 2, padding: '1px 5px',
              }}>
                NEW
              </span>
            )}
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.07em',
              color: meta.color, background: `${meta.color}14`,
              border: `1px solid ${meta.color}30`, borderRadius: 2, padding: '1px 6px',
            }}>
              {meta.label.toUpperCase()}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 600, color: chainColor,
              background: `${chainColor}12`, border: `1px solid ${chainColor}28`,
              borderRadius: 2, padding: '1px 5px',
            }}>
              {CHAIN_LABEL[event.chain] ?? event.chain}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.name}
          </div>
        </div>
      </div>

      {/* Price at listing */}
      <div>
        <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 2 }}>PRICE</div>
        <div style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text)',
          fontFamily: 'var(--font-mono, monospace)', fontVariantNumeric: 'tabular-nums',
        }}>
          {formatPrice(event.priceAtListing)}
        </div>
      </div>

      {/* Liquidity */}
      <div>
        <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 2 }}>LIQUIDITY</div>
        <div style={{
          fontSize: 12, fontWeight: 500, color: 'var(--text-2)',
          fontFamily: 'var(--font-mono, monospace)',
        }}>
          {formatLiquidity(event.liquidityUsd)}
        </div>
      </div>

      {/* Access */}
      <div>
        <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 2 }}>ACCESS</div>
        <div style={{
          fontSize: 10, fontWeight: 600,
          color: event.kycRequired ? '#f59e0b' : 'var(--up)',
        }}>
          {event.kycRequired ? 'KYC REQ' : 'OPEN'}
        </div>
      </div>

      {/* Listed */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 2 }}>LISTED</div>
        <div style={{
          fontSize: 10, fontWeight: 600,
          color: isNew ? 'var(--amber)' : 'var(--text-3)',
          fontFamily: 'var(--font-mono, monospace)',
        }}>
          {timeLabel(days)}
        </div>
      </div>
    </a>
  )
}

const FILTERS = [
  { key: 'all',   label: 'All'        },
  { key: 'week',  label: 'This week'  },
  { key: 'month', label: 'This month' },
] as const
type Filter = typeof FILTERS[number]['key']

function filterEvents(events: ListingEvent[], f: Filter): ListingEvent[] {
  const now = Date.now()
  if (f === 'week')  return events.filter(e => now - new Date(e.listedAt).getTime() < 7  * 86_400_000)
  if (f === 'month') return events.filter(e => now - new Date(e.listedAt).getTime() < 30 * 86_400_000)
  return events
}

export default function NewListings() {
  const [filter, setFilter] = useState<Filter>('all')
  const events   = filterEvents(LISTING_EVENTS, filter)
  const newCount = LISTING_EVENTS.filter(e => daysOld(e.listedAt) < 7).length

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="fin-section">
          <h2>Listing Watch</h2>
          {newCount > 0 && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
              color: 'var(--amber-bright)', background: 'var(--amber-dim)',
              border: '1px solid var(--amber-border)', borderRadius: 2, padding: '1px 6px',
            }}>
              {newCount} NEW
            </span>
          )}
        </div>
        <div className="flex items-center" style={{ gap: 2 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '3px 9px', borderRadius: 2, border: '1px solid', cursor: 'pointer',
              transition: 'all 0.1s',
              borderColor: filter === f.key ? 'var(--amber-border)' : 'transparent',
              background:   filter === f.key ? 'var(--amber-dim)'   : 'transparent',
              color:        filter === f.key ? 'var(--amber-bright)' : 'var(--text-2)',
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '28px 2fr 1fr 90px 80px 60px',
        gap: 12,
        padding: '6px 16px 6px 19px',   /* 19px = 16px + 3px left-border offset */
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'var(--surface-2)',
      }}>
        {['#', 'Asset', 'Price', 'Liquidity', 'Access', 'Listed'].map((h, i) => (
          <span key={h} style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-3)', textAlign: i >= 3 ? 'left' : 'left',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 3px 3px' }}>
        {events.length === 0 ? (
          <p style={{ padding: '24px 16px', fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono, monospace)' }}>
            NO LISTINGS IN THIS PERIOD
          </p>
        ) : events.map((e, i) => (
          <ListingRow key={e.id} event={e} rank={i} />
        ))}
      </div>

      <p style={{ marginTop: 8, fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em' }}>
        {events.length} listing{events.length !== 1 ? 's' : ''} · prices shown at time of listing
      </p>
    </section>
  )
}
