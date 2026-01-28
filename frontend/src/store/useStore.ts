import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AstrologySystem, MarketType, PlanetPosition, TradingSignal, MoonPhase } from '../types'

interface AppStore {
  // Settings
  system: AstrologySystem
  setSystem: (system: AstrologySystem) => void
  selectedMarket: MarketType | 'all'
  setSelectedMarket: (market: MarketType | 'all') => void

  // Data
  planetPositions: PlanetPosition[]
  setPlanetPositions: (positions: PlanetPosition[]) => void
  activeSignals: TradingSignal[]
  setActiveSignals: (signals: TradingSignal[]) => void
  moonPhase: MoonPhase | null
  setMoonPhase: (phase: MoonPhase) => void

  // UI State
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void

  // Refresh
  lastRefresh: Date | null
  setLastRefresh: (date: Date) => void
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      // Settings
      system: 'western',
      setSystem: (system) => set({ system }),
      selectedMarket: 'all',
      setSelectedMarket: (selectedMarket) => set({ selectedMarket }),

      // Data
      planetPositions: [],
      setPlanetPositions: (planetPositions) => set({ planetPositions }),
      activeSignals: [],
      setActiveSignals: (activeSignals) => set({ activeSignals }),
      moonPhase: null,
      setMoonPhase: (moonPhase) => set({ moonPhase }),

      // UI State
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      error: null,
      setError: (error) => set({ error }),

      // Refresh
      lastRefresh: null,
      setLastRefresh: (lastRefresh) => set({ lastRefresh }),
    }),
    {
      name: 'astrotrader-storage',
      partialize: (state) => ({
        system: state.system,
        selectedMarket: state.selectedMarket,
      }),
    }
  )
)
