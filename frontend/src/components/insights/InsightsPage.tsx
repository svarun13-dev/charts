import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Clock,
  Zap,
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import clsx from 'clsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

interface SentimentFactor {
  factor: string
  impact: string
  points: number
  description: string
}

interface MarketAdvice {
  sentiment: string
  advice: string
}

interface TodayOutlook {
  date: string
  timestamp: string
  headline: string
  sentiment: {
    score: number
    sentiment: string
    emoji: string
    volatility: string
    factors: SentimentFactor[]
  }
  moon: {
    phase: string
    sign: string
    illumination: number
  }
  retrogrades: Array<{ planet: string; sign: string }>
  key_aspects: Array<{
    aspect: string
    type: string
    nature: string
    strength: number
  }>
  recommendations: {
    overall_action: string
    do: string[]
    avoid: string[]
    watch: string[]
    market_specific: {
      crypto: MarketAdvice
      stocks: MarketAdvice
      commodities: MarketAdvice
    }
  }
  update_info: {
    frequency: string
    note: string
    auto_refresh: string
  }
}

export default function InsightsPage() {
  const { system } = useStore()
  const [outlook, setOutlook] = useState<TodayOutlook | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchOutlook = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/insights/today?system=${system}`)
      if (!res.ok) throw new Error('Failed to fetch outlook')
      const data = await res.json()
      setOutlook(data)
      setLastUpdate(new Date())
    } catch (err) {
      setError('Failed to load insights. Make sure the backend is running.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOutlook()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchOutlook, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [system])

  if (isLoading && !outlook) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-800 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-48 bg-gray-800 rounded-xl" />
            <div className="h-48 bg-gray-800 rounded-xl" />
            <div className="h-48 bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300">{error}</p>
          <button onClick={fetchOutlook} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!outlook) return null

  const sentimentColor = {
    bullish: 'text-green-400',
    slightly_bullish: 'text-lime-400',
    neutral: 'text-gray-400',
    slightly_bearish: 'text-orange-400',
    bearish: 'text-red-400',
  }[outlook.sentiment.sentiment] || 'text-gray-400'

  const sentimentBg = {
    bullish: 'from-green-500/20 to-green-600/10',
    slightly_bullish: 'from-lime-500/20 to-lime-600/10',
    neutral: 'from-gray-500/20 to-gray-600/10',
    slightly_bearish: 'from-orange-500/20 to-orange-600/10',
    bearish: 'from-red-500/20 to-red-600/10',
  }[outlook.sentiment.sentiment] || 'from-gray-500/20 to-gray-600/10'

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Today's Insights</h1>
          <p className="text-gray-400 text-sm">
            {outlook.date} • {system === 'western' ? 'Western' : 'Vedic'} System
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastUpdate && `Updated ${lastUpdate.toLocaleTimeString()}`}
          </div>
          <button
            onClick={fetchOutlook}
            disabled={isLoading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Headline Banner */}
      <div className={clsx(
        'rounded-xl p-6 mb-6 bg-gradient-to-r border fade-in',
        sentimentBg,
        outlook.sentiment.sentiment.includes('bullish') && 'border-green-500/30',
        outlook.sentiment.sentiment.includes('bearish') && 'border-red-500/30',
        outlook.sentiment.sentiment === 'neutral' && 'border-gray-500/30'
      )}>
        <h2 className="text-xl font-bold text-white mb-2">{outlook.headline}</h2>
        <p className="text-gray-300">{outlook.recommendations.overall_action}</p>
      </div>

      {/* Sentiment Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="card card-hover fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="text-center">
            <div className="text-5xl mb-2">{outlook.sentiment.emoji}</div>
            <div className={clsx('text-3xl font-bold', sentimentColor)}>
              {outlook.sentiment.score > 0 ? '+' : ''}{outlook.sentiment.score}
            </div>
            <div className="text-gray-400 text-sm capitalize mt-1">
              {outlook.sentiment.sentiment.replace('_', ' ')}
            </div>
            <div className="mt-3 text-xs">
              <span className="text-gray-500">Volatility: </span>
              <span className={clsx(
                'capitalize',
                outlook.sentiment.volatility === 'high' && 'text-red-400',
                outlook.sentiment.volatility === 'elevated' && 'text-yellow-400',
                outlook.sentiment.volatility === 'low' && 'text-green-400'
              )}>
                {outlook.sentiment.volatility}
              </span>
            </div>
          </div>
        </div>

        {/* Moon Info */}
        <div className="card card-hover fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="text-center">
            <div className="text-4xl mb-2 moon-glow">🌙</div>
            <div className="text-lg font-semibold text-white">{outlook.moon.phase}</div>
            <div className="text-gray-400 text-sm">in {outlook.moon.sign}</div>
            <div className="text-xs text-gray-500 mt-2">
              {outlook.moon.illumination.toFixed(0)}% illuminated
            </div>
          </div>
        </div>

        {/* Retrogrades */}
        <div className="card card-hover fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-center">
            <div className="text-4xl mb-2">↩️</div>
            <div className="text-lg font-semibold text-white">
              {outlook.retrogrades.length === 0 ? 'No Retrogrades' : 'Retrogrades'}
            </div>
            {outlook.retrogrades.length > 0 ? (
              <div className="space-y-1 mt-2">
                {outlook.retrogrades.map((r) => (
                  <div key={r.planet} className="text-sm text-yellow-400">
                    {r.planet} ℞ in {r.sign}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-green-400 text-sm mt-2">All clear!</div>
            )}
          </div>
        </div>

        {/* Key Aspects */}
        <div className="card card-hover fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="text-center">
            <div className="text-4xl mb-2">⚛️</div>
            <div className="text-lg font-semibold text-white">Key Aspects</div>
            <div className="space-y-1 mt-2">
              {outlook.key_aspects.slice(0, 3).map((a, i) => (
                <div
                  key={i}
                  className={clsx(
                    'text-xs',
                    a.nature === 'harmonious' && 'text-green-400',
                    a.nature === 'challenging' && 'text-red-400',
                    a.nature === 'neutral' && 'text-gray-400'
                  )}
                >
                  {a.aspect} {a.type}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* DO */}
        <div className="card card-hover fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="card-header">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">Recommended Actions</span>
          </div>
          <ul className="space-y-3">
            {outlook.recommendations.do.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* AVOID */}
        <div className="card card-hover fade-in" style={{ animationDelay: '0.35s' }}>
          <div className="card-header">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">What to Avoid</span>
          </div>
          <ul className="space-y-3">
            {outlook.recommendations.avoid.length > 0 ? (
              outlook.recommendations.avoid.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-sm">No specific warnings today</li>
            )}
          </ul>
        </div>

        {/* WATCH */}
        <div className="card card-hover fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="card-header">
            <Eye className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400">Watch List</span>
          </div>
          <ul className="space-y-3">
            {outlook.recommendations.watch.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-yellow-400 mt-0.5">👁</span>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Market Specific */}
      <div className="card fade-in" style={{ animationDelay: '0.45s' }}>
        <div className="card-header">
          <Zap className="w-5 h-5 text-cosmic-400" />
          Market-Specific Outlook
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(outlook.recommendations.market_specific).map(([market, data]) => {
            const Icon = data.sentiment === 'bullish' ? TrendingUp :
                        data.sentiment === 'bearish' ? TrendingDown : Minus
            return (
              <div
                key={market}
                className={clsx(
                  'p-4 rounded-lg border',
                  data.sentiment === 'bullish' && 'bg-green-500/10 border-green-500/30',
                  data.sentiment === 'bearish' && 'bg-red-500/10 border-red-500/30',
                  data.sentiment === 'neutral' && 'bg-gray-500/10 border-gray-500/30'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white capitalize">{market}</span>
                  <Icon className={clsx(
                    'w-5 h-5',
                    data.sentiment === 'bullish' && 'text-green-400',
                    data.sentiment === 'bearish' && 'text-red-400',
                    data.sentiment === 'neutral' && 'text-gray-400'
                  )} />
                </div>
                <p className="text-sm text-gray-400">{data.advice}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sentiment Factors */}
      <div className="card mt-6 fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="card-header">
          <span className="text-xl">📊</span>
          Sentiment Factors
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {outlook.sentiment.factors.map((factor, i) => (
            <div
              key={i}
              className={clsx(
                'p-3 rounded-lg border-l-4',
                factor.impact === 'positive' && 'bg-green-500/10 border-green-500',
                factor.impact === 'negative' && 'bg-red-500/10 border-red-500',
                factor.impact === 'volatile' && 'bg-yellow-500/10 border-yellow-500',
                factor.impact === 'neutral' && 'bg-gray-500/10 border-gray-500'
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-white text-sm">{factor.factor}</span>
                <span className={clsx(
                  'text-xs font-mono',
                  factor.points > 0 && 'text-green-400',
                  factor.points < 0 && 'text-red-400',
                  factor.points === 0 && 'text-gray-400'
                )}>
                  {factor.points > 0 ? '+' : ''}{factor.points}
                </span>
              </div>
              <p className="text-xs text-gray-500">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Update Info */}
      <div className="mt-6 p-4 bg-cosmic-500/10 border border-cosmic-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-4 h-4 text-cosmic-400" />
          <span className="font-medium text-cosmic-400">Update Information</span>
        </div>
        <p className="text-sm text-gray-400">
          <strong>Frequency:</strong> {outlook.update_info.frequency}<br />
          <strong>Note:</strong> {outlook.update_info.note}<br />
          <strong>Auto-refresh:</strong> {outlook.update_info.auto_refresh}
        </p>
      </div>
    </div>
  )
}
