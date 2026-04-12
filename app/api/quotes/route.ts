import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRedis, quoteKey } from '@/lib/redis'
import { computeBestVenue, isStale } from '@/lib/utils'
import type { Quote, StockWithQuotes, QuotesApiResponse, Platform, Chain, RedisQuote } from '@/types'

export const revalidate = 0 // always dynamic

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      include: { platforms: true },
      orderBy: { ticker: 'asc' },
    })

    const redis = getRedis()
    const stocks: StockWithQuotes[] = []

    for (const asset of assets) {
      const quotes: Quote[] = []

      for (const pa of asset.platforms) {
        const key = quoteKey(pa.platform, asset.ticker)
        const raw = await redis.get(key)

        if (!raw) continue

        let parsed: RedisQuote
        try {
          parsed = JSON.parse(raw)
        } catch {
          continue
        }

        quotes.push({
          platform: pa.platform as Platform,
          chain: pa.chain as Chain,
          bid: parsed.bid,
          ask: parsed.ask,
          mid: parsed.mid,
          spreadPct: parsed.spreadPct,
          liquidityUsd: parsed.liquidityUsd,
          buyUrl: pa.buyUrl,
          minBuyUsd: pa.minBuyUsd,
          stale: isStale(parsed.recordedAt),
          recordedAt: parsed.recordedAt,
        })
      }

      if (quotes.length === 0) continue

      const sortedQuotes = [...quotes].sort((a, b) => {
        if (a.spreadPct !== b.spreadPct) return a.spreadPct - b.spreadPct
        return b.liquidityUsd - a.liquidityUsd
      })

      stocks.push({
        ticker: asset.ticker,
        name: asset.name,
        assetType: asset.assetType as 'equity' | 'etf',
        bestQuote: computeBestVenue(quotes),
        allQuotes: sortedQuotes,
      })
    }

    const response: QuotesApiResponse = {
      updatedAt: new Date().toISOString(),
      stocks,
    }

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    console.error('[/api/quotes] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
