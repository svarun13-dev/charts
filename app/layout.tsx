import type { Metadata } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import TickerTape from '@/components/TickerTape'
import MarketStatus from '@/components/MarketStatus'
import NavTabs from '@/components/NavTabs'

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Stock Aggregator',
  description: 'Best venue for every tokenised stock — xStocks, Ondo, Backed, Swarm, Securitize.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body className="min-h-screen bg-black" style={{ color: 'var(--text)' }}>

        {/* Primary header */}
        <header style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#000',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          {/* Thin amber accent line at very top */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, #d4960a 0%, #f59e0b 40%, transparent 100%)', opacity: 0.6 }} />

          <div className="max-w-6xl mx-auto px-6 h-11 flex items-center justify-between gap-6">
            {/* Left: wordmark + nav */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: '#ede8de',
                  fontFamily: 'var(--font-mono, monospace)',
                }}>
                  Stock Aggregator
                </span>
                <span style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: 'var(--amber)',
                  background: 'var(--amber-dim)', border: '1px solid var(--amber-border)',
                  borderRadius: 2, padding: '1px 5px',
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

        <footer className="max-w-6xl mx-auto px-6 pb-8 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em' }}>
            NOT FINANCIAL ADVICE · FOR INFORMATIONAL PURPOSES ONLY · DATA MAY BE DELAYED
          </p>
        </footer>
      </body>
    </html>
  )
}
