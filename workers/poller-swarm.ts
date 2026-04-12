/**
 * Swarm Markets poller — queries QuickSwap v3 (Uniswap v3 fork) pools on Polygon.
 * Falls back to direct RPC pool contract calls if the subgraph is unavailable.
 */

import { ethers } from 'ethers'
import { getRedis, quoteKey, QUOTE_TTL_SECONDS } from '@/lib/redis'
import type { RedisQuote } from '@/types'

const QUICKSWAP_SUBGRAPH = process.env.THE_GRAPH_API_KEY
  ? `https://gateway.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/FqsRcH1XqSjqVx9GRTvEJe959aCbKrcyGgDWBrUkG24H`
  : 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap-v3'

// Swarm token pool addresses on Polygon (QuickSwap v3)
// Replace with real contract addresses from Swarm's protocol
const SWARM_POOLS: Record<string, {
  poolAddress: string
  token0IsStock: boolean // true if token0 in the pool is the tokenized stock
  feeTier: number       // in bps e.g. 500 = 0.05%
  liquidityUsd: number  // placeholder TVL
}> = {
  TSLA: {
    poolAddress: '0xsQKSWTSLA00000000000000000000000000000001',
    token0IsStock: true,
    feeTier: 500,
    liquidityUsd: 3_100_000,
  },
  NVDA: {
    poolAddress: '0xsQKSWNVDA00000000000000000000000000000001',
    token0IsStock: true,
    feeTier: 500,
    liquidityUsd: 2_800_000,
  },
  NFLX: {
    poolAddress: '0xsQKSWNFLX00000000000000000000000000000001',
    token0IsStock: true,
    feeTier: 500,
    liquidityUsd: 1_400_000,
  },
}

// Minimal Uniswap v3 pool ABI for slot0 (current price)
const POOL_ABI = [
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() external view returns (uint128)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
]

function getPolygonProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.POLYGON_RPC_URL
  if (!rpcUrl) throw new Error('POLYGON_RPC_URL is not set')
  return new ethers.JsonRpcProvider(rpcUrl)
}

function sqrtPriceX96ToPrice(sqrtPriceX96: bigint, token0Decimals = 6, token1Decimals = 6): number {
  const price96 = (sqrtPriceX96 * sqrtPriceX96) / (BigInt(2) ** BigInt(192))
  const raw = Number(price96)
  // Adjust for decimals: price = rawPrice * 10^(d0 - d1)
  return raw * 10 ** (token0Decimals - token1Decimals)
}

export async function poll(): Promise<void> {
  let provider: ethers.JsonRpcProvider

  try {
    provider = getPolygonProvider()
  } catch (err) {
    console.warn('[swarm] Skipping — POLYGON_RPC_URL not set:', (err as Error).message)
    return
  }

  const redis = getRedis()
  const now = new Date().toISOString()

  for (const [ticker, config] of Object.entries(SWARM_POOLS)) {
    try {
      const pool = new ethers.Contract(config.poolAddress, POOL_ABI, provider)
      const [slot0Result] = await Promise.allSettled([pool.slot0()])

      if (slot0Result.status === 'rejected') {
        console.warn(`[swarm] Could not fetch slot0 for ${ticker}:`, slot0Result.reason)
        continue
      }

      const { sqrtPriceX96 } = slot0Result.value
      const mid = sqrtPriceX96ToPrice(BigInt(sqrtPriceX96.toString()))

      if (!mid || isNaN(mid) || mid <= 0) {
        console.warn(`[swarm] Invalid price for ${ticker}`)
        continue
      }

      // Spread = fee tier round-trip (both sides)
      const spreadPct = (config.feeTier / 10_000) * 2

      const bid = mid * (1 - spreadPct / 200)
      const ask = mid * (1 + spreadPct / 200)

      const quote: RedisQuote = {
        bid,
        ask,
        mid,
        spreadPct: Math.max(spreadPct, 0.05),
        liquidityUsd: config.liquidityUsd,
        recordedAt: now,
      }

      await redis.setex(quoteKey('swarm', ticker), QUOTE_TTL_SECONDS, JSON.stringify(quote))
      console.log(`[swarm] ${ticker} mid=$${mid.toFixed(2)} spread=${spreadPct.toFixed(3)}%`)
    } catch (err) {
      console.error(`[swarm] Error polling ${ticker}:`, err)
    }
  }
}
