'use client'

import { useState, useEffect } from 'react'

function getNYMarketState(): { isOpen: boolean; label: string; nextEvent: string } {
  const now = new Date()
  const ny = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = ny.getDay()
  const h = ny.getHours()
  const m = ny.getMinutes()
  const totalMin = h * 60 + m
  const openMin  = 9 * 60 + 30
  const closeMin = 16 * 60
  const isWeekday = day >= 1 && day <= 5
  const isOpen = isWeekday && totalMin >= openMin && totalMin < closeMin

  let nextEvent = ''
  if (isOpen) {
    const minsLeft = closeMin - totalMin
    nextEvent = `closes ${minsLeft >= 60 ? `${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m` : `${minsLeft}m`}`
  } else if (isWeekday && totalMin < openMin) {
    const minsLeft = openMin - totalMin
    nextEvent = `opens ${minsLeft >= 60 ? `${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m` : `${minsLeft}m`}`
  } else {
    const daysUntilMon = day === 6 ? 2 : day === 0 ? 1 : 1
    nextEvent = `opens ${daysUntilMon === 1 ? 'tomorrow' : 'Mon'} 09:30`
  }

  return { isOpen, label: isOpen ? 'NYSE OPEN' : 'NYSE CLOSED', nextEvent }
}

export default function MarketStatus() {
  const [state, setState] = useState(getNYMarketState())

  useEffect(() => {
    const id = setInterval(() => setState(getNYMarketState()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2" title={state.nextEvent}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
        background: state.isOpen ? 'var(--up)' : 'var(--text-3)',
        boxShadow: state.isOpen ? '0 0 5px rgba(34,197,94,0.5)' : 'none',
      }} />
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
        color: state.isOpen ? 'var(--up)' : 'var(--text-3)',
        fontFamily: 'var(--font-mono, monospace)',
      }}>
        {state.label}
      </span>
      <span style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.04em' }} className="hidden sm:inline">
        · {state.nextEvent}
      </span>
    </div>
  )
}
