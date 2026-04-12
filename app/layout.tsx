import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RWA Stocks',
  description: 'Tokenized stocks across xStocks, Ondo, Backed, Swarm, and Securitize — best liquidity surfaced automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tracking-tight text-white">RWA Stocks</span>
              <span
                className="text-[10px] font-medium tracking-widest uppercase"
                style={{ color: '#444', letterSpacing: '0.1em' }}
              >
                Beta
              </span>
            </div>
            <span className="text-xs" style={{ color: '#444' }}>
              Refreshes every 30s
            </span>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
