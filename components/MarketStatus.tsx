'use client'

import { useState, useEffect } from 'react'

function getNYMarketState(): { isOpen: boolean; label: string; nextEvent: string } {
  const now = new Date()
  const ny = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = ny.getDay()       // 0=Sun 6=Sat
  const h = ny.getHours()
  const m = ny.getMinutes()
  const totalMin = h * 60 + m

  const openMin  = 9 * 60 + 30   // 9:30 AM
  const closeMin = 16 * 60        // 4:00 PM
  const isWeekday = day >= 1 && day <= 5
  const isOpen = isWeekday && totalMin >= openMin && totalMin < closeMin

  let nextEvent = ''
  if (isOpen) {
    const minsLeft = closeMin - totalMin
    nextEvent = `Closes in ${minsLeft >= 60 ? `${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m` : `${minsLeft}m`}`
  } else if (isWeekday && totalMin < openMin) {
    const minsLeft = openMin - totalMin
    nextEvent = `Opens in ${minsLeft >= 60 ? `${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m` : `${minsLeft}m`}`
  } else {
    // Weekend or after hours — find next Monday (or next day if Friday after close)
    const daysUntilMon = day === 6 ? 2 : day === 0 ? 1 : 1
    nextEvent = `Opens ${daysUntilMon === 1 ? 'tomorrow' : 'Monday'} 9:30 AM ET`
  }

  return { isOpen, label: isOpen ? 'Open' : 'Closed', nextEvent }
}

export default function MarketStatus() {
  const [state, setState] = useState(getNYMarketState())

  // Update every minute
  useEffect(() => {
    const id = setInterval(() => setState(getNYMarketState()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2" title={`NYSE · ${state.nextEvent}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: state.isOpen ? '#34d399' : '#555',
          display: 'inline-block',
          flexShrink: 0,
          boxShadow: state.isOpen ? '0 0 6px #34d39966' : 'none',
        }}
      />
      <span style={{ fontSize: 12, color: state.isOpen ? '#34d399' : '#555', fontWeight: 500 }}>
        {state.label}
      </span>
      <span style={{ fontSize: 11, color: '#333' }} className="hidden sm:inline">
        · {state.nextEvent}
      </span>
    </div>
  )
}
