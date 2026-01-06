import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData, Time } from 'lightweight-charts';
import type { Candle, Timeframe, Coin } from '../types';
import {
  fetchHistoricalDataWithVolume,
  fetchTopCoins,
  searchCoins,
  CoinGeckoPricePoller,
} from '../services/coinGeckoApi';
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
  const [showEMA, setShowEMA] = useState({ ema20: true, ema50: true, ema200: true });
  const [showBB, setShowBB] = useState(true);
  const [showFib, setShowFib] = useState(true);
  const [showSR, setShowSR] = useState(true);
  const [topCoins, setTopCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [selectedCoin, setSelectedCoin] = useState<Coin>({
    id: initialCoinId,
    symbol: 'BTC',
    name: 'Bitcoin',
  });

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

  // Load top coins on mount
  useEffect(() => {
    const loadTopCoins = async () => {
      try {
        const coins = await fetchTopCoins(50);
        setTopCoins(coins);
      } catch (error) {
        console.error('Error loading top coins:', error);
      }
    };
    loadTopCoins();
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

        // Setup price polling (30 second intervals)
        if (pollerRef.current) {
          pollerRef.current.stop();
        }

        const poller = new CoinGeckoPricePoller(coinId, 30000);
        poller.start((price) => {
          setCurrentPrice(price);
          // Update the last candle's close price
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

  // Handle coin search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchCoins(query);
      setSearchResults(results.slice(0, 10));
    } catch (error) {
      console.error('Error searching coins:', error);
    }
  };

  // Select a coin
  const handleSelectCoin = (coin: any) => {
    setSelectedCoin({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.thumb || coin.image,
    });
    setCoinId(coin.id);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

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
      ema20Series.setData(ema20.map((e) => ({ time: e.time as Time, value: e.value })) as LineData[]);
    }

    if (showEMA.ema50) {
      const ema50 = calculateEMA(candles, 50);
      const ema50Series = chartRef.current.addLineSeries({
        color: '#FF6D00',
        lineWidth: 2,
        title: 'EMA 50',
      });
      ema50Series.setData(ema50.map((e) => ({ time: e.time as Time, value: e.value })) as LineData[]);
    }

    if (showEMA.ema200) {
      const ema200 = calculateEMA(candles, 200);
      const ema200Series = chartRef.current.addLineSeries({
        color: '#E91E63',
        lineWidth: 2,
        title: 'EMA 200',
      });
      ema200Series.setData(ema200.map((e) => ({ time: e.time as Time, value: e.value })) as LineData[]);
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
        <div className="coin-selector">
          <div className="selected-coin" onClick={() => setShowSearch(!showSearch)}>
            {selectedCoin.image && <img src={selectedCoin.image} alt={selectedCoin.symbol} className="coin-icon" />}
            <div className="coin-info">
              <span className="coin-symbol">{selectedCoin.symbol}</span>
              <span className="coin-name">{selectedCoin.name}</span>
            </div>
            <span className="dropdown-arrow">▼</span>
          </div>

          {showSearch && (
            <div className="coin-dropdown">
              <input
                type="text"
                placeholder="Search coins..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="coin-search-input"
                autoFocus
              />
              <div className="coin-list">
                {searchQuery.length >= 2
                  ? searchResults.map((coin) => (
                      <div key={coin.id} className="coin-item" onClick={() => handleSelectCoin(coin)}>
                        {coin.thumb && <img src={coin.thumb} alt={coin.symbol} className="coin-icon-small" />}
                        <span className="coin-symbol-small">{coin.symbol.toUpperCase()}</span>
                        <span className="coin-name-small">{coin.name}</span>
                      </div>
                    ))
                  : topCoins.slice(0, 20).map((coin) => (
                      <div key={coin.id} className="coin-item" onClick={() => handleSelectCoin(coin)}>
                        {coin.image && <img src={coin.image} alt={coin.symbol} className="coin-icon-small" />}
                        <span className="coin-symbol-small">{coin.symbol.toUpperCase()}</span>
                        <span className="coin-name-small">{coin.name}</span>
                      </div>
                    ))}
              </div>
            </div>
          )}
        </div>

        <div className="timeframe-selector">
          <label>Timeframe:</label>
          {(['1m', '5m', '15m', '1h', '4h', '1d'] as Timeframe[]).map((tf) => (
            <button key={tf} className={timeframe === tf ? 'active' : ''} onClick={() => setTimeframe(tf)}>
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

        <div className="price-display">
          {currentPrice > 0 && <span className="price">${currentPrice.toLocaleString()}</span>}
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
