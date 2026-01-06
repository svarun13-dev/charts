import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData, Time } from 'lightweight-charts';
import type { Candle, Timeframe } from '../types';
import {
  fetchHistoricalDataWithVolume,
  CoinGeckoPricePoller,
} from '../services/coinGeckoApi';
import {
  detectSwingPoints,
  calculateFibonacciLevels,
  getLatestFibonacci,
  calculateVolumeProfile,
} from '../utils/indicators';
import './TradingChart.css';

// Predefined coins: BTC, ETH, SOL
const COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
];

interface Props {
  initialCoinId?: string;
  initialTimeframe?: Timeframe;
}

export const TradingChart = ({ initialCoinId = 'bitcoin', initialTimeframe = '1h' }: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const volumeChartContainerRef = useRef<HTMLDivElement>(null);
  const volumeProfileContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const pollerRef = useRef<CoinGeckoPricePoller | null>(null);

  const [coinId, setCoinId] = useState<string>(initialCoinId);
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const [priceChange, setPriceChange] = useState<number>(0);

  // Initialize charts
  useEffect(() => {
    if (!chartContainerRef.current || !volumeChartContainerRef.current) return;

    // Main chart with Apple-like dark theme
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#000000' },
        textColor: '#8E8E93',
      },
      grid: {
        vertLines: { color: '#1C1C1E', style: 1 },
        horzLines: { color: '#1C1C1E', style: 1 },
      },
      width: chartContainerRef.current.clientWidth,
      height: 600,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#1C1C1E',
        fixLeftEdge: false,
        fixRightEdge: false,
        barSpacing: 12,
        minBarSpacing: 6,
      },
      rightPriceScale: {
        borderColor: '#1C1C1E',
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#48484A',
          width: 1,
          style: 3,
          labelBackgroundColor: '#2C2C2E',
        },
        horzLine: {
          color: '#48484A',
          width: 1,
          style: 3,
          labelBackgroundColor: '#2C2C2E',
        },
      },
    });

    // Volume chart
    const volumeChart = createChart(volumeChartContainerRef.current, {
      layout: {
        background: { color: '#000000' },
        textColor: '#8E8E93',
      },
      grid: {
        vertLines: { color: '#1C1C1E', style: 1 },
        horzLines: { color: '#1C1C1E', style: 1 },
      },
      width: volumeChartContainerRef.current.clientWidth,
      height: 120,
      timeScale: {
        timeVisible: false,
        borderColor: '#1C1C1E',
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      rightPriceScale: {
        borderColor: '#1C1C1E',
        autoScale: true,
      },
    });

    // Sync time scales
    const handleMainTimeScale = (timeRange: any) => {
      if (timeRange) {
        volumeChart.timeScale().setVisibleLogicalRange(timeRange);
      }
    };

    const handleVolumeTimeScale = (timeRange: any) => {
      if (timeRange) {
        chart.timeScale().setVisibleLogicalRange(timeRange);
      }
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleMainTimeScale);
    volumeChart.timeScale().subscribeVisibleLogicalRangeChange(handleVolumeTimeScale);

    // Candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#34C759',
      downColor: '#FF3B30',
      borderVisible: false,
      wickUpColor: '#34C759',
      wickDownColor: '#FF3B30',
    });

    // Volume series
    const volumeSeries = volumeChart.addHistogramSeries({
      color: '#34C759',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    chartRef.current = chart;
    volumeChartRef.current = volumeChart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && volumeChartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        volumeChart.applyOptions({ width: volumeChartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleMainTimeScale);
      volumeChart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVolumeTimeScale);
      chart.remove();
      volumeChart.remove();
    };
  }, []);

  // Fetch data and setup polling
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchHistoricalDataWithVolume(coinId, timeframe);
        setCandles(data);
        if (data.length > 0) {
          const latestPrice = data[data.length - 1].close;
          const firstPrice = data[0].open;
          const change = ((latestPrice - firstPrice) / firstPrice) * 100;
          setCurrentPrice(latestPrice);
          setPriceChange(change);
        }
        setLoading(false);

        // Setup price polling
        if (pollerRef.current) {
          pollerRef.current.stop();
        }

        const poller = new CoinGeckoPricePoller(coinId, 30000);
        poller.start((price) => {
          setCurrentPrice(price);
          setCandles((prevCandles) => {
            if (prevCandles.length === 0) return prevCandles;
            const lastCandle = prevCandles[prevCandles.length - 1];
            const updatedCandle = { ...lastCandle, close: price };
            return [...prevCandles.slice(0, -1), updatedCandle];
          });
        });

        pollerRef.current = poller;
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (pollerRef.current) {
        pollerRef.current.stop();
      }
    };
  }, [coinId, timeframe]);

  // Update chart with data and Fibonacci only
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || !chartRef.current || candles.length === 0)
      return;

    // Update candlestick data
    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    // Debug logging
    console.log(`Loading ${candles.length} candles for ${coinId}`);
    console.log('First candle time:', new Date(candles[0].time * 1000).toISOString());
    console.log('Last candle time:', new Date(candles[candles.length - 1].time * 1000).toISOString());
    console.log('Time range (hours):', (candles[candles.length - 1].time - candles[0].time) / 3600);

    candlestickSeriesRef.current.setData(candleData);

    // Update volume data
    const volumeData: HistogramData[] = candles.map((c, i) => ({
      time: c.time as Time,
      value: c.volume,
      color: i === 0 ? '#34C759' : c.close >= candles[i - 1].close ? '#34C759' : '#FF3B30',
    }));
    volumeSeriesRef.current.setData(volumeData);

    // Auto-fit the content to display all data properly
    // Use a small timeout to ensure data is rendered before fitting
    setTimeout(() => {
      if (chartRef.current && candles.length > 0) {
        // Show all bars to display the complete data range
        chartRef.current.timeScale().setVisibleLogicalRange({
          from: 0,
          to: candles.length - 1,
        });
      }
      if (volumeChartRef.current && candles.length > 0) {
        volumeChartRef.current.timeScale().setVisibleLogicalRange({
          from: 0,
          to: candles.length - 1,
        });
      }
    }, 100);

    // Remove all series except candlestick
    const allSeries = (chartRef.current as any).allSeries?.() || [];
    allSeries.forEach((series: any) => {
      if (series !== candlestickSeriesRef.current) {
        chartRef.current!.removeSeries(series);
      }
    });

    // Add Fibonacci levels
    const swingPoints = detectSwingPoints(candles);
    const fibPoints = getLatestFibonacci(swingPoints);

    if (fibPoints) {
      const fibLevels = calculateFibonacciLevels(fibPoints.high, fibPoints.low);
      const colors = [
        '#FF3B30', // 0% - Red
        '#FF9500', // 23.6% - Orange
        '#FFCC00', // 38.2% - Yellow
        '#34C759', // 50% - Green
        '#00C7BE', // 61.8% - Teal
        '#007AFF', // 78.6% - Blue
        '#AF52DE', // 100% - Purple
      ];

      fibLevels.forEach((level, index) => {
        const fibSeries = chartRef.current!.addLineSeries({
          color: colors[index],
          lineWidth: 2,
          lineStyle: 2,
          title: `Fib ${level.label}`,
          priceLineVisible: true,
          lastValueVisible: true,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        fibSeries.setData([
          { time: candles[0].time as Time, value: level.price },
          { time: candles[candles.length - 1].time as Time, value: level.price },
        ] as LineData[]);
      });
    }
  }, [candles]);

  // Render volume profile
  useEffect(() => {
    if (!volumeProfileContainerRef.current || candles.length === 0) return;

    const volumeProfile = calculateVolumeProfile(candles);
    const maxVolume = Math.max(...volumeProfile.map((v) => v.volume));

    volumeProfileContainerRef.current.innerHTML = '';

    const barHeight = 100 / volumeProfile.length;
    volumeProfile.forEach((profile) => {
      const bar = document.createElement('div');
      bar.className = 'volume-profile-bar';
      const width = (profile.volume / maxVolume) * 100;
      bar.style.width = `${width}%`;
      bar.style.height = `${barHeight}%`;
      bar.title = `${profile.price.toFixed(2)}: ${profile.volume.toFixed(0)}`;
      volumeProfileContainerRef.current!.appendChild(bar);
    });
  }, [candles]);

  const handleCoinChange = (coin: typeof COINS[0]) => {
    setCoinId(coin.id);
  };

  const selectedCoin = COINS.find((c) => c.id === coinId) || COINS[0];

  return (
    <div className="trading-chart-container">
      {/* Header with coin selector */}
      <div className="header">
        <div className="coin-tabs">
          {COINS.map((coin) => (
            <button
              key={coin.id}
              className={`coin-tab ${coinId === coin.id ? 'active' : ''}`}
              onClick={() => handleCoinChange(coin)}
            >
              {coin.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Price display */}
      <div className="price-section">
        <div className="coin-name">{selectedCoin.name}</div>
        {currentPrice > 0 && (
          <>
            <div className="price-main">
              ${currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <div className={`price-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
              {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
            </div>
          </>
        )}
      </div>

      {/* Chart controls */}
      <div className="chart-controls">
        <div className="chart-type-selector">
          <button
            className={`chart-type-btn ${chartType === 'candlestick' ? 'active' : ''}`}
            onClick={() => setChartType('candlestick')}
            title="Candlestick"
          >
            📊
          </button>
          <button
            className={`chart-type-btn ${chartType === 'area' ? 'active' : ''}`}
            onClick={() => setChartType('area')}
            title="Area Chart"
          >
            📈
          </button>
        </div>

        <div className="timeframe-selector">
          {(['1h', '1d', '1w', '1m', '3m', 'all'] as any[]).map((tf) => {
            // Map display labels to actual timeframes
            const timeframeMap: Record<string, Timeframe> = {
              '1h': '1h',
              '1d': '1d',
              '1w': '1d',
              '1m': '1d',
              '3m': '1d',
              'all': '1d',
            };
            const actualTf = timeframeMap[tf];
            return (
              <button
                key={tf}
                className={`timeframe-btn ${timeframe === actualTf && tf === '1h' ? 'active' : ''}`}
                onClick={() => setTimeframe(actualTf)}
              >
                {tf.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {loading && <div className="loading">Loading chart data...</div>}

      {/* Chart */}
      <div className="chart-wrapper">
        <div ref={chartContainerRef} className="chart-container" />
      </div>

      {/* Volume chart */}
      <div className="volume-wrapper">
        <div ref={volumeChartContainerRef} className="volume-chart-container" />
      </div>
    </div>
  );
};
