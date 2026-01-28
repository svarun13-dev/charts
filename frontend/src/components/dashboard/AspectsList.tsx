import type { Aspect } from '../../types'
import clsx from 'clsx'

interface Props {
  aspects: Aspect[]
  isLoading: boolean
}

const natureColors = {
  harmonious: 'text-green-400 bg-green-500/10',
  challenging: 'text-red-400 bg-red-500/10',
  neutral: 'text-gray-400 bg-gray-500/10',
}

export default function AspectsList({ aspects, isLoading }: Props) {
  if (isLoading && aspects.length === 0) {
    return (
      <div className="card">
        <div className="card-header">Active Aspects</div>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="text-2xl">✨</span>
        Active Aspects
      </div>

      <div className="space-y-2">
        {aspects.slice(0, 8).map((aspect, index) => (
          <div
            key={`${aspect.planet1}-${aspect.planet2}-${index}`}
            className={clsx(
              'flex items-center justify-between p-3 rounded-lg',
              natureColors[aspect.nature]
            )}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">{aspect.planet1}</span>
              <span className="text-xl" title={aspect.aspect_type}>
                {aspect.symbol}
              </span>
              <span className="font-medium capitalize">{aspect.planet2}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400">
                orb: {aspect.orb.toFixed(1)}°
              </span>
              <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'w-1.5 h-3 rounded-full',
                      i < aspect.strength
                        ? aspect.nature === 'harmonious'
                          ? 'bg-green-400'
                          : aspect.nature === 'challenging'
                          ? 'bg-red-400'
                          : 'bg-gray-400'
                        : 'bg-gray-700'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}

        {aspects.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No significant aspects currently active
          </p>
        )}

        {aspects.length > 8 && (
          <p className="text-center text-gray-500 text-sm pt-2">
            +{aspects.length - 8} more aspects
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Harmonious
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          Challenging
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          Neutral
        </span>
      </div>
    </div>
  )
}
