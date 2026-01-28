import type { PlanetPosition, AstrologySystem } from '../../types'

interface Props {
  positions: PlanetPosition[]
  system: AstrologySystem
}

const zodiacSigns = [
  { symbol: '♈', name: 'Aries', color: '#ef4444' },
  { symbol: '♉', name: 'Taurus', color: '#84cc16' },
  { symbol: '♊', name: 'Gemini', color: '#06b6d4' },
  { symbol: '♋', name: 'Cancer', color: '#3b82f6' },
  { symbol: '♌', name: 'Leo', color: '#ef4444' },
  { symbol: '♍', name: 'Virgo', color: '#84cc16' },
  { symbol: '♎', name: 'Libra', color: '#06b6d4' },
  { symbol: '♏', name: 'Scorpio', color: '#3b82f6' },
  { symbol: '♐', name: 'Sagittarius', color: '#ef4444' },
  { symbol: '♑', name: 'Capricorn', color: '#84cc16' },
  { symbol: '♒', name: 'Aquarius', color: '#06b6d4' },
  { symbol: '♓', name: 'Pisces', color: '#3b82f6' },
]

const planetColors: Record<string, string> = {
  sun: '#fbbf24',
  moon: '#e5e7eb',
  mercury: '#a78bfa',
  venus: '#f472b6',
  mars: '#ef4444',
  jupiter: '#f97316',
  saturn: '#eab308',
  uranus: '#06b6d4',
  neptune: '#3b82f6',
  pluto: '#8b5cf6',
  north_node: '#9ca3af',
  south_node: '#6b7280',
}

export default function ZodiacWheel({ positions }: Props) {
  const size = 400
  const center = size / 2
  const outerRadius = size / 2 - 20
  const innerRadius = outerRadius - 50
  const planetRadius = innerRadius - 30

  const degToRad = (deg: number) => (deg - 90) * (Math.PI / 180)

  const getPosition = (longitude: number, radius: number) => {
    const angle = degToRad(longitude)
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="max-w-full h-auto"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />

      {/* Inner circle */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius}
        fill="none"
        stroke="#374151"
        strokeWidth="1"
      />

      {/* Zodiac sign divisions */}
      {zodiacSigns.map((sign, index) => {
        const startAngle = index * 30
        const midAngle = startAngle + 15
        const labelPos = getPosition(midAngle, outerRadius - 25)

        // Division line
        const lineStart = getPosition(startAngle, innerRadius)
        const lineEnd = getPosition(startAngle, outerRadius)

        return (
          <g key={sign.name}>
            {/* Division line */}
            <line
              x1={lineStart.x}
              y1={lineStart.y}
              x2={lineEnd.x}
              y2={lineEnd.y}
              stroke="#374151"
              strokeWidth="1"
            />

            {/* Sign symbol */}
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={sign.color}
              fontSize="18"
              fontFamily="serif"
            >
              {sign.symbol}
            </text>
          </g>
        )
      })}

      {/* Degree markers (every 10 degrees) */}
      {[...Array(36)].map((_, i) => {
        const angle = i * 10
        const start = getPosition(angle, innerRadius)
        const end = getPosition(angle, innerRadius + (i % 3 === 0 ? 10 : 5))

        return (
          <line
            key={`marker-${i}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="#4b5563"
            strokeWidth="1"
          />
        )
      })}

      {/* Planet positions */}
      {positions.map((planet) => {
        const pos = getPosition(planet.longitude, planetRadius)
        const color = planetColors[planet.planet] || '#ffffff'

        return (
          <g key={planet.planet} filter="url(#glow)">
            {/* Planet circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r="12"
              fill="#1f2937"
              stroke={color}
              strokeWidth="2"
            />

            {/* Planet symbol */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={color}
              fontSize="14"
            >
              {planet.symbol}
            </text>

            {/* Retrograde indicator */}
            {planet.retrograde && (
              <text
                x={pos.x + 15}
                y={pos.y - 10}
                fill="#ef4444"
                fontSize="10"
                fontWeight="bold"
              >
                ℞
              </text>
            )}
          </g>
        )
      })}

      {/* Center decoration */}
      <circle
        cx={center}
        cy={center}
        r="15"
        fill="#7c3aed"
        opacity="0.3"
      />
      <circle
        cx={center}
        cy={center}
        r="8"
        fill="#7c3aed"
      />
    </svg>
  )
}
