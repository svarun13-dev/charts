import EarnTable from '@/components/EarnTable'

export default function EarnPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-white tracking-tight">Earn</h1>
        <p className="mt-1 text-sm" style={{ color: '#555' }}>
          Yield opportunities on tokenised assets — treasuries, LP positions, and lending.
        </p>
      </div>
      <EarnTable />
    </div>
  )
}
