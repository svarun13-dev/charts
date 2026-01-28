import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Settings,
  Moon,
  Sun,
  Sparkles,
  BookOpen,
  Compass,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'
import StarField from './animations/StarField'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/insights', icon: Compass, label: 'Insights' },
  { to: '/signals', icon: TrendingUp, label: 'Signals' },
  { to: '/charts', icon: PieChart, label: 'Charts' },
  { to: '/guide', icon: BookOpen, label: 'Guide' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const { system, setSystem } = useStore()

  return (
    <div className="min-h-screen flex cosmic-bg relative">
      {/* Animated Star Background */}
      <StarField />

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/70 backdrop-blur-sm border-r border-gray-800 flex flex-col relative z-10">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cosmic-500 to-cosmic-700 flex items-center justify-center relative overflow-hidden group">
              <Sparkles className="w-6 h-6 text-white relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-br from-cosmic-400 to-cosmic-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 spin-slow opacity-30">
                <span className="absolute text-[8px] text-white/50" style={{ top: 2, left: '50%', transform: 'translateX(-50%)' }}>☉</span>
                <span className="absolute text-[8px] text-white/50" style={{ bottom: 2, left: '50%', transform: 'translateX(-50%)' }}>☽</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AstroTrader</h1>
              <p className="text-xs text-gray-500">Planetary Trading</p>
            </div>
          </div>
        </div>

        {/* System Toggle */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setSystem('western')}
              className={clsx(
                'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                system === 'western'
                  ? 'bg-cosmic-600 text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <Sun className="w-4 h-4 inline mr-1" />
              Western
            </button>
            <button
              onClick={() => setSystem('vedic')}
              className={clsx(
                'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                system === 'vedic'
                  ? 'bg-cosmic-600 text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <Moon className="w-4 h-4 inline mr-1" />
              Vedic
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-cosmic-600/20 text-cosmic-400'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 text-center">
            <p>System: {system === 'western' ? 'Tropical' : 'Sidereal'}</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
