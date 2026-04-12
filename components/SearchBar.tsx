'use client'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  count: number
}

export default function SearchBar({ value, onChange, count }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b8a]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search ticker or name..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#12121a] border border-[#2a2a3d] rounded-lg pl-9 pr-4 py-2 text-sm text-[#e8e8f0] placeholder-[#6b6b8a] focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b8a] hover:text-[#e8e8f0] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <span className="text-xs text-[#6b6b8a] whitespace-nowrap">
        {count} {count === 1 ? 'stock' : 'stocks'}
      </span>
    </div>
  )
}
