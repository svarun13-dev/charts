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
      },
      rightPriceScale: {
        borderColor: '#1C1C1E',
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
      },
      rightPriceScale: {
        borderColor: '#1C1C1E',
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
          setCurrentPrice(data[data.length - 1].close);
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
    candlestickSeriesRef.current.setData(candleData);

    // Update volume data
    const volumeData: HistogramData[] = candles.map((c, i) => ({
      time: c.time as Time,
      value: c.volume,
      color: i === 0 ? '#34C759' : c.close >= candles[i - 1].close ? '#34C759' : '#FF3B30',
    }));
    volumeSeriesRef.current.setData(volumeData);

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

  return (
    <div className="trading-chart-container">
      <div className="controls">
        <div className="coin-selector-simple">
          {COINS.map((coin) => (
            <button
              key={coin.id}
              className={`coin-btn ${coinId === coin.id ? 'active' : ''}`}
              onClick={() => handleCoinChange(coin)}
            >
              {coin.symbol}
            </button>
          ))}
        </div>

        <div className="timeframe-selector">
          {(['1m', '5m', '15m', '1h', '4h', '1d'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="price-display">
          {currentPrice > 0 && (
            <span className="price">${currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</span>
          )}
        </div>
      </div>

      {loading && <div className="loading">Loading...</div>}

      <div className="charts-layout">
        <div className="main-charts">
          <div ref={chartContainerRef} className="chart-container" />
          <div ref={volumeChartContainerRef} className="volume-chart-container" />
        </div>
        <div ref={volumeProfileContainerRef} className="volume-profile-container" />
      </div>
    </div>
  );
};
