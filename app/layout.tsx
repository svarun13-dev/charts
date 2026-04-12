import type { Metadata } from 'next'
import './globals.css'
import TickerTape from '@/components/TickerTape'
import MarketStatus from '@/components/MarketStatus'
import NavTabs from '@/components/NavTabs'

export const metadata: Metadata = {
  title: 'Stock Aggregator',
  description: 'Best venue for every tokenised stock — xStocks, Ondo, Backed, Swarm, Securitize.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between gap-6">
            {/* Left: wordmark + tabs */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold tracking-tight text-white whitespace-nowrap">
                  Stock Aggregator
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 600, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: '#60a5fa',
                  background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                  borderRadius: 3, padding: '1px 5px',
                }}>
                  Beta
                </span>
              </div>
              <NavTabs />
            </div>
            {/* Right: market status */}
            <MarketStatus />
          </div>
        </header>

        <TickerTape />

        <main className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
