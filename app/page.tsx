import StockTable from '@/components/StockTable'

export default function HomePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e8e8f0] tracking-tight">Tokenized Stocks</h1>
        <p className="mt-1 text-sm text-[#6b6b8a]">
          Best venue to buy each stock across xStocks, Ondo, Backed, Swarm, and Securitize.
          Sorted by spread.
        </p>
      </div>
      <StockTable />
    </div>
  )
}
