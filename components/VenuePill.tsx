'use client'

import type { Platform } from '@/types'

const PLATFORM_CONFIG: Record<Platform, { label: string; className: string }> = {
  xstocks:    { label: 'xStocks',    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  ondo:       { label: 'Ondo',       className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  backed:     { label: 'Backed',     className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  swarm:      { label: 'Swarm',      className: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
  securitize: { label: 'Securitize', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
}

interface VenuePillProps {
  platform: Platform
  size?: 'sm' | 'xs'
}

export default function VenuePill({ platform, size = 'sm' }: VenuePillProps) {
  const cfg = PLATFORM_CONFIG[platform]
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${cfg.className}`}
    >
      {cfg.label}
    </span>
  )
}
