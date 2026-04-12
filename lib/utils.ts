import type { Quote } from '@/types'

const STALE_THRESHOLD_SECONDS = 90

/**
 * Picks the best venue: lowest spreadPct, with liquidityUsd as tiebreaker.
 * Stale quotes are never chosen as best if a fresh quote exists.
 */
export function computeBestVenue(quotes: Quote[]): Quote {
  if (quotes.length === 0) throw new Error('Cannot compute best venue from empty quotes')

  const fresh = quotes.filter((q) => !q.stale)
  const pool = fresh.length > 0 ? fresh : quotes

  return pool.reduce((best, curr) => {
    if (curr.spreadPct < best.spreadPct) return curr
    if (curr.spreadPct === best.spreadPct && curr.liquidityUsd > best.liquidityUsd) return curr
    return best
  })
}

/**
 * Formats a spread percentage for display.
 * e.g. 0.041 → "0.04%"
 */
export function formatSpread(spreadPct: number): string {
  return `${spreadPct.toFixed(2)}%`
}

/**
 * Formats a USD liquidity amount for display.
 * e.g. 42100000 → "$42.1M"
 */
export function formatLiquidity(usd: number): string {
  if (usd >= 1_000_000_000) return `$${(usd / 1_000_000_000).toFixed(1)}B`
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(0)}K`
  return `$${usd.toFixed(0)}`
}

/**
 * Formats a price for display.
 * e.g. 172.415 → "$172.41"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Returns true if a quote timestamp is older than STALE_THRESHOLD_SECONDS.
 */
export function isStale(recordedAt: string): boolean {
  const age = (Date.now() - new Date(recordedAt).getTime()) / 1000
  return age > STALE_THRESHOLD_SECONDS
}

/**
 * Returns a spread severity class name for Tailwind coloring.
 * green < 0.1%, amber 0.1–0.2%, red > 0.2%
 */
export function spreadColorClass(spreadPct: number): string {
  if (spreadPct < 0.1) return 'text-emerald-400'
  if (spreadPct <= 0.2) return 'text-amber-400'
  return 'text-rose-400'
}

/**
 * Human-readable "X seconds ago / X minutes ago" timestamp.
 */
export function timeAgo(isoString: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}
