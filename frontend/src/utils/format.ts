import { format, formatDistanceToNow } from 'date-fns'

export function formatDegree(degree: number): string {
  const d = Math.floor(degree)
  const m = Math.floor((degree - d) * 60)
  const s = Math.floor(((degree - d) * 60 - m) * 60)
  return `${d}° ${m}' ${s}"`
}

export function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }
  if (price >= 1) {
    return `$${price.toFixed(2)}`
  }
  return `$${price.toFixed(6)}`
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getZodiacElement(sign: string): 'fire' | 'earth' | 'air' | 'water' {
  const fireSign = ['Aries', 'Leo', 'Sagittarius', 'Mesha', 'Simha', 'Dhanu']
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn', 'Vrishabha', 'Kanya', 'Makara']
  const airSigns = ['Gemini', 'Libra', 'Aquarius', 'Mithuna', 'Tula', 'Kumbha']

  if (fireSign.includes(sign)) return 'fire'
  if (earthSigns.includes(sign)) return 'earth'
  if (airSigns.includes(sign)) return 'air'
  return 'water'
}

export function getSignColor(sign: string): string {
  const element = getZodiacElement(sign)
  const colors = {
    fire: '#ef4444',
    earth: '#84cc16',
    air: '#06b6d4',
    water: '#3b82f6',
  }
  return colors[element]
}
