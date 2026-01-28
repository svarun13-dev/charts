import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

interface Section {
  title: string
  icon: string
  items: { term: string; meaning: string; trading?: string }[]
}

const glossaryData: Section[] = [
  {
    title: 'Planetary Aspects',
    icon: '⚛️',
    items: [
      {
        term: 'Conjunction (☌) 0°',
        meaning: 'Planets merge energies - intensification',
        trading: 'Strong momentum, direction depends on planets involved',
      },
      {
        term: 'Opposition (☍) 180°',
        meaning: 'Tension between opposing forces',
        trading: 'Potential reversal points, watch for exhaustion',
      },
      {
        term: 'Square (□) 90°',
        meaning: 'Friction and challenge',
        trading: 'Generally bearish, obstacles and resistance',
      },
      {
        term: 'Trine (△) 120°',
        meaning: 'Harmonious flow, ease',
        trading: 'Bullish, smooth movement, support holds',
      },
      {
        term: 'Sextile (⚹) 60°',
        meaning: 'Opportunity requiring action',
        trading: 'Mildly bullish, good entry points',
      },
    ],
  },
  {
    title: 'Planets & Markets',
    icon: '🪐',
    items: [
      {
        term: 'Sun (☉)',
        meaning: 'Core identity, leadership, vitality',
        trading: 'Major indices, leadership stocks',
      },
      {
        term: 'Moon (☽)',
        meaning: 'Emotions, public mood, fluctuations',
        trading: 'Short-term moves, crypto sentiment',
      },
      {
        term: 'Mercury (☿)',
        meaning: 'Communication, tech, transactions',
        trading: 'Tech stocks, crypto, AVOID in retrograde',
      },
      {
        term: 'Venus (♀)',
        meaning: 'Value, luxury, finances',
        trading: 'Consumer goods, luxury brands',
      },
      {
        term: 'Mars (♂)',
        meaning: 'Energy, aggression, action',
        trading: 'Volatility, commodities, aggressive moves',
      },
      {
        term: 'Jupiter (♃)',
        meaning: 'Expansion, growth, optimism',
        trading: 'Bull markets, growth stocks, expansion',
      },
      {
        term: 'Saturn (♄)',
        meaning: 'Restriction, discipline, reality',
        trading: 'Bear markets, consolidation, value',
      },
      {
        term: 'Uranus (♅)',
        meaning: 'Sudden change, innovation, disruption',
        trading: 'Crypto, tech disruption, unexpected moves',
      },
    ],
  },
  {
    title: 'Retrogrades',
    icon: '↩️',
    items: [
      {
        term: 'Mercury Retrograde',
        meaning: 'Communication breakdowns, tech glitches (~3 weeks, 3-4x/year)',
        trading: '⚠️ HIGH ALERT: Avoid major positions, expect volatility',
      },
      {
        term: 'Venus Retrograde',
        meaning: 'Value reassessment (~6 weeks every 18 months)',
        trading: 'Review financials, find undervalued assets',
      },
      {
        term: 'Mars Retrograde',
        meaning: 'Frustrated action (~10 weeks every 2 years)',
        trading: 'Reduce aggressive positions, plan strategically',
      },
    ],
  },
  {
    title: 'Moon Phases',
    icon: '🌙',
    items: [
      {
        term: 'New Moon 🌑',
        meaning: 'New beginnings, planting seeds',
        trading: 'Watch for trend changes, new cycles starting',
      },
      {
        term: 'First Quarter 🌓',
        meaning: 'Action point, decisions',
        trading: 'Breakout potential, momentum building',
      },
      {
        term: 'Full Moon 🌕',
        meaning: 'Peak energy, culmination',
        trading: '⚠️ Potential reversal/exhaustion point',
      },
      {
        term: 'Last Quarter 🌗',
        meaning: 'Release, letting go',
        trading: 'Momentum fading, distribution phase',
      },
    ],
  },
  {
    title: 'Vedic Concepts',
    icon: '🕉️',
    items: [
      {
        term: 'Nakshatra',
        meaning: 'One of 27 lunar mansions (13°20\' each)',
        trading: 'Affects daily mood and short-term sentiment',
      },
      {
        term: 'Tithi',
        meaning: 'Vedic lunar day (30 per lunar month)',
        trading: 'Shukla (waxing) = growth, Krishna (waning) = exits',
      },
      {
        term: 'Rashi',
        meaning: 'Vedic zodiac sign',
        trading: 'Same as Western signs but ~23° offset (sidereal)',
      },
      {
        term: 'Ayanamsa',
        meaning: 'Difference between tropical and sidereal zodiac',
        trading: 'We use Lahiri ayanamsa (~24° currently)',
      },
    ],
  },
  {
    title: 'Signal Strength',
    icon: '📊',
    items: [
      {
        term: 'Weak (1-3)',
        meaning: 'Minor influence',
        trading: 'Use as confirmation only',
      },
      {
        term: 'Moderate (4-6)',
        meaning: 'Notable influence',
        trading: 'Consider in your analysis',
      },
      {
        term: 'Strong (7-8)',
        meaning: 'Significant influence',
        trading: 'Likely to manifest in price',
      },
      {
        term: 'Very Strong (9-10)',
        meaning: 'Major configuration',
        trading: 'High probability event, pay attention',
      },
    ],
  },
]

export default function GlossaryPage() {
  const [openSections, setOpenSections] = useState<string[]>(['Planetary Aspects'])

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Signal Interpretation Guide</h1>
        <p className="text-gray-400 text-sm">
          Learn what each astrological signal means for trading
        </p>
      </div>

      {/* Quick Reference */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="text-xl">⚡</span>
          Quick Reference
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">Bullish Signals</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Jupiter aspects (esp. trines)</li>
              <li>✓ Venus-Jupiter combos</li>
              <li>✓ Waxing moon phase</li>
              <li>✓ Benefics going direct</li>
            </ul>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">Bearish Signals</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✗ Saturn squares/oppositions</li>
              <li>✗ Mars-Saturn combos</li>
              <li>✗ Mercury retro starting</li>
              <li>✗ Multiple retrogrades</li>
            </ul>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-semibold mb-2">Volatile Signals</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>⚡ Uranus aspects</li>
              <li>⚡ Mars oppositions</li>
              <li>⚡ Eclipse periods</li>
              <li>⚡ Multiple exact aspects</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Glossary Sections */}
      <div className="space-y-3">
        {glossaryData.map((section) => {
          const isOpen = openSections.includes(section.title)
          return (
            <div key={section.title} className="card">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <h3 className="font-semibold text-white">{section.title}</h3>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800/50 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-cosmic-400 mb-1">
                        {item.term}
                      </h4>
                      <p className="text-gray-300 text-sm mb-2">{item.meaning}</p>
                      {item.trading && (
                        <p className="text-sm">
                          <span className="text-gray-500">Trading: </span>
                          <span className="text-gray-400">{item.trading}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-yellow-400 text-sm font-medium mb-1">⚠️ Disclaimer</p>
        <p className="text-gray-400 text-sm">
          Astrological signals should be used as one factor among many in your trading analysis.
          Never trade based solely on planetary positions. Always use proper risk management
          and do your own research.
        </p>
      </div>
    </div>
  )
}
