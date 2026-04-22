import StockTable from '@/components/StockTable'

export default function MarketsPage() {
  return (
    <div>
      <div className="mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 20 }}>
        <div className="flex items-baseline gap-3">
          <h1 style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--amber)',
            fontFamily: 'var(--font-mono, monospace)',
          }}>
            Markets
          </h1>
          <span style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
            BEST EXECUTION VENUE PER TICKER
          </span>
        </div>
        <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-2)' }}>
          Spread, slippage, and liquidity compared across all tokenization platforms. Click any row to expand.
        </p>
      </div>
      <StockTable />
    </div>
  )
}
