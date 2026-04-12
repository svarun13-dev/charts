'use client'

import type { Platform } from '@/types'
import { PLATFORM_META } from '@/lib/platform-info'

interface VenuePillProps {
  platform: Platform
  size?: 'sm' | 'xs'
  muted?: boolean
  showTooltip?: boolean
}

export default function VenuePill({ platform, size = 'sm', muted = false, showTooltip = true }: VenuePillProps) {
  const meta = PLATFORM_META[platform]
  const color = meta.color
  const fontSize = size === 'xs' ? '10px' : '11px'
  const padding = size === 'xs' ? '1px 6px' : '2px 8px'

  return (
    <span
      data-tooltip={showTooltip ? `${meta.label} — ${meta.description}` : undefined}
      style={{
        fontSize, padding,
        lineHeight: '16px', fontWeight: 500, letterSpacing: '0.01em',
        color: muted ? `${color}88` : color,
        background: muted ? `${color}08` : `${color}14`,
        border: `1px solid ${muted ? `${color}22` : `${color}35`}`,
        borderRadius: 4, whiteSpace: 'nowrap', display: 'inline-block',
        cursor: showTooltip ? 'help' : 'default',
      }}
    >
      {meta.label}
    </span>
  )
}
