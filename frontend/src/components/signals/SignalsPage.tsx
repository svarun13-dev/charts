import { useState, useEffect } from 'react'
import { Filter, Calendar, TrendingUp } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { signalsApi } from '../../services/api'
import type { TradingSignal, MarketType } from '../../types'
import clsx from 'clsx'

export default function SignalsPage() {
  const { system } = useStore()
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [upcomingSignals, setUpcomingSignals] = useState<any[]>([])
  const [lunarSignals, setLunarSignals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [marketFilter, setMarketFilter] = useState<MarketType | 'all'>('all')
  const [strengthFilter, setStrengthFilter] = useState('moderate')

  useEffect(() => {
    const fetchSignals = async () => {
      setIsLoading(true)
      try {
        const [active, upcoming, lunar] = await Promise.all([
          signalsApi.getActive(system, marketFilter === 'all' ? undefined : marketFilter, strengthFilter),
          signalsApi.getUpcoming(system),
          signalsApi.getLunarSignals(),
        ])
        setSignals(active)
        setUpcomingSignals(upcoming)
        setLunarSignals(lunar)
      } catch (error) {
        console.error('Failed to fetch signals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignals()
  }, [system, marketFilter, strengthFilter])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Signals</h1>
          <p className="text-gray-400 text-sm">
            Astrologically-derived market signals
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filters:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Market:</label>
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value as MarketType | 'all')}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
            >
              <option value="all">All Markets</option>
              <option value="crypto">Crypto</option>
              <option value="stocks">Stocks</option>
              <option value="commodities">Commodities</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Min Strength:</label>
            <select
              value={strengthFilter}
              onChange={(e) => setStrengthFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
            >
              <option value="weak">Weak</option>
              <option value="moderate">Moderate</option>
              <option value="strong">Strong</option>
              <option value="very_strong">Very Strong</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Signals */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <TrendingUp className="w-5 h-5 text-cosmic-400" />
              Active Signals
              <span className="ml-auto text-sm text-gray-400">
                {signals.length} signal{signals.length !== 1 ? 's' : ''}
              </span>
            </div>

            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-800 rounded-lg" />
                ))}
              </div>
            ) : signals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">No signals match your filters</p>
                <p className="text-sm">Try adjusting your filter settings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {signals.map((signal) => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Signals */}
          <div className="card">
            <div className="card-header">
              <Calendar className="w-5 h-5 text-cosmic-400" />
              Upcoming Events
            </div>

            {upcomingSignals.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No major events in the next 7 days
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingSignals.slice(0, 5).map((event, i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-white text-sm">
                        {event.trigger}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{event.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lunar Signals */}
          <div className="card">
            <div className="card-header">
              <span className="text-xl">🌙</span>
              Lunar Signals
            </div>

            <div className="space-y-3">
              {lunarSignals.slice(0, 3).map((signal, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-800/50 rounded-lg"
                >
                  {signal.phase && (
                    <div className="flex justify-between items-center">
                      <span className="text-white">{signal.phase}</span>
                      <span className="text-sm text-gray-400">in {signal.sign}</span>
                    </div>
                  )}
                  {signal.event && (
                    <div className="flex justify-between items-center">
                      <span className="text-white capitalize">{signal.event.replace('_', ' ')}</span>
                      <span className="text-sm text-gray-400">
                        {signal.date && new Date(signal.date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {signal.signal && (
                    <p className="text-xs text-gray-400 mt-1">
                      {signal.signal.advice || signal.signal.effect}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SignalCard({ signal }: { signal: TradingSignal }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{signal.trigger}</h3>
          <p className="text-sm text-gray-400">{signal.signal_type} signal</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx('badge', `badge-${signal.direction}`)}>
            {signal.direction}
          </span>
          <span className={clsx('badge bg-gray-700', `signal-strength-${signal.strength}`)}>
            {signal.strength.replace('_', ' ')}
          </span>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-3">{signal.description}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {signal.markets.map((market) => (
          <span key={market} className="badge bg-cosmic-600/20 text-cosmic-300">
            {market}
          </span>
        ))}
      </div>

      {signal.assets && signal.assets.length > 0 && (
        <div className="pt-3 border-t border-gray-700/50">
          <p className="text-xs text-gray-500 mb-2">Suggested Assets</p>
          <div className="flex gap-2">
            {signal.assets.map((asset) => (
              <span
                key={asset}
                className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
              >
                {asset}
              </span>
            ))}
          </div>
        </div>
      )}

      {signal.expires && (
        <p className="text-xs text-gray-500 mt-3">
          Expires: {new Date(signal.expires).toLocaleString()}
        </p>
      )}
    </div>
  )
}
