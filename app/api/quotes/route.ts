import { NextResponse } from 'next/server'
import { getMockQuotes } from '@/lib/mock-data'
import type { QuotesApiResponse } from '@/types'

export const revalidate = 0

export async function GET() {
  const stocks = getMockQuotes()

  const response: QuotesApiResponse = {
    updatedAt: new Date().toISOString(),
    stocks,
  }

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
