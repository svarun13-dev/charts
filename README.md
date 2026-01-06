# Technical Analysis Charting Tool

A professional-grade technical analysis charting application built with React and TradingView's Lightweight Charts library. This tool provides real-time cryptocurrency price data with advanced technical indicators and automated pattern detection.

## Features

### Core Features
- **Interactive Candlestick Charts**: Fully interactive charts with zoom and pan capabilities
- **Multiple Timeframes**: Support for 1m, 5m, 15m, 1h, 4h, and 1d intervals
- **Real-time Data**: Live price updates via Binance WebSocket
- **Volume Analysis**: Volume chart with color-coded bars and volume profile sidebar

### Technical Indicators
- **Moving Averages**: 20/50/200 EMA with toggle controls
- **Bollinger Bands**: 20-period BB with 2 standard deviations
- **Auto Fibonacci Retracements**: Automatically drawn between swing highs and lows (0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%)
- **Support/Resistance Levels**: Automatically detected from price action

### Technical Analysis Tools
- **Swing High/Low Detection**: Algorithmic detection of pivot points
- **Volume Profile**: Visual representation of volume distribution across price levels
- **Dark Theme**: Professional trading interface with dark color scheme

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Charts**: Lightweight Charts 4.x (TradingView's open-source library)
- **Data Source**: Binance API (REST + WebSocket)
- **HTTP Client**: Axios

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── TradingChart.tsx    # Main chart component
│   │   └── TradingChart.css    # Chart styling
│   ├── services/
│   │   └── binanceApi.ts       # Binance API integration
│   ├── utils/
│   │   └── indicators.ts       # Technical indicator calculations
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Entry point
├── package.json
└── vite.config.ts
```

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd charts
   ```

2. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173`

## Usage

### Changing Timeframes
Click on any timeframe button (1m, 5m, 15m, 1h, 4h, 1d) in the top control panel to switch chart intervals.

### Toggling Indicators
Use the checkboxes in the control panel to show/hide:
- EMA 20 (Blue line)
- EMA 50 (Orange line)
- EMA 200 (Pink line)
- Bollinger Bands (Purple lines)
- Fibonacci Retracements (Rainbow-colored horizontal lines)
- Support/Resistance Levels (Orange dashed lines)

### Chart Interaction
- **Zoom**: Scroll up/down or pinch on mobile
- **Pan**: Click and drag on the chart
- **Crosshair**: Hover over the chart to see price and time details
- **Volume Profile**: View on the right sidebar showing volume distribution

## Technical Details

### Indicators Implementation

#### Exponential Moving Average (EMA)
```typescript
EMA = (Close - Previous EMA) × Multiplier + Previous EMA
Multiplier = 2 / (Period + 1)
```

#### Bollinger Bands
```typescript
Middle Band = 20-period SMA
Upper Band = Middle Band + (2 × Standard Deviation)
Lower Band = Middle Band - (2 × Standard Deviation)
```

#### Fibonacci Levels
Automatically calculated between most recent swing high and swing low:
- 0% (High)
- 23.6% Retracement
- 38.2% Retracement
- 50% Retracement
- 61.8% Retracement (Golden Ratio)
- 78.6% Retracement
- 100% (Low)

#### Support/Resistance Detection
- Detects price levels with multiple touches
- Tolerance: 0.2% price range
- Minimum 2 touches required
- Shows top 5 strongest levels

### Data Sources

#### REST API
Fetches historical candlestick data from Binance:
```
GET https://api.binance.com/api/v3/klines
```

#### WebSocket
Real-time price updates:
```
wss://stream.binance.com:9443/ws/{symbol}@kline_{interval}
```

## Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## Configuration

### Changing Symbol
Edit `src/App.tsx`:
```typescript
<TradingChart symbol="ETHUSDT" initialTimeframe="1h" />
```

### Adjusting Indicator Parameters
Edit `src/utils/indicators.ts` to modify:
- EMA periods
- Bollinger Band periods and standard deviations
- Swing detection sensitivity
- Support/Resistance tolerance
- Fibonacci levels

## Performance Optimization

- Efficient candle updates using WebSocket
- Debounced indicator recalculation
- Optimized chart rendering with Lightweight Charts
- Minimal re-renders using React hooks

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Chart not loading
- Check browser console for errors
- Verify Binance API is accessible
- Ensure WebSocket connections are not blocked by firewall

### Indicators not showing
- Make sure you have enough historical data (EMAs require minimum periods)
- Toggle indicators on using checkboxes
- Check if data is loading from Binance

## Future Enhancements

Potential features to add:
- VWAP (Volume Weighted Average Price)
- Ichimoku Clouds
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Drawing tools (trendlines, horizontal lines)
- Multiple symbol comparison
- Alert system
- Save/load chart layouts
- Export chart as image

## License

This project is licensed under the Apache 2.0 License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) by TradingView
- [Binance API](https://binance-docs.github.io/apidocs/) for market data
- Technical analysis concepts from traditional trading theory
