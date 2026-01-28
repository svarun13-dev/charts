import type { PlanetPosition, AstrologySystem } from '../../types'
import clsx from 'clsx'

interface Props {
  positions: PlanetPosition[]
  system: AstrologySystem
  isLoading: boolean
}

const planetColors: Record<string, string> = {
  sun: 'text-yellow-400 planet-sun',
  moon: 'text-gray-300 planet-moon',
  mercury: 'text-purple-400 planet-mercury',
  venus: 'text-pink-400 planet-venus',
  mars: 'text-red-400 planet-mars',
  jupiter: 'text-orange-400 planet-jupiter',
  saturn: 'text-yellow-600 planet-saturn',
  uranus: 'text-cyan-400 planet-uranus',
  neptune: 'text-blue-400 planet-neptune',
  pluto: 'text-purple-500 planet-pluto',
  north_node: 'text-gray-400',
  south_node: 'text-gray-500',
}

export default function PlanetaryPositions({ positions, system, isLoading }: Props) {
  if (isLoading && positions.length === 0) {
    return (
      <div className="card">
        <div className="card-header">Planetary Positions</div>
        <div className="animate-pulse space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="text-2xl">🪐</span>
        Planetary Positions
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
              <th className="pb-3 font-medium">Planet</th>
              <th className="pb-3 font-medium">Sign</th>
              <th className="pb-3 font-medium">Degree</th>
              {system === 'vedic' && <th className="pb-3 font-medium">Nakshatra</th>}
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr
                key={pos.planet}
                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className={clsx('text-xl', planetColors[pos.planet])}>
                      {pos.symbol}
                    </span>
                    <span className="font-medium text-gray-200">
                      {pos.planet_name}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{pos.sign_symbol}</span>
                    <span className="text-gray-300">{pos.sign}</span>
                  </div>
                </td>
                <td className="py-3 text-gray-300 font-mono">
                  {pos.degree_in_sign.toFixed(2)}°
                </td>
                {system === 'vedic' && (
                  <td className="py-3 text-gray-400 text-sm">
                    {pos.nakshatra && (
                      <span>
                        {pos.nakshatra} (Pada {pos.nakshatra_pada})
                      </span>
                    )}
                  </td>
                )}
                <td className="py-3">
                  {pos.retrograde ? (
                    <span className="badge bg-red-500/20 text-red-400">
                      ℞ Retrograde
                    </span>
                  ) : (
                    <span className="badge bg-green-500/20 text-green-400">
                      Direct
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
