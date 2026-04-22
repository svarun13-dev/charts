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
  const { newThisWeek, newThisMonth, platforms, tickers } = statsFromListings()

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>
          Discover
        </h1>
        <p style={{ marginTop: 4, fontSize: 13, color: '#555' }}>
          Track new tokenized stock listings across all RWA platforms in real time.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mb-10"
        style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' }}>
        {[
          { label: 'New this week',  value: newThisWeek.toString()  },
          { label: 'New this month', value: newThisMonth.toString() },
          { label: 'Platforms',      value: `${platforms} active`   },
          { label: 'Total assets',   value: `${tickers} stocks`     },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#0a0a0a', padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: '#444', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e5e5e5', letterSpacing: '-0.01em' }}>{value}</div>
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
