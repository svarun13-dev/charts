import { useState, useEffect } from 'react'
import { Save, Info } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { systemApi } from '../../services/api'
import clsx from 'clsx'

export default function SettingsPage() {
  const { system, setSystem, selectedMarket, setSelectedMarket } = useStore()
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [signalSettings, setSignalSettings] = useState({
    enabledAspects: ['conjunction', 'square', 'trine', 'opposition', 'sextile'],
    minStrength: 5,
    enableRetrogrades: true,
    enableLunar: true,
  })

  useEffect(() => {
    systemApi.getInfo().then(setSystemInfo).catch(console.error)
  }, [])

  const aspectOptions = [
    { id: 'conjunction', label: 'Conjunction (☌)', description: '0° - Intensification' },
    { id: 'sextile', label: 'Sextile (⚹)', description: '60° - Opportunity' },
    { id: 'square', label: 'Square (□)', description: '90° - Challenge' },
    { id: 'trine', label: 'Trine (△)', description: '120° - Harmony' },
    { id: 'opposition', label: 'Opposition (☍)', description: '180° - Tension' },
  ]

  const toggleAspect = (aspectId: string) => {
    setSignalSettings((prev) => ({
      ...prev,
      enabledAspects: prev.enabledAspects.includes(aspectId)
        ? prev.enabledAspects.filter((a) => a !== aspectId)
        : [...prev.enabledAspects, aspectId],
    }))
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm">
          Configure your astrology system and signal preferences
        </p>
      </div>

      {/* Astrology System */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="text-xl">🔮</span>
          Astrology System
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setSystem('western')}
            className={clsx(
              'p-4 rounded-lg border-2 text-left transition-all',
              system === 'western'
                ? 'border-cosmic-500 bg-cosmic-500/10'
                : 'border-gray-700 hover:border-gray-600'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">☉</span>
              <h3 className="font-semibold text-white">Western Tropical</h3>
            </div>
            <p className="text-sm text-gray-400">
              Based on the seasons and vernal equinox. Most popular in Western countries.
            </p>
          </button>

          <button
            onClick={() => setSystem('vedic')}
            className={clsx(
              'p-4 rounded-lg border-2 text-left transition-all',
              system === 'vedic'
                ? 'border-cosmic-500 bg-cosmic-500/10'
                : 'border-gray-700 hover:border-gray-600'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">☽</span>
              <h3 className="font-semibold text-white">Vedic Sidereal</h3>
            </div>
            <p className="text-sm text-gray-400">
              Based on fixed star positions. Traditional Indian Jyotish system with Nakshatras.
            </p>
          </button>
        </div>

        {system === 'vedic' && (
          <div className="mt-4 p-3 bg-cosmic-500/10 rounded-lg flex items-start gap-2">
            <Info className="w-5 h-5 text-cosmic-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-cosmic-300">
              Vedic mode uses Lahiri (Chitrapaksha) ayanamsa and includes Nakshatra positions
              for all planets.
            </p>
          </div>
        )}
      </div>

      {/* Default Market */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="text-xl">📊</span>
          Default Market Filter
        </div>

        <div className="flex flex-wrap gap-3">
          {['all', 'crypto', 'stocks', 'commodities'].map((market) => (
            <button
              key={market}
              onClick={() => setSelectedMarket(market as any)}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                selectedMarket === market
                  ? 'bg-cosmic-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              {market === 'all' ? 'All Markets' : market.charAt(0).toUpperCase() + market.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Signal Settings */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="text-xl">⚡</span>
          Signal Generation
        </div>

        {/* Enabled Aspects */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Enabled Aspects</h4>
          <div className="space-y-2">
            {aspectOptions.map((aspect) => (
              <label
                key={aspect.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800"
              >
                <div>
                  <span className="text-white">{aspect.label}</span>
                  <span className="text-gray-500 text-sm ml-2">{aspect.description}</span>
                </div>
                <input
                  type="checkbox"
                  checked={signalSettings.enabledAspects.includes(aspect.id)}
                  onChange={() => toggleAspect(aspect.id)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-cosmic-600 focus:ring-cosmic-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Min Strength */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            Minimum Signal Strength: {signalSettings.minStrength}
          </h4>
          <input
            type="range"
            min="1"
            max="10"
            value={signalSettings.minStrength}
            onChange={(e) =>
              setSignalSettings((prev) => ({
                ...prev,
                minStrength: parseInt(e.target.value),
              }))
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Weak (1)</span>
            <span>Strong (10)</span>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer">
            <span className="text-gray-300">Include retrograde alerts</span>
            <input
              type="checkbox"
              checked={signalSettings.enableRetrogrades}
              onChange={(e) =>
                setSignalSettings((prev) => ({
                  ...prev,
                  enableRetrogrades: e.target.checked,
                }))
              }
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-cosmic-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer">
            <span className="text-gray-300">Include lunar cycle signals</span>
            <input
              type="checkbox"
              checked={signalSettings.enableLunar}
              onChange={(e) =>
                setSignalSettings((prev) => ({
                  ...prev,
                  enableLunar: e.target.checked,
                }))
              }
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-cosmic-600"
            />
          </label>
        </div>
      </div>

      {/* System Info */}
      {systemInfo && (
        <div className="card">
          <div className="card-header">
            <span className="text-xl">ℹ️</span>
            System Information
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-500">App Version</p>
              <p className="text-white font-medium">{systemInfo.version}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-500">Supported Markets</p>
              <p className="text-white font-medium">
                {systemInfo.markets?.join(', ')}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-500">Western System</p>
              <p className="text-white font-medium">
                {systemInfo.systems?.western?.zodiac_type}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-500">Vedic Ayanamsa</p>
              <p className="text-white font-medium capitalize">
                {systemInfo.systems?.vedic?.ayanamsa}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
