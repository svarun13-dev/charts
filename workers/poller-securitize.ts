/**
 * Securitize poller — uses Securitize REST API.
 * Requires SECURITIZE_API_KEY in environment; skips gracefully if absent.
 */

import { getRedis, quoteKey, QUOTE_TTL_SECONDS } from '@/lib/redis'
import type { RedisQuote } from '@/types'

const SECURITIZE_API_BASE = 'https://api.securitize.io/v1'

// Asset IDs as defined in the Securitize API
// Replace with real asset IDs from your Securitize dashboard
const SECURITIZE_ASSETS: Record<string, { assetId: string; liquidityUsd: number }> = {
  AAPL:  { assetId: 'sec-aapl-001',  liquidityUsd: 18_000_000 },
  AMZN:  { assetId: 'sec-amzn-001',  liquidityUsd: 14_500_000 },
  'BRK.B': { assetId: 'sec-brkb-001', liquidityUsd: 9_200_000 },
}

interface SecuritizeQuoteResponse {
  assetId: string
  bid: number
  ask: number
  mid: number
  timestamp: string
}

async function fetchSecuritizeQuote(assetId: string, apiKey: string): Promise<SecuritizeQuoteResponse | null> {
  try {
    const res = await fetch(`${SECURITIZE_API_BASE}/assets/${assetId}/quote`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      console.warn(`[securitize] HTTP ${res.status} for asset ${assetId}`)
      return null
    }

    return await res.json()
  } catch (err) {
    console.error(`[securitize] Fetch error for ${assetId}:`, err)
    return null
  }
}

export async function poll(): Promise<void> {
  const apiKey = process.env.SECURITIZE_API_KEY
  if (!apiKey) {
    console.warn('[securitize] SECURITIZE_API_KEY not set — skipping')
    return
  }

  const redis = getRedis()
  const now = new Date().toISOString()

  for (const [ticker, { assetId, liquidityUsd }] of Object.entries(SECURITIZE_ASSETS)) {
    const data = await fetchSecuritizeQuote(assetId, apiKey)
    if (!data) continue

    const { bid, ask, mid } = data
    if (!mid || isNaN(mid)) continue

    const spreadPct = ((ask - bid) / mid) * 100

    const quote: RedisQuote = {
      bid,
      ask,
      mid,
      spreadPct: Math.max(spreadPct, 0),
      liquidityUsd,
      recordedAt: now,
    }

    await redis.setex(quoteKey('securitize', ticker), QUOTE_TTL_SECONDS, JSON.stringify(quote))
    console.log(`[securitize] ${ticker} mid=$${mid.toFixed(2)} spread=${spreadPct.toFixed(3)}%`)
  }
}
