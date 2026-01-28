import { AlertTriangle } from 'lucide-react'
import type { RetrogradeAlert } from '../../types'
import clsx from 'clsx'

interface Props {
  retrogrades: RetrogradeAlert[]
}

export default function RetrogradeAlerts({ retrogrades }: Props) {
  if (retrogrades.length === 0) return null

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 retrograde-pulse">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 signal-pulse" />
        <h3 className="font-semibold text-yellow-400">Retrograde Alert</h3>
        <span className="ml-auto text-xs text-yellow-400/60 animate-pulse">ACTIVE</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {retrogrades.map((retro, index) => (
          <div
            key={retro.planet}
            className={clsx(
              'bg-gray-900/50 rounded-lg p-3 scale-in',
              retro.alert_level === 'high' && 'border-l-4 border-red-500',
              retro.alert_level === 'moderate' && 'border-l-4 border-yellow-500',
              retro.alert_level === 'low' && 'border-l-4 border-blue-500'
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white capitalize">
                {retro.planet} ℞
              </span>
              <span className="text-xs text-gray-400">in {retro.sign}</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">{retro.message}</p>
            <p className="text-xs text-yellow-400">{retro.trading_advice}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
