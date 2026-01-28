import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react'
import type { TradingSignal, SignalDirection } from '../../types'
import clsx from 'clsx'

interface Props {
  signals: TradingSignal[]
  isLoading: boolean
}

const directionIcons: Record<SignalDirection, typeof TrendingUp> = {
  bullish: TrendingUp,
  bearish: TrendingDown,
  neutral: Minus,
  volatile: Zap,
}

const directionColors: Record<SignalDirection, string> = {
  bullish: 'text-green-400',
  bearish: 'text-red-400',
  neutral: 'text-gray-400',
  volatile: 'text-yellow-400',
}

export default function ActiveSignals({ signals, isLoading }: Props) {
  if (isLoading && signals.length === 0) {
    return (
      <div className="card">
        <div className="card-header">Active Signals</div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="text-2xl">📊</span>
        Active Signals
        {signals.length > 0 && (
          <span className="ml-auto bg-cosmic-600/20 text-cosmic-400 px-2 py-1 rounded-full text-sm">
            {signals.length} active
          </span>
        )}
      </div>

      {signals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No active signals at the moment</p>
          <p className="text-sm mt-1">Check back when planetary aspects form</p>
        </div>
      ) : (
        <div className="space-y-4">
          {signals.map((signal) => {
            const Icon = directionIcons[signal.direction]
            return (
              <div
                key={signal.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        signal.direction === 'bullish' && 'bg-green-500/20',
                        signal.direction === 'bearish' && 'bg-red-500/20',
                        signal.direction === 'neutral' && 'bg-gray-500/20',
                        signal.direction === 'volatile' && 'bg-yellow-500/20'
                      )}
                    >
                      <Icon className={clsx('w-5 h-5', directionColors[signal.direction])} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{signal.trigger}</h4>
                      <p className="text-sm text-gray-400">{signal.signal_type}</p>
                    </div>
                  </div>
                  <span className={clsx('badge', `badge-${signal.direction}`)}>
                    {signal.direction}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-3">{signal.description}</p>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={clsx(
                      'badge',
                      `signal-strength-${signal.strength}`,
                      'bg-gray-700/50'
                    )}
                  >
                    {signal.strength.replace('_', ' ')} signal
                  </span>
                  {signal.markets.map((market) => (
                    <span key={market} className="badge bg-gray-700/50 text-gray-300">
                      {market}
                    </span>
                  ))}
                </div>

                {signal.assets && signal.assets.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-1">Suggested assets:</p>
                    <div className="flex gap-2">
                      {signal.assets.map((asset) => (
                        <span
                          key={asset}
                          className="px-2 py-1 bg-cosmic-600/20 text-cosmic-300 text-xs rounded"
                        >
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
