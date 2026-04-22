import EarnTable from '@/components/EarnTable'

export default function EarnPage() {
  return (
    <div>
      <div className="mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 20 }}>
        <div className="flex items-baseline gap-3">
          <h1 style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--amber)',
            fontFamily: 'var(--font-mono, monospace)',
          }}>
            Earn
          </h1>
          <span style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
            YIELD ON TOKENIZED ASSETS
          </span>
        </div>
        <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-2)' }}>
          Treasuries, LP positions, and lending — sorted by APY.
        </p>
      </div>
      <EarnTable />
    </div>
  )
}
