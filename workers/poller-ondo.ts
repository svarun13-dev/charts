/**
 * Ondo poller — queries Uniswap v3 pool data via The Graph.
 * Derives price and spread from pool fee tier and TVL.
 */

import { getRedis, quoteKey, QUOTE_TTL_SECONDS } from '@/lib/redis'
import type { RedisQuote } from '@/types'

const GRAPH_ENDPOINT = process.env.THE_GRAPH_API_KEY
  ? `https://gateway.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`
  : 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'

// Ondo token addresses and their Uniswap v3 pool configurations
// Each entry maps a ticker to its Ondo token address on Ethereum mainnet
const ONDO_TOKENS: Record<string, { tokenAddress: string; feeTier: number }> = {
  MSFT:  { tokenAddress: '0xoMSFT000000000000000000000000000000000001', feeTier: 500 },  // 0.05%
  GOOGL: { tokenAddress: '0xoGOOGL00000000000000000000000000000000001', feeTier: 500 },
  SPY:   { tokenAddress: '0xoSPY0000000000000000000000000000000000001', feeTier: 500 },
  QQQ:   { tokenAddress: '0xoQQQ0000000000000000000000000000000000001', feeTier: 500 },
}

interface GraphPool {
  token0: { symbol: string }
  token1: { symbol: string }
  token0Price: string
  token1Price: string
  totalValueLockedUSD: string
  feeTier: string
}

async function fetchOndoPools(): Promise<GraphPool[]> {
  const tokenAddresses = Object.values(ONDO_TOKENS).map((t) => `"${t.tokenAddress.toLowerCase()}"`)

  const query = `{
    pools(
      where: { token0_in: [${tokenAddresses.join(',')}] }
      orderBy: totalValueLockedUSD
      orderDirection: desc
      first: 20
    ) {
      token0 { symbol address }
      token1 { symbol address }
      token0Price
      token1Price
      totalValueLockedUSD
      feeTier
    }
  }`

  const res = await fetch(GRAPH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(10_000),
  })

  if (!res.ok) throw new Error(`Graph API HTTP ${res.status}`)
  const json = await res.json()
  return json?.data?.pools ?? []
}

export async function poll(): Promise<void> {
  try {
    const pools = await fetchOndoPools()
    const redis = getRedis()
    const now = new Date().toISOString()

    for (const [ticker, { feeTier }] of Object.entries(ONDO_TOKENS)) {
      const pool = pools.find((p) =>
        p.token0.symbol.toUpperCase() === ticker ||
        p.token1.symbol.toUpperCase() === ticker,
      )

      if (!pool) {
        console.warn(`[ondo] No pool found for ${ticker}`)
        continue
      }

      // token0Price = how many token1 per token0
      // If token0 is the stock, token0Price is the price in terms of token1 (USDC)
      const mid = parseFloat(pool.token0Price)
      if (!mid || isNaN(mid)) continue

      // Spread floor derived from pool fee tier (basis points → percentage)
      const spreadPct = (feeTier / 1_000_000) * 100 * 2 // round-trip cost

      const bid = mid * (1 - spreadPct / 200)
      const ask = mid * (1 + spreadPct / 200)

      const liquidityUsd = parseFloat(pool.totalValueLockedUSD)

      const quote: RedisQuote = {
        bid,
        ask,
        mid,
        spreadPct: Math.max(spreadPct, 0.05),
        liquidityUsd: Math.max(liquidityUsd, 0),
        recordedAt: now,
      }

      await redis.setex(quoteKey('ondo', ticker), QUOTE_TTL_SECONDS, JSON.stringify(quote))
      console.log(`[ondo] ${ticker} mid=$${mid.toFixed(2)} spread=${spreadPct.toFixed(3)}%`)
    }
  } catch (err) {
    console.error('[ondo] Poll error:', err)
  }
}
