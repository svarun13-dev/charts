# AstroTrader - Zodiac & Planetary Position Trading Platform

A comprehensive trading signal platform that combines Western and Vedic astrology with market analysis for crypto, stocks, and commodities.

## Features

- **Dual Astrology Systems**: Switch between Western (Tropical) and Vedic (Sidereal) calculations
- **Real-time Planetary Positions**: Track all planets, aspects, and transits
- **Multi-Market Support**: Crypto, Stocks, and Commodities
- **Signal Generation**: Automated trading signals based on planetary configurations
- **Interactive Dashboard**: Visualize planetary positions alongside price charts
- **Retrograde Alerts**: Mercury, Venus, Mars retrograde warnings
- **Lunar Cycle Tracking**: New moon/full moon trading indicators
- **Aspect Analysis**: Conjunctions, squares, trines, oppositions, and sextiles

## Tech Stack

### Backend
- Python 3.11+
- FastAPI
- Swiss Ephemeris (via pyswisseph)
- SQLAlchemy + SQLite/PostgreSQL
- Pydantic for validation

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- Recharts for visualizations
- Zustand for state management

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/routes/       # API endpoints
│   │   ├── core/             # Config, constants
│   │   ├── services/
│   │   │   ├── astrology/    # Planetary calculations
│   │   │   ├── market/       # Market data fetching
│   │   │   └── signals/      # Signal generation
│   │   ├── models/           # Database models
│   │   └── utils/            # Helpers
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API clients
│   │   ├── store/            # Zustand stores
│   │   └── types/            # TypeScript types
│   └── public/
└── docker-compose.yml
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Astrology
- `GET /api/v1/planets/positions` - Current planetary positions
- `GET /api/v1/planets/aspects` - Active aspects
- `GET /api/v1/planets/retrogrades` - Retrograde status
- `GET /api/v1/moon/phase` - Current moon phase

### Signals
- `GET /api/v1/signals/active` - Active trading signals
- `GET /api/v1/signals/history` - Historical signals
- `POST /api/v1/signals/configure` - Configure signal rules

### Market
- `GET /api/v1/market/{symbol}/price` - Current price
- `GET /api/v1/market/{symbol}/history` - Historical data

## Astrological Concepts

### Western (Tropical) Astrology
- Based on the seasons and the vernal equinox
- Uses the tropical zodiac
- Popular in Western countries

### Vedic (Sidereal) Astrology
- Based on fixed star positions
- Uses the sidereal zodiac (~23° offset from tropical)
- Traditional Indian system (Jyotish)

### Key Aspects Tracked
- **Conjunction (0°)**: Planets aligned - intensification
- **Sextile (60°)**: Harmonious opportunity
- **Square (90°)**: Tension and challenge
- **Trine (120°)**: Flowing harmony
- **Opposition (180°)**: Polarity and awareness

## License

MIT License
