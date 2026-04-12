import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RWA Stocks Dashboard',
  description: 'Track tokenized stocks across xStocks, Ondo, Backed, Swarm, and Securitize — best liquidity surfaced automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-[#e8e8f0]">
        <header className="border-b border-[#2a2a3d] bg-[#12121a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                R
              </div>
              <span className="font-semibold text-[#e8e8f0] tracking-tight">RWA Stocks</span>
              <span className="hidden sm:block text-xs text-[#6b6b8a] font-medium px-2 py-0.5 rounded bg-[#1a1a26] border border-[#2a2a3d]">
                BETA
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#6b6b8a]">
              <span className="hidden md:block">Prices refresh every 30s</span>
              <a
                href="https://github.com"
                className="hover:text-[#e8e8f0] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
