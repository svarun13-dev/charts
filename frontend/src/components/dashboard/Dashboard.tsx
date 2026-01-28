import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { planetsApi, moonApi, signalsApi } from '../../services/api'
import PlanetaryPositions from './PlanetaryPositions'
import MoonPhaseCard from './MoonPhaseCard'
import ActiveSignals from './ActiveSignals'
import AspectsList from './AspectsList'
import RetrogradeAlerts from './RetrogradeAlerts'
import type { Aspect, RetrogradeAlert } from '../../types'

export default function Dashboard() {
  const {
    system,
    planetPositions,
    setPlanetPositions,
    activeSignals,
    setActiveSignals,
    moonPhase,
    setMoonPhase,
    isLoading,
    setIsLoading,
    error,
    setError,
    lastRefresh,
    setLastRefresh,
  } = useStore()

  const [aspects, setAspects] = useState<Aspect[]>([])
  const [retrogrades, setRetrogrades] = useState<RetrogradeAlert[]>([])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [positions, aspectsData, phase, signals, retrogradesData] = await Promise.all([
        planetsApi.getPositions(system),
        planetsApi.getAspects(system),
        moonApi.getPhase(),
        signalsApi.getActive(system),
        signalsApi.getRetrogradeAlerts(system),
      ])

      setPlanetPositions(positions)
      setAspects(aspectsData)
      setMoonPhase(phase)
      setActiveSignals(signals)
      setRetrogrades(retrogradesData)
      setLastRefresh(new Date())
    } catch (err) {
      setError('Failed to fetch data. Make sure the backend is running.')
      console.error('Dashboard fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [system])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">
            {system === 'western' ? 'Western Tropical' : 'Vedic Sidereal'} System
            {lastRefresh && (
              <span className="ml-2">
                | Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Retrograde Alerts */}
      {retrogrades.length > 0 && (
        <div className="mb-6 fade-in">
          <RetrogradeAlerts retrogrades={retrogrades} />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Planetary Positions */}
          <div className="fade-in" style={{ animationDelay: '0.1s' }}>
            <PlanetaryPositions
              positions={planetPositions}
              system={system}
              isLoading={isLoading}
            />
          </div>

          {/* Active Signals */}
          <div className="fade-in" style={{ animationDelay: '0.2s' }}>
            <ActiveSignals signals={activeSignals} isLoading={isLoading} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Moon Phase */}
          <div className="fade-in" style={{ animationDelay: '0.15s' }}>
            <MoonPhaseCard phase={moonPhase} isLoading={isLoading} />
          </div>

          {/* Active Aspects */}
          <div className="fade-in" style={{ animationDelay: '0.25s' }}>
            <AspectsList aspects={aspects} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}
