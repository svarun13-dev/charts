'use client'

import type { ListingEvent } from '@/types'
import { LISTING_EVENTS } from '@/lib/mock-data'
import { PLATFORM_META } from '@/lib/platform-info'
import { formatPrice, formatLiquidity } from '@/lib/utils'

const CHAIN_LABEL: Record<string, string> = { solana: 'Solana', ethereum: 'Ethereum', polygon: 'Polygon' }
const CHAIN_COLOR: Record<string, string> = { solana: '#c084fc', ethereum: '#818cf8', polygon: '#a78bfa' }

function timeAgoShort(iso: string): { label: string; isNew: boolean } {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days === 0) return { label: 'Today',         isNew: true  }
  if (days === 1) return { label: 'Yesterday',      isNew: true  }
  if (days <  7)  return { label: `${days}d ago`,   isNew: true  }
  if (days < 14)  return { label: `${days}d ago`,   isNew: false }
  if (days < 30)  return { label: `${Math.floor(days / 7)}w ago`, isNew: false }
  return { label: `${Math.floor(days / 30)}mo ago`, isNew: false }
}

function ListingCard({ event }: { event: ListingEvent }) {
  const meta       = PLATFORM_META[event.platform]
  const chain      = CHAIN_LABEL[event.chain] ?? event.chain
  const chainColor = CHAIN_COLOR[event.chain] ?? '#666'
  const { label, isNew } = timeAgoShort(event.listedAt)

  return (
    <a
      href={event.buyUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        background: '#0a0a0a',
        border: `1px solid ${isNew ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 10,
        padding: '16px 18px',
        minWidth: 200,
        textDecoration: 'none',
        transition: 'border-color 0.15s, background 0.15s',
        flexShrink: 0,
      }}
      className="hover:border-white/20 hover:bg-white/[0.02]"
    >
      {/* Header: platform pill + new badge */}
      <div className="flex items-center justify-between mb-3">
        <span style={{
          fontSize: 11, fontWeight: 500, padding: '2px 8px',
          color: meta.color, background: `${meta.color}14`,
          border: `1px solid ${meta.color}35`, borderRadius: 4,
        }}>
          {meta.label}
        </span>
        {isNew && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            color: '#34d399', background: 'rgba(52,211,153,0.1)',
            border: '1px solid rgba(52,211,153,0.2)', borderRadius: 3,
            padding: '1px 5px', textTransform: 'uppercase',
          }}>
            New
          </span>
        )}
      </div>

      {/* Ticker + name */}
      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {event.ticker}
      </div>
      <div style={{ fontSize: 11, color: '#555', marginTop: 3, marginBottom: 12, lineHeight: 1.3 }}>
        {event.name}
      </div>

      {/* Price at listing */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>
        {formatPrice(event.priceAtListing)}
      </div>
      <div style={{ fontSize: 10, color: '#444', marginTop: 1 }}>
        at listing · {formatLiquidity(event.liquidityUsd)} liquidity
      </div>

      {/* Footer: chain + time */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{
          fontSize: 10, fontWeight: 500, color: chainColor,
          background: `${chainColor}12`, border: `1px solid ${chainColor}30`,
          borderRadius: 3, padding: '1px 6px',
        }}>
          {chain}
        </span>
        <span style={{ fontSize: 10, color: isNew ? '#555' : '#333' }}>{label}</span>
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

import { useState } from 'react'

export default function NewListings() {
  const [filter, setFilter] = useState<Filter>('All')
  const events = filterEvents(LISTING_EVENTS, filter)
  const newCount = LISTING_EVENTS.filter(e => Date.now() - new Date(e.listedAt).getTime() < 7 * 86_400_000).length

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#e5e5e5', letterSpacing: '-0.01em' }}>
            New Listings
          </h2>
          {newCount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#34d399',
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
              borderRadius: 10, padding: '1px 7px',
            }}>
              {newCount} this week
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
              border: '1px solid', cursor: 'pointer', transition: 'all 0.1s',
              borderColor: filter === f ? 'rgba(255,255,255,0.15)' : 'transparent',
              background:   filter === f ? 'rgba(255,255,255,0.06)' : 'transparent',
              color:        filter === f ? '#ddd' : '#555',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <p style={{ fontSize: 13, color: '#444', padding: '24px 0' }}>No listings in this period.</p>
      ) : (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {events.map(e => <ListingCard key={e.id} event={e} />)}
        </div>
      )}
    </section>
  )
}
