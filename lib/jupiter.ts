/**
 * Jupiter Price API v2 — fetches live on-chain prices for xStocks tokens on Solana.
 * No API key required. Single batch request for all known mints.
 *
 * Docs: https://station.jup.ag/docs/apis/price-api-v2
 */

// ---------------------------------------------------------------------------
// Known xStock mint addresses on Solana
// Source: xstocks.fi / Birdeye / Solana explorer
// ---------------------------------------------------------------------------
export const XSTOCKS_MINTS: Record<string, string> = {
  AAPL:  'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp',
  NVDA:  'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh',
  TSLA:  'XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB',
  GOOGL: 'XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN',
  AMZN:  'Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg',
  SPY:   'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W',
  QQQ:   'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ',
  // TODO: find mints for COIN, META, MSFT, NFLX once xStocks lists them
}

// Reverse map: mint → ticker
const MINT_TO_TICKER = Object.fromEntries(
  Object.entries(XSTOCKS_MINTS).map(([ticker, mint]) => [mint, ticker])
)

// ---------------------------------------------------------------------------
// Types from the Jupiter Price API v2 response
// ---------------------------------------------------------------------------
interface JupiterPriceItem {
  id: string
  type: string
  price: string
  extraInfo?: {
    quotedPrice?: {
      buyPrice: string   // ask — price to buy the token
      sellPrice: string  // bid — price to sell the token
    }
    depth?: {
      buyPriceImpactRatio?: { depth: Record<string, number> }
    }
  }
}

interface JupiterPriceResponse {
  data: Record<string, JupiterPriceItem>
  timeTaken: number
}

// ---------------------------------------------------------------------------
// Quote shape returned by fetchXStockQuotes()
// ---------------------------------------------------------------------------
export interface LiveXStockQuote {
  ticker: string
  mid: number
  bid: number
  ask: number
  spreadPct: number
  liquidityUsd: number
  recordedAt: string
}

// ---------------------------------------------------------------------------
// Estimate pool liquidity from price impact ratios.
// depth[size] is the fractional price impact (e.g. 0.002 = 0.2%) for that
// USDC trade size. We invert to get approximate pool depth:
//   liquidityUsd ≈ tradeSize / impact
// We take the median of a few data points to smooth it.
// ---------------------------------------------------------------------------
function estimateLiquidity(depth: Record<string, number>): number {
  const entries = Object.entries(depth)
    .map(([size, impact]) => ({ size: Number(size), impact }))
    .filter(e => e.impact > 0)

  if (entries.length === 0) return 500_000

  const estimates = entries.map(({ size, impact }) => size / impact)
  estimates.sort((a, b) => a - b)
  return estimates[Math.floor(estimates.length / 2)] // median
}

// ---------------------------------------------------------------------------
// Main fetch — single API call for all known xStock mints
// ---------------------------------------------------------------------------
export async function fetchXStockQuotes(): Promise<LiveXStockQuote[]> {
  const mints = Object.values(XSTOCKS_MINTS)
  const url =
    `https://api.jup.ag/price/v2?ids=${mints.join(',')}&showExtraInfo=true`

  const res = await fetch(url, {
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(8_000),
  })

  if (!res.ok) {
    throw new Error(`Jupiter API error: ${res.status} ${res.statusText}`)
  }

  const json: JupiterPriceResponse = await res.json()
  const now = new Date().toISOString()
  const results: LiveXStockQuote[] = []

  for (const [mint, item] of Object.entries(json.data)) {
    const ticker = MINT_TO_TICKER[mint]
    if (!ticker) continue

    const mid = Number(item.price)
    if (!mid || isNaN(mid)) continue

    const quoted = item.extraInfo?.quotedPrice
    const ask = quoted?.buyPrice  ? Number(quoted.buyPrice)  : mid * 1.0002
    const bid = quoted?.sellPrice ? Number(quoted.sellPrice) : mid * 0.9998

    const spreadPct = ask > bid ? ((ask - bid) / mid) * 100 : 0.04

    const depthMap = item.extraInfo?.depth?.buyPriceImpactRatio?.depth
    const liquidityUsd = depthMap ? estimateLiquidity(depthMap) : 1_000_000

    results.push({ ticker, mid, bid, ask, spreadPct, liquidityUsd, recordedAt: now })
  }

  return results
}
