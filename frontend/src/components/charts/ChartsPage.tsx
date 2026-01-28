import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { planetsApi, marketApi } from '../../services/api'
import ZodiacWheel from './ZodiacWheel'
import PriceChart from './PriceChart'
import type { PlanetPosition, MarketType, HistoricalDataPoint } from '../../types'

export default function ChartsPage() {
  const { system } = useStore()
  const [positions, setPositions] = useState<PlanetPosition[]>([])
  const [selectedAsset, setSelectedAsset] = useState({ symbol: 'BTC', market: 'crypto' as MarketType })
  const [priceHistory, setPriceHistory] = useState<HistoricalDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [posData, historyData] = await Promise.all([
          planetsApi.getPositions(system),
          marketApi.getHistory(selectedAsset.symbol, selectedAsset.market, 30),
        ])
        setPositions(posData)
        setPriceHistory(historyData)
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [system, selectedAsset])

  const assets = [
    { symbol: 'BTC', market: 'crypto' as MarketType, name: 'Bitcoin' },
    { symbol: 'ETH', market: 'crypto' as MarketType, name: 'Ethereum' },
    { symbol: 'AAPL', market: 'stocks' as MarketType, name: 'Apple' },
    { symbol: 'GOLD', market: 'commodities' as MarketType, name: 'Gold' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Astrological Charts</h1>
        <p className="text-gray-400 text-sm">
          Visualize planetary positions and price correlations
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Zodiac Wheel */}
        <div className="card">
          <div className="card-header">
            <span className="text-2xl">🔮</span>
            Zodiac Wheel
            <span className="ml-auto text-sm text-gray-400">
              {system === 'western' ? 'Tropical' : 'Sidereal'}
            </span>
          </div>

          <div className="flex justify-center">
            <ZodiacWheel positions={positions} system={system} />
          </div>

          {system === 'vedic' && positions.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Nakshatra Positions
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {positions.slice(0, 6).map((pos) => (
                  <div
                    key={pos.planet}
                    className="flex justify-between bg-gray-800/30 rounded px-2 py-1"
                  >
                    <span className="text-gray-300 capitalize">{pos.planet}</span>
                    <span className="text-cosmic-400">{pos.nakshatra}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price Chart */}
        <div className="card">
          <div className="card-header justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Price Chart
            </div>
            <select
              value={`${selectedAsset.symbol}-${selectedAsset.market}`}
              onChange={(e) => {
                const [symbol, market] = e.target.value.split('-')
                setSelectedAsset({ symbol, market: market as MarketType })
              }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm"
            >
              {assets.map((asset) => (
                <option
                  key={`${asset.symbol}-${asset.market}`}
                  value={`${asset.symbol}-${asset.market}`}
                >
                  {asset.name} ({asset.symbol})
                </option>
              ))}
            </select>
          </div>

          <PriceChart data={priceHistory} symbol={selectedAsset.symbol} />
        </div>
      </div>

      {/* Aspect Grid */}
      <div className="card mt-6">
        <div className="card-header">
          <span className="text-2xl">✨</span>
          Current Planetary Aspects Grid
        </div>

        <div className="overflow-x-auto">
          <AspectGrid positions={positions} />
        </div>
      </div>
    </div>
  )
}

function AspectGrid({ positions }: { positions: PlanetPosition[] }) {
  const planets = positions.slice(0, 10)

  const getAspect = (lon1: number, lon2: number): { symbol: string; color: string } | null => {
    let diff = Math.abs(lon1 - lon2)
    if (diff > 180) diff = 360 - diff

    const aspects = [
      { angle: 0, orb: 10, symbol: '☌', color: 'text-purple-400' },
      { angle: 60, orb: 6, symbol: '⚹', color: 'text-green-400' },
      { angle: 90, orb: 8, symbol: '□', color: 'text-red-400' },
      { angle: 120, orb: 8, symbol: '△', color: 'text-green-400' },
      { angle: 180, orb: 10, symbol: '☍', color: 'text-red-400' },
    ]

    for (const aspect of aspects) {
      if (Math.abs(diff - aspect.angle) <= aspect.orb) {
        return { symbol: aspect.symbol, color: aspect.color }
      }
    }
    return null
  }

  return (
    <table className="w-full text-center text-sm">
      <thead>
        <tr>
          <th className="p-2"></th>
          {planets.map((p) => (
            <th key={p.planet} className="p-2 text-gray-400">
              <span title={p.planet_name}>{p.symbol}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {planets.map((p1, i) => (
          <tr key={p1.planet}>
            <td className="p-2 text-gray-400">
              <span title={p1.planet_name}>{p1.symbol}</span>
            </td>
            {planets.map((p2, j) => {
              if (j <= i) {
                return <td key={`${p1.planet}-${p2.planet}`} className="p-2 bg-gray-800/30"></td>
              }
              const aspect = getAspect(p1.longitude, p2.longitude)
              return (
                <td key={`${p1.planet}-${p2.planet}`} className="p-2">
                  {aspect && (
                    <span className={`text-lg ${aspect.color}`}>{aspect.symbol}</span>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
