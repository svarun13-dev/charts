'use client'

import type { Platform } from '@/types'

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; bg: string; border: string }> = {
  xstocks:    { label: 'xStocks',    color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)'  },
  ondo:       { label: 'Ondo',       color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
  backed:     { label: 'Backed',     color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)'  },
  swarm:      { label: 'Swarm',      color: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.2)' },
  securitize: { label: 'Securitize', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
}

interface VenuePillProps {
  platform: Platform
  size?: 'sm' | 'xs'
  muted?: boolean
}

export default function VenuePill({ platform, size = 'sm', muted = false }: VenuePillProps) {
  const cfg = PLATFORM_CONFIG[platform]
  const fontSize = size === 'xs' ? '10px' : '11px'
  const padding = size === 'xs' ? '1px 6px' : '2px 8px'

  return (
    <span
      style={{
        fontSize,
        padding,
        lineHeight: '16px',
        fontWeight: 500,
        letterSpacing: '0.01em',
        color: muted ? `${cfg.color}99` : cfg.color,
        background: muted ? `${cfg.color}08` : cfg.bg,
        border: `1px solid ${muted ? `${cfg.color}33` : cfg.border}`,
        borderRadius: 4,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {cfg.label}
    </span>
  )
}
