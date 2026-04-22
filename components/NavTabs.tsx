'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/',        label: 'Discover' },
  { href: '/markets', label: 'Markets'  },
  { href: '/earn',    label: 'Earn'     },
]

export default function NavTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center" style={{ gap: 2 }}>
      {TABS.map(tab => {
        const active = tab.href === '/'
          ? pathname === '/'
          : pathname === tab.href || pathname.startsWith(tab.href + '/')

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: 2,
              border: '1px solid',
              borderColor: active ? 'var(--amber-border)' : 'transparent',
              background:   active ? 'var(--amber-dim)'   : 'transparent',
              color:        active ? 'var(--amber-bright)' : 'var(--text-2)',
              cursor: 'pointer',
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
