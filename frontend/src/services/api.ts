import axios from 'axios'
import type {
  AstrologySystem,
  PlanetPosition,
  Aspect,
  MoonPhase,
  TradingSignal,
  RetrogradeAlert,
  PriceData,
  MarketType,
} from '../types'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

// Planets API
export const planetsApi = {
  getPositions: async (system: AstrologySystem): Promise<PlanetPosition[]> => {
    const { data } = await api.get('/planets/positions', { params: { system } })
    return data.positions
  },

  getAspects: async (system: AstrologySystem, minStrength = 3): Promise<Aspect[]> => {
    const { data } = await api.get('/planets/aspects', {
      params: { system, min_strength: minStrength },
    })
    return data.aspects
  },

  getRetrogrades: async (system: AstrologySystem): Promise<RetrogradeAlert[]> => {
    const { data } = await api.get('/planets/retrogrades', { params: { system } })
    return data.retrogrades
  },

  getChart: async (system: AstrologySystem) => {
    const { data } = await api.get('/planets/chart', {
      params: { system, include_aspects: true },
    })
    return data
  },
}

// Moon API
export const moonApi = {
  getPhase: async (): Promise<MoonPhase> => {
    const { data } = await api.get('/moon/phase')
    return data
  },

  getPosition: async (system: AstrologySystem) => {
    const { data } = await api.get('/moon/position', { params: { system } })
    return data
  },

  getCalendar: async (days = 30) => {
    const { data } = await api.get('/moon/calendar', { params: { days } })
    return data.events
  },

  getTithi: async () => {
    const { data } = await api.get('/moon/tithi')
    return data
  },
}

// Signals API
export const signalsApi = {
  getActive: async (
    system: AstrologySystem,
    market?: MarketType,
    minStrength = 'moderate'
  ): Promise<TradingSignal[]> => {
    const { data } = await api.get('/signals/active', {
      params: { system, market, min_strength: minStrength },
    })
    return data.signals
  },

  getUpcoming: async (system: AstrologySystem, days = 7) => {
    const { data } = await api.get('/signals/upcoming', {
      params: { system, days },
    })
    return data.signals
  },

  getRetrogradeAlerts: async (system: AstrologySystem): Promise<RetrogradeAlert[]> => {
    const { data } = await api.get('/signals/retrograde-alerts', {
      params: { system },
    })
    return data.alerts
  },

  getLunarSignals: async () => {
    const { data } = await api.get('/signals/lunar-signals')
    return data.signals
  },
}

// Market API
export const marketApi = {
  getPrice: async (symbol: string, market: MarketType): Promise<PriceData> => {
    const { data } = await api.get(`/market/${symbol}/price`, {
      params: { market },
    })
    return data
  },

  getHistory: async (symbol: string, market: MarketType, days = 30) => {
    const { data } = await api.get(`/market/${symbol}/history`, {
      params: { market, days },
    })
    return data.data
  },

  getAssets: async (market: MarketType) => {
    const { data } = await api.get(`/market/assets/${market}`)
    return data.assets
  },

  getTrending: async (market?: MarketType) => {
    const { data } = await api.get('/market/trending', { params: { market } })
    return data.trending
  },

  getNatalChart: async (symbol: string, market: MarketType) => {
    const { data } = await api.get(`/market/${symbol}/natal-chart`, {
      params: { market },
    })
    return data
  },
}

// System API
export const systemApi = {
  getInfo: async () => {
    const { data } = await api.get('/system/info')
    return data
  },

  getPlanetsInfo: async () => {
    const { data } = await api.get('/system/planets')
    return data.planets
  },

  getZodiacInfo: async (system: AstrologySystem) => {
    const { data } = await api.get('/system/zodiac', { params: { system } })
    return data.zodiac
  },

  getAspectsInfo: async () => {
    const { data } = await api.get('/system/aspects')
    return data.aspects
  },

  getNakshatras: async () => {
    const { data } = await api.get('/system/nakshatras')
    return data.nakshatras
  },
}

export default api
