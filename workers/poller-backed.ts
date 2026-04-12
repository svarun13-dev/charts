/**
 * Backed Finance poller — reads Chainlink price feeds on Ethereum mainnet.
 * Backed tokens trade at NAV; spread sourced from their published fee schedule (0.1–0.2%).
 */

import { ethers } from 'ethers'
import { getRedis, quoteKey, QUOTE_TTL_SECONDS } from '@/lib/redis'
import type { RedisQuote } from '@/types'

// Minimal Chainlink aggregator ABI (latestRoundData only)
const CHAINLINK_ABI = [
  'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() external view returns (uint8)',
]

// Backed token Chainlink aggregator addresses on Ethereum mainnet
// Source: https://backed.fi/data-feeds — replace with real addresses
const BACKED_TOKENS: Record<string, {
  aggregatorAddress: string
  spreadPct: number    // Published spread/fee from Backed docs
  liquidityUsd: number // Estimated TVL (update from Backed API when available)
}> = {
  TSLA: {
    aggregatorAddress: '0xbCLTSLA00000000000000000000000000000000001',
    spreadPct: 0.15,
    liquidityUsd: 8_400_000,
  },
  AAPL: {
    aggregatorAddress: '0xbCLAAPL00000000000000000000000000000000001',
    spreadPct: 0.12,
    liquidityUsd: 12_100_000,
  },
  META: {
    aggregatorAddress: '0xbCLMETA00000000000000000000000000000000001',
    spreadPct: 0.15,
    liquidityUsd: 5_200_000,
  },
  GLD: {
    aggregatorAddress: '0xbCLGLD000000000000000000000000000000000001',
    spreadPct: 0.10,
    liquidityUsd: 22_000_000,
  },
}

function getProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.ETHEREUM_RPC_URL
  if (!rpcUrl) throw new Error('ETHEREUM_RPC_URL is not set')
  return new ethers.JsonRpcProvider(rpcUrl)
}

export async function poll(): Promise<void> {
  let provider: ethers.JsonRpcProvider

  try {
    provider = getProvider()
  } catch (err) {
    console.warn('[backed] Skipping — ETHEREUM_RPC_URL not set:', (err as Error).message)
    return
  }

  const redis = getRedis()
  const now = new Date().toISOString()

  for (const [ticker, config] of Object.entries(BACKED_TOKENS)) {
    try {
      const aggregator = new ethers.Contract(
        config.aggregatorAddress,
        CHAINLINK_ABI,
        provider,
      )

      const [, answer] = await aggregator.latestRoundData()
      const decimals = await aggregator.decimals()
      const mid = Number(answer) / 10 ** Number(decimals)

      if (!mid || isNaN(mid)) {
        console.warn(`[backed] Invalid price for ${ticker}: ${answer}`)
        continue
      }

      const halfSpread = config.spreadPct / 2
      const bid = mid * (1 - halfSpread / 100)
      const ask = mid * (1 + halfSpread / 100)

      const quote: RedisQuote = {
        bid,
        ask,
        mid,
        spreadPct: config.spreadPct,
        liquidityUsd: config.liquidityUsd,
        recordedAt: now,
      }

      await redis.setex(quoteKey('backed', ticker), QUOTE_TTL_SECONDS, JSON.stringify(quote))
      console.log(`[backed] ${ticker} mid=$${mid.toFixed(2)} spread=${config.spreadPct}%`)
    } catch (err) {
      console.error(`[backed] Error polling ${ticker}:`, err)
    }
  }
}
