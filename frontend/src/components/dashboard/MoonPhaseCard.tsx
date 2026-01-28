import type { MoonPhase } from '../../types'

interface Props {
  phase: MoonPhase | null
  isLoading: boolean
}

export default function MoonPhaseCard({ phase, isLoading }: Props) {
  if (isLoading && !phase) {
    return (
      <div className="card">
        <div className="card-header">Moon Phase</div>
        <div className="animate-pulse">
          <div className="h-24 w-24 bg-gray-800 rounded-full mx-auto mb-4" />
          <div className="h-6 bg-gray-800 rounded w-32 mx-auto mb-2" />
          <div className="h-4 bg-gray-800 rounded w-24 mx-auto" />
        </div>
      </div>
    )
  }

  if (!phase) return null

  return (
    <div className="card">
      <div className="card-header">
        <span className="text-2xl">🌙</span>
        Moon Phase
      </div>

      <div className="text-center">
        {/* Moon Visual */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-700 to-gray-800" />
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-200 to-gray-100"
            style={{
              clipPath: `inset(0 ${100 - phase.illumination}% 0 0)`,
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-4xl">
            {phase.phase_symbol}
          </span>
        </div>

        {/* Phase Info */}
        <h3 className="text-xl font-semibold text-white mb-1">
          {phase.phase_name}
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          {phase.illumination.toFixed(0)}% illuminated
        </p>

        {/* Moon Sign */}
        <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-400">Moon in</p>
          <p className="text-lg font-medium text-cosmic-400">
            {phase.moon_sign} {phase.moon_degree.toFixed(1)}°
          </p>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-800/30 rounded-lg p-2">
            <p className="text-gray-500">Next New Moon</p>
            <p className="text-gray-300 font-medium">
              {phase.days_until_new.toFixed(1)} days
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-2">
            <p className="text-gray-500">Next Full Moon</p>
            <p className="text-gray-300 font-medium">
              {phase.days_until_full.toFixed(1)} days
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
