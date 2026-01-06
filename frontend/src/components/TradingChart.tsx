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
} from '../utils/indicators';
import './TradingChart.css';

interface Props {
  initialTimeframe?: Timeframe;
}

export const TradingChart = ({ initialTimeframe = '1h' }: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const volumeChartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const pollerRef = useRef<CoinGeckoPricePoller | null>(null);

  const coinId = 'bitcoin'; // Bitcoin only
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [showFallingWedge, setShowFallingWedge] = useState(true);
  const [fallingWedgeDetected, setFallingWedgeDetected] = useState(false);

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
      height: 400,
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
      height: 100,
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

  // Detect falling wedge pattern
  const detectFallingWedge = (candles: Candle[]) => {
    if (candles.length < 20) return null;

    // Find higher lows and lower highs
    const lows: { index: number; price: number }[] = [];
    const highs: { index: number; price: number }[] = [];

    for (let i = 5; i < candles.length - 5; i++) {
      // Check if it's a local low
      const isLow = candles.slice(i - 5, i).every(c => c.low >= candles[i].low) &&
                    candles.slice(i + 1, i + 6).every(c => c.low >= candles[i].low);
      if (isLow) {
        lows.push({ index: i, price: candles[i].low });
      }

      // Check if it's a local high
      const isHigh = candles.slice(i - 5, i).every(c => c.high <= candles[i].high) &&
                     candles.slice(i + 1, i + 6).every(c => c.high <= candles[i].high);
      if (isHigh) {
        highs.push({ index: i, price: candles[i].high });
      }
    }

    if (lows.length < 2 || highs.length < 2) return null;

    // Get last 2 lows and highs
    const recentLows = lows.slice(-2);
    const recentHighs = highs.slice(-2);

    // Check for higher lows (support line going up)
    const lowsRising = recentLows[1].price > recentLows[0].price;

    // Check for lower highs (resistance line going down)
    const highsFalling = recentHighs[1].price < recentHighs[0].price;

    // Check for converging lines
    const lowSlope = (recentLows[1].price - recentLows[0].price) / (recentLows[1].index - recentLows[0].index);
    const highSlope = (recentHighs[1].price - recentHighs[0].price) / (recentHighs[1].index - recentHighs[0].index);
    const isConverging = lowSlope > highSlope;

    if (lowsRising && highsFalling && isConverging) {
      return {
        supportLine: recentLows,
        resistanceLine: recentHighs,
      };
    }

    return null;
  };

  // Draw falling wedge lines
  useEffect(() => {
    if (!chartRef.current || !showFallingWedge || candles.length === 0) return;

    const wedge = detectFallingWedge(candles);
    setFallingWedgeDetected(!!wedge);

    if (wedge) {
      // Draw support line (lower trendline)
      const supportLine = chartRef.current.addLineSeries({
        color: '#00FF88',
        lineWidth: 2,
        lineStyle: 0,
        title: 'Support',
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const supportSlope = (wedge.supportLine[1].price - wedge.supportLine[0].price) /
                           (wedge.supportLine[1].index - wedge.supportLine[0].index);
      const supportData: LineData[] = [
        { time: candles[wedge.supportLine[0].index].time as Time, value: wedge.supportLine[0].price },
        { time: candles[Math.min(candles.length - 1, wedge.supportLine[1].index + 20)].time as Time,
          value: wedge.supportLine[1].price + supportSlope * 20 },
      ];
      supportLine.setData(supportData);

      // Draw resistance line (upper trendline)
      const resistanceLine = chartRef.current.addLineSeries({
        color: '#FF3B30',
        lineWidth: 2,
        lineStyle: 0,
        title: 'Resistance',
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const resistanceSlope = (wedge.resistanceLine[1].price - wedge.resistanceLine[0].price) /
                              (wedge.resistanceLine[1].index - wedge.resistanceLine[0].index);
      const resistanceData: LineData[] = [
        { time: candles[wedge.resistanceLine[0].index].time as Time, value: wedge.resistanceLine[0].price },
        { time: candles[Math.min(candles.length - 1, wedge.resistanceLine[1].index + 20)].time as Time,
          value: wedge.resistanceLine[1].price + resistanceSlope * 20 },
      ];
      resistanceLine.setData(resistanceData);
    }
  }, [candles, showFallingWedge]);

  return (
    <div className="trading-chart-container">
      {/* Header */}
      <div className="header">
        <div className="title-section">
          <h1 className="btc-title">BTC/USD</h1>
          {currentPrice > 0 && (
            <div className="price-info">
              <span className="price-value">
                ${currentPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
              <span className={`price-change-badge ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {fallingWedgeDetected && (
          <div className="pattern-alert">
            ⚠️ Falling Wedge Detected (Bullish Signal)
          </div>
        )}
      </div>

      {/* Chart controls */}
      <div className="chart-controls">
        <div className="timeframe-selector">
          {(['1h', '4h', '1d'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="pattern-toggles">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showFallingWedge}
              onChange={(e) => setShowFallingWedge(e.target.checked)}
            />
            <span>Falling Wedge</span>
          </label>
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
