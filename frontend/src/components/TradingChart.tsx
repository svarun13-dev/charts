import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData, Time } from 'lightweight-charts';
import type { Candle, Timeframe } from '../types';
import { fetchHistoricalData, BinanceWebSocket } from '../services/binanceApi';
import {
  calculateEMA,
  calculateBollingerBands,
  detectSwingPoints,
  calculateFibonacciLevels,
  getLatestFibonacci,
  detectSupportResistance,
  calculateVolumeProfile,
} from '../utils/indicators';
import './TradingChart.css';

interface Props {
  symbol?: string;
  initialTimeframe?: Timeframe;
}

export const TradingChart = ({ symbol = 'BTCUSDT', initialTimeframe = '1h' }: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const volumeChartContainerRef = useRef<HTMLDivElement>(null);
  const volumeProfileContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const wsRef = useRef<BinanceWebSocket | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEMA, setShowEMA] = useState({ ema20: true, ema50: true, ema200: true });
  const [showBB, setShowBB] = useState(true);
  const [showFib, setShowFib] = useState(true);
  const [showSR, setShowSR] = useState(true);

  // Initialize charts
  useEffect(() => {
    if (!chartContainerRef.current || !volumeChartContainerRef.current) return;

    // Main chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2B2B43',
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
      crosshair: {
        mode: 1,
      },
    });

    // Volume chart
    const volumeChart = createChart(volumeChartContainerRef.current, {
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      width: volumeChartContainerRef.current.clientWidth,
      height: 150,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2B2B43',
        visible: true,
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
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
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Volume series
    const volumeSeries = volumeChart.addHistogramSeries({
      color: '#26a69a',
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

  // Fetch data and setup WebSocket
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchHistoricalData(symbol, timeframe, 500);
        setCandles(data);
        setLoading(false);

        // Setup WebSocket
        if (wsRef.current) {
          wsRef.current.disconnect();
        }

        const ws = new BinanceWebSocket(symbol, timeframe);
        ws.connect((newCandle) => {
          setCandles((prevCandles) => {
            const lastCandle = prevCandles[prevCandles.length - 1];
            if (lastCandle && lastCandle.time === newCandle.time) {
              // Update existing candle
              return [...prevCandles.slice(0, -1), newCandle];
            } else {
              // Add new candle
              return [...prevCandles, newCandle];
            }
          });
        });

        wsRef.current = ws;
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [symbol, timeframe]);

  // Update chart with data and indicators
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
      color: i === 0 ? '#26a69a' : c.close >= candles[i - 1].close ? '#26a69a' : '#ef5350',
    }));
    volumeSeriesRef.current.setData(volumeData);

    // Get all series and remove all except candlestick
    const allSeries = (chartRef.current as any).allSeries?.() || [];
    allSeries.forEach((series: any) => {
      if (series !== candlestickSeriesRef.current) {
        chartRef.current!.removeSeries(series);
      }
    });

    // Add EMA indicators
    if (showEMA.ema20) {
      const ema20 = calculateEMA(candles, 20);
      const ema20Series = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: 'EMA 20',
      });
      ema20Series.setData(ema20.map(e => ({ time: e.time as Time, value: e.value })) as LineData[]);
    }

    if (showEMA.ema50) {
      const ema50 = calculateEMA(candles, 50);
      const ema50Series = chartRef.current.addLineSeries({
        color: '#FF6D00',
        lineWidth: 2,
        title: 'EMA 50',
      });
      ema50Series.setData(ema50.map(e => ({ time: e.time as Time, value: e.value })) as LineData[]);
    }

    if (showEMA.ema200) {
      const ema200 = calculateEMA(candles, 200);
      const ema200Series = chartRef.current.addLineSeries({
        color: '#E91E63',
        lineWidth: 2,
        title: 'EMA 200',
      });
      ema200Series.setData(ema200.map(e => ({ time: e.time as Time, value: e.value })) as LineData[]);
    }

    // Add Bollinger Bands
    if (showBB) {
      const bb = calculateBollingerBands(candles);
      const upperBand = chartRef.current.addLineSeries({
        color: '#9C27B0',
        lineWidth: 1,
        lineStyle: 2,
        title: 'BB Upper',
      });
      const middleBand = chartRef.current.addLineSeries({
        color: '#9C27B0',
        lineWidth: 1,
        title: 'BB Middle',
      });
      const lowerBand = chartRef.current.addLineSeries({
        color: '#9C27B0',
        lineWidth: 1,
        lineStyle: 2,
        title: 'BB Lower',
      });

      upperBand.setData(bb.map((b) => ({ time: b.time as Time, value: b.upper })) as LineData[]);
      middleBand.setData(bb.map((b) => ({ time: b.time as Time, value: b.middle })) as LineData[]);
      lowerBand.setData(bb.map((b) => ({ time: b.time as Time, value: b.lower })) as LineData[]);
    }

    // Add Fibonacci levels
    if (showFib) {
      const swingPoints = detectSwingPoints(candles);
      const fibPoints = getLatestFibonacci(swingPoints);

      if (fibPoints) {
        const fibLevels = calculateFibonacciLevels(fibPoints.high, fibPoints.low);
        const colors = ['#FF0000', '#FF6B00', '#FFD700', '#00FF00', '#00BFFF', '#0000FF', '#8B00FF'];

        fibLevels.forEach((level, index) => {
          const fibSeries = chartRef.current!.addLineSeries({
            color: colors[index],
            lineWidth: 1,
            lineStyle: 2,
            title: `Fib ${level.label}`,
            priceLineVisible: false,
          });
          fibSeries.setData([
            { time: candles[0].time as Time, value: level.price },
            { time: candles[candles.length - 1].time as Time, value: level.price },
          ] as LineData[]);
        });
      }
    }

    // Add Support/Resistance levels
    if (showSR) {
      const srLevels = detectSupportResistance(candles);
      srLevels.slice(0, 5).forEach((level) => {
        const srSeries = chartRef.current!.addLineSeries({
          color: '#FFA500',
          lineWidth: 1,
          lineStyle: 3,
          title: `S/R (${level.touches})`,
          priceLineVisible: false,
        });
        srSeries.setData([
          { time: candles[0].time as Time, value: level.price },
          { time: candles[candles.length - 1].time as Time, value: level.price },
        ] as LineData[]);
      });
    }
  }, [candles, showEMA, showBB, showFib, showSR]);

  // Render volume profile
  useEffect(() => {
    if (!volumeProfileContainerRef.current || candles.length === 0) return;

    const volumeProfile = calculateVolumeProfile(candles);
    const maxVolume = Math.max(...volumeProfile.map((v) => v.volume));

    // Clear previous content
    volumeProfileContainerRef.current.innerHTML = '';

    // Create volume profile bars
    volumeProfile.forEach((profile) => {
      const bar = document.createElement('div');
      bar.className = 'volume-profile-bar';
      const width = (profile.volume / maxVolume) * 100;
      bar.style.width = `${width}%`;
      bar.style.height = `${100 / volumeProfile.length}%`;
      bar.title = `${profile.price.toFixed(2)}: ${profile.volume.toFixed(0)}`;
      volumeProfileContainerRef.current!.appendChild(bar);
    });
  }, [candles]);

  return (
    <div className="trading-chart-container">
      <div className="controls">
        <div className="timeframe-selector">
          <label>Timeframe:</label>
          {(['1m', '5m', '15m', '1h', '4h', '1d'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              className={timeframe === tf ? 'active' : ''}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="indicator-toggles">
          <label>
            <input
              type="checkbox"
              checked={showEMA.ema20}
              onChange={(e) => setShowEMA({ ...showEMA, ema20: e.target.checked })}
            />
            EMA 20
          </label>
          <label>
            <input
              type="checkbox"
              checked={showEMA.ema50}
              onChange={(e) => setShowEMA({ ...showEMA, ema50: e.target.checked })}
            />
            EMA 50
          </label>
          <label>
            <input
              type="checkbox"
              checked={showEMA.ema200}
              onChange={(e) => setShowEMA({ ...showEMA, ema200: e.target.checked })}
            />
            EMA 200
          </label>
          <label>
            <input type="checkbox" checked={showBB} onChange={(e) => setShowBB(e.target.checked)} />
            Bollinger Bands
          </label>
          <label>
            <input type="checkbox" checked={showFib} onChange={(e) => setShowFib(e.target.checked)} />
            Fibonacci
          </label>
          <label>
            <input type="checkbox" checked={showSR} onChange={(e) => setShowSR(e.target.checked)} />
            Support/Resistance
          </label>
        </div>

        <div className="symbol-display">
          <h2>{symbol}</h2>
          {candles.length > 0 && (
            <span className="price">
              ${candles[candles.length - 1].close.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {loading && <div className="loading">Loading chart data...</div>}

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
