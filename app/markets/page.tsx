import StockTable from '@/components/StockTable'

export default function MarketsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>
          Markets
        </h1>
        <p style={{ marginTop: 4, fontSize: 13, color: '#555' }}>
          Best venue per ticker by spread. Click any row to compare all platforms.
        </p>
      </div>
      <StockTable />
    </div>
  )
}
