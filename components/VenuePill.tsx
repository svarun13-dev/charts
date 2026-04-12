'use client'

import type { Platform } from '@/types'

const PLATFORM_LABEL: Record<Platform, string> = {
  xstocks:    'xStocks',
  ondo:       'Ondo',
  backed:     'Backed',
  swarm:      'Swarm',
  securitize: 'Securitize',
}

interface VenuePillProps {
  platform: Platform
  size?: 'sm' | 'xs'
  muted?: boolean
}

export default function VenuePill({ platform, size = 'sm', muted = false }: VenuePillProps) {
  const label = PLATFORM_LABEL[platform]
  const fontSize = size === 'xs' ? '10px' : '11px'
  const padding = size === 'xs' ? '1px 6px' : '2px 7px'

  return (
    <span
      style={{
        fontSize,
        padding,
        lineHeight: '16px',
        fontWeight: 500,
        letterSpacing: '0.01em',
        color: muted ? '#444' : '#888',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 4,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  )
}
