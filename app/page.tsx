import StockTable from '@/components/StockTable'

export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-white tracking-tight">Tokenized Stocks</h1>
        <p className="mt-1 text-sm" style={{ color: '#555' }}>
          Best venue per ticker by spread. Click any row to compare all platforms.
        </p>
      </div>
      <StockTable />
    </div>
  )
}
