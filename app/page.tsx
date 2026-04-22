import NewListings from '@/components/NewListings'
import TrendingStocks from '@/components/TrendingStocks'
import { LISTING_EVENTS } from '@/lib/mock-data'

function statsFromListings() {
  const now = Date.now()
  const newThisWeek  = LISTING_EVENTS.filter(e => now - new Date(e.listedAt).getTime() < 7  * 86_400_000).length
  const newThisMonth = LISTING_EVENTS.filter(e => now - new Date(e.listedAt).getTime() < 30 * 86_400_000).length
  const platforms    = new Set(LISTING_EVENTS.map(e => e.platform)).size
  const tickers      = new Set(LISTING_EVENTS.map(e => e.ticker)).size
  return { newThisWeek, newThisMonth, platforms, tickers }
}

export default function DiscoverPage() {
  const s = statsFromListings()

  return (
    <div>
      {/* Page header */}
      <div className="mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 20 }}>
        <div className="flex items-baseline gap-3">
          <h1 style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--amber)',
            fontFamily: 'var(--font-mono, monospace)',
          }}>
            Discover
          </h1>
          <span style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
            TOKENIZED EQUITY LISTINGS · ALL PLATFORMS
          </span>
        </div>
        <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-2)' }}>
          Monitor new tokenized stock listings across xStocks, Ondo, Backed, Swarm, and Securitize.
        </p>
      </div>

      {/* Stats strip — Bloomberg-style: label above, value below */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mb-10"
        style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        {[
          { label: 'New This Week',  value: s.newThisWeek.toString(),  accent: s.newThisWeek > 0 },
          { label: 'New This Month', value: s.newThisMonth.toString(), accent: false },
          { label: 'Active Platforms', value: `${s.platforms}`,        accent: false },
          { label: 'Total Assets',   value: `${s.tickers} stocks`,     accent: false },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ background: 'var(--surface)', padding: '12px 16px' }}>
            <div style={{
              fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-3)', marginBottom: 5,
            }}>
              {label}
            </div>
            <div style={{
              fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em',
              color: accent ? 'var(--amber-bright)' : 'var(--text)',
              fontFamily: 'var(--font-mono, monospace)',
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-12">
        <NewListings />
        <TrendingStocks />
      </div>
    </div>
  )
}
