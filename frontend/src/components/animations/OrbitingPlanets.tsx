interface OrbitingPlanetsProps {
  size?: number
}

const planets = [
  { symbol: '☉', color: '#fbbf24', orbit: 30, speed: 30, size: 20 },
  { symbol: '☿', color: '#a78bfa', orbit: 45, speed: 12, size: 12 },
  { symbol: '♀', color: '#f472b6', orbit: 60, speed: 18, size: 14 },
  { symbol: '♂', color: '#ef4444', orbit: 75, speed: 24, size: 13 },
  { symbol: '♃', color: '#f97316', orbit: 95, speed: 60, size: 18 },
  { symbol: '♄', color: '#eab308', orbit: 115, speed: 90, size: 16 },
]

export default function OrbitingPlanets({ size = 250 }: OrbitingPlanetsProps) {
  const center = size / 2

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Orbit rings */}
      {planets.map((planet, i) => (
        <div
          key={`orbit-${i}`}
          className="absolute rounded-full border border-gray-800/30"
          style={{
            width: planet.orbit * 2,
            height: planet.orbit * 2,
            left: center - planet.orbit,
            top: center - planet.orbit,
          }}
        />
      ))}

      {/* Center glow */}
      <div
        className="absolute rounded-full bg-gradient-to-br from-cosmic-500/20 to-cosmic-700/20"
        style={{
          width: 20,
          height: 20,
          left: center - 10,
          top: center - 10,
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
        }}
      />

      {/* Planets */}
      {planets.map((planet, i) => (
        <div
          key={`planet-${i}`}
          className="absolute"
          style={{
            width: planet.orbit * 2,
            height: planet.orbit * 2,
            left: center - planet.orbit,
            top: center - planet.orbit,
            animation: `spin ${planet.speed}s linear infinite`,
          }}
        >
          <span
            className="absolute"
            style={{
              fontSize: planet.size,
              color: planet.color,
              textShadow: `0 0 10px ${planet.color}`,
              left: '50%',
              top: 0,
              transform: 'translateX(-50%)',
              animation: `spin ${planet.speed}s linear infinite reverse`,
            }}
          >
            {planet.symbol}
          </span>
        </div>
      ))}
    </div>
  )
}
