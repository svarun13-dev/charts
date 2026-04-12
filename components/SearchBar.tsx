'use client'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  count: number
}

export default function SearchBar({ value, onChange, count }: SearchBarProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <svg
          className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
          style={{ color: '#444' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: 13,
            paddingLeft: 20,
            width: 160,
          }}
          className="placeholder:text-[#333]"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            style={{ color: '#444', marginLeft: 4 }}
            className="hover:text-white transition-colors"
          >
            ×
          </button>
        )}
      </div>
      <span className="text-xs" style={{ color: '#333' }}>
        {count} {count === 1 ? 'stock' : 'stocks'}
      </span>
    </div>
  )
}
