'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/',     label: 'Stocks' },
  { href: '/earn', label: 'Earn'   },
]

export default function NavTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {TABS.map(tab => {
        const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: '4px 12px',
              borderRadius: 6,
              color: active ? '#fff' : '#555',
              background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
              border: '1px solid',
              borderColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'all 0.1s',
              textDecoration: 'none',
            }}
            className="hover:text-white"
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
