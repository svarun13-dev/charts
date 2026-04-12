/**
 * xStocks poller — uses Jupiter Aggregator on Solana.
 * Fetches USDC→token and token→USDC quotes to derive bid/ask.
 */

import { getRedis, quoteKey, QUOTE_TTL_SECONDS } from '@/lib/redis'
import type { RedisQuote } from '@/types'

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const QUOTE_AMOUNT_USDC = 1_000_000_000 // 1000 USDC in 6 decimals
const JUPITER_QUOTE_URL = 'https://quote-api.jup.ag/v6/quote'

// xStocks token mint addresses on Solana
// Source: xstocks.fi / Birdeye — update as new tokens launch
const XSTOCKS_TOKENS: Record<string, { mint: string; decimals: number }> = {
  AAPL:  { mint: 'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp', decimals: 6 },
  NVDA:  { mint: 'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh', decimals: 6 },
  TSLA:  { mint: 'XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB', decimals: 6 },
  GOOGL: { mint: 'XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN', decimals: 6 },
  AMZN:  { mint: 'Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg', decimals: 6 },
  SPY:   { mint: 'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W', decimals: 6 },
  QQQ:   { mint: 'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ', decimals: 6 },
  // TODO: find mints for COIN, META, MSFT, NFLX once xStocks lists them
}

async function fetchJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
): Promise<{ outAmount: number; priceImpactPct: number } | null> {
  try {
    const url = new URL(JUPITER_QUOTE_URL)
    url.searchParams.set('inputMint', inputMint)
    url.searchParams.set('outputMint', outputMint)
    url.searchParams.set('amount', amount.toString())
    url.searchParams.set('slippageBps', '50')

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null

    const data = await res.json()
    return {
      outAmount: Number(data.outAmount),
      priceImpactPct: Number(data.priceImpactPct ?? 0),
    }
  } catch {
    return null
  }
}

export async function poll(): Promise<void> {
  const redis = getRedis()
  const now = new Date().toISOString()

  for (const [ticker, { mint, decimals }] of Object.entries(XSTOCKS_TOKENS)) {
    try {
      // Buy quote: USDC → token (gives us the ask price)
      const buyQuote = await fetchJupiterQuote(USDC_MINT, mint, QUOTE_AMOUNT_USDC)
      if (!buyQuote) {
        console.warn(`[xstocks] No buy quote for ${ticker}`)
        continue
      }

      // Sell quote: token → USDC (gives us the bid price)
      // Use 1 token worth of the asset (~QUOTE_AMOUNT_USDC / ask * 10^decimals)
      const approxAsk = QUOTE_AMOUNT_USDC / 1e6 / (buyQuote.outAmount / 10 ** decimals)
      const tokenAmountForSell = Math.floor((1000 / approxAsk) * 10 ** decimals) // sell $1000 worth
      const sellQuote = await fetchJupiterQuote(mint, USDC_MINT, tokenAmountForSell)

      // ask = USDC paid / tokens received (normalized to per-share)
      const tokensReceived = buyQuote.outAmount / 10 ** decimals
      const ask = QUOTE_AMOUNT_USDC / 1e6 / tokensReceived

      // bid = USDC received / tokens sold (normalized to per-share)
      let bid: number
      if (sellQuote) {
        const usdcReceived = sellQuote.outAmount / 1e6
        const tokensSold = tokenAmountForSell / 10 ** decimals
        bid = usdcReceived / tokensSold
      } else {
        // Fallback: approximate bid from price impact
        bid = ask * (1 - buyQuote.priceImpactPct / 100)
      }

      const mid = (bid + ask) / 2
      const spreadPct = ((ask - bid) / mid) * 100

      // Approximate liquidity: TVL heuristic from the quote depth
      // Jupiter returns inAmount/outAmount — use the 1000 USDC depth as a proxy
      const liquidityUsd = QUOTE_AMOUNT_USDC / 1e6 / (buyQuote.priceImpactPct / 100 + 0.001) * 0.02

      const quote: RedisQuote = {
        bid,
        ask,
        mid,
        spreadPct: Math.max(0, spreadPct),
        liquidityUsd: Math.max(liquidityUsd, 50_000),
        recordedAt: now,
      }

      await redis.setex(quoteKey('xstocks', ticker), QUOTE_TTL_SECONDS, JSON.stringify(quote))
      console.log(`[xstocks] ${ticker} mid=$${mid.toFixed(2)} spread=${spreadPct.toFixed(3)}%`)
    } catch (err) {
      console.error(`[xstocks] Error polling ${ticker}:`, err)
    }
  }
}
