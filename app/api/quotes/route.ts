import { NextResponse } from 'next/server'
import { getMockQuotes } from '@/lib/mock-data'
import { fetchXStockQuotes } from '@/lib/jupiter'
import type { QuotesApiResponse, StockWithQuotes, Quote } from '@/types'

export const revalidate = 0

export async function GET() {
  // Start with the full mock dataset as the base
  const stocks = getMockQuotes()

  // Attempt to overlay live Jupiter prices for the xStocks tokens we have mints for.
  // If Jupiter is unreachable we silently fall back to mock data — no hard failure.
  try {
    const liveQuotes = await fetchXStockQuotes()

    if (liveQuotes.length > 0) {
      // Build a lookup: ticker → live quote
      const liveByTicker = Object.fromEntries(liveQuotes.map(q => [q.ticker, q]))

      for (const stock of stocks) {
        const live = liveByTicker[stock.ticker]
        if (!live) continue

        // Replace the matching xstocks/solana quote with live data
        const updatedAllQuotes: Quote[] = stock.allQuotes.map(q => {
          if (q.platform !== 'xstocks' || q.chain !== 'solana') return q
          return {
            ...q,
            mid: live.mid,
            bid: live.bid,
            ask: live.ask,
            spreadPct: live.spreadPct,
            liquidityUsd: live.liquidityUsd,
            recordedAt: live.recordedAt,
            stale: false,
          }
        })

        // Recompute bestQuote from the updated allQuotes
        const best = updatedAllQuotes.reduce((a, b) =>
          a.spreadPct < b.spreadPct ? a : b
        )

        const updated = stock as StockWithQuotes
        updated.allQuotes = updatedAllQuotes
        updated.bestQuote = best
      }

      console.log(`[api/quotes] Live Jupiter prices for ${liveQuotes.length} tickers`)
    }
  } catch (err) {
    console.warn('[api/quotes] Jupiter fetch failed, using mock data:', err)
  }

  const response: QuotesApiResponse = {
    updatedAt: new Date().toISOString(),
    stocks,
  }

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
