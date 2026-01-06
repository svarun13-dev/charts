import axios from 'axios';
import type { Candle, Timeframe } from '../types';

const BASE_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = 'CG-JGAQBXqSNA35K12FastZFd4E';

// Map timeframes to CoinGecko days parameter
const timeframeToDays = (timeframe: Timeframe): number => {
  const mapping: Record<Timeframe, number> = {
    '1m': 1,    // 1 day = 30min candles
    '5m': 1,    // 1 day = 30min candles
    '15m': 1,   // 1 day = 30min candles
    '1h': 7,    // 7 days = 4h candles
    '4h': 30,   // 30 days = 4h candles
    '1d': 365,  // 365 days = daily candles
  };
  return mapping[timeframe];
};

// CoinGecko OHLC data structure: [timestamp, open, high, low, close]
type CoinGeckoOHLC = [number, number, number, number, number];

interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

// Fetch OHLC candlestick data from CoinGecko
export const fetchHistoricalData = async (
  coinId: string = 'bitcoin',
  timeframe: Timeframe = '1h',
  limit: number = 500
): Promise<Candle[]> => {
  try {
    const days = timeframeToDays(timeframe);
    const response = await axios.get(`${BASE_URL}/coins/${coinId}/ohlc`, {
      params: {
        vs_currency: 'usd',
        days: days,
        x_cg_demo_api_key: API_KEY,
      },
    });

    const ohlcData: CoinGeckoOHLC[] = response.data;

    // Convert CoinGecko format to our Candle format
    const candles: Candle[] = ohlcData.map((item) => ({
      time: Math.floor(item[0] / 1000), // Convert milliseconds to seconds
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: 0, // CoinGecko OHLC doesn't include volume, we'll fetch it separately if needed
    }));

    // Limit to requested number of candles
    return candles.slice(-limit);
  } catch (error) {
    console.error('Error fetching CoinGecko OHLC data:', error);
    throw error;
  }
};

// Fetch current price for a coin
export const fetchCurrentPrice = async (coinId: string = 'bitcoin'): Promise<number> => {
  try {
    const response = await axios.get(`${BASE_URL}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd',
        include_24hr_vol: true,
        include_24hr_change: true,
        x_cg_demo_api_key: API_KEY,
      },
    });

    return response.data[coinId]?.usd || 0;
  } catch (error) {
    console.error('Error fetching current price:', error);
    throw error;
  }
};

// Fetch market chart data (includes volume)
export const fetchMarketChart = async (
  coinId: string = 'bitcoin',
  days: number = 7
): Promise<{ prices: [number, number][]; volumes: [number, number][] }> => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        x_cg_demo_api_key: API_KEY,
      },
    });

    return {
      prices: response.data.prices || [],
      volumes: response.data.total_volumes || [],
    };
  } catch (error) {
    console.error('Error fetching market chart:', error);
    throw error;
  }
};

// Fetch list of top coins
export const fetchTopCoins = async (limit: number = 100): Promise<CoinGeckoCoin[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
        x_cg_demo_api_key: API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching top coins:', error);
    throw error;
  }
};

// Search for coins
export const searchCoins = async (query: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        query: query,
        x_cg_demo_api_key: API_KEY,
      },
    });

    return response.data.coins || [];
  } catch (error) {
    console.error('Error searching coins:', error);
    throw error;
  }
};

// Polling class for real-time updates (CoinGecko doesn't have WebSocket)
export class CoinGeckoPricePoller {
  private intervalId: number | null = null;
  private coinId: string;
  private onUpdateCallback: ((price: number) => void) | null = null;
  private pollInterval: number;

  constructor(coinId: string = 'bitcoin', pollInterval: number = 30000) {
    this.coinId = coinId;
    this.pollInterval = pollInterval; // Default 30 seconds
  }

  start(onUpdate: (price: number) => void) {
    this.onUpdateCallback = onUpdate;

    // Initial fetch
    this.fetchAndUpdate();

    // Set up polling
    this.intervalId = setInterval(() => {
      this.fetchAndUpdate();
    }, this.pollInterval);
  }

  private async fetchAndUpdate() {
    try {
      const price = await fetchCurrentPrice(this.coinId);
      if (this.onUpdateCallback) {
        this.onUpdateCallback(price);
      }
    } catch (error) {
      console.error('Error polling price:', error);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  updateCoin(coinId: string) {
    this.coinId = coinId;
  }
}

// Enhanced data fetch with volume from market_chart endpoint
export const fetchHistoricalDataWithVolume = async (
  coinId: string = 'bitcoin',
  timeframe: Timeframe = '1h'
): Promise<Candle[]> => {
  try {
    const days = timeframeToDays(timeframe);

    // Fetch both OHLC and market chart data
    const [ohlcResponse, marketChartData] = await Promise.all([
      axios.get(`${BASE_URL}/coins/${coinId}/ohlc`, {
        params: {
          vs_currency: 'usd',
          days: days,
          x_cg_demo_api_key: API_KEY,
        },
      }),
      fetchMarketChart(coinId, days),
    ]);

    const ohlcData: CoinGeckoOHLC[] = ohlcResponse.data;
    const volumes = marketChartData.volumes;

    // Create a map of timestamps to volumes
    const volumeMap = new Map<number, number>();
    volumes.forEach(([timestamp, volume]) => {
      // Round timestamp to match OHLC timestamps
      const roundedTime = Math.floor(timestamp / 1000);
      volumeMap.set(roundedTime, volume);
    });

    // Convert to Candle format with volume
    const candles: Candle[] = ohlcData.map((item) => {
      const time = Math.floor(item[0] / 1000);

      // Find closest volume data
      let volume = 0;
      const timeKey = time;

      // Try to find exact match or closest timestamp
      if (volumeMap.has(timeKey)) {
        volume = volumeMap.get(timeKey)!;
      } else {
        // Find closest volume timestamp (within 1 hour)
        for (const [volTime, volValue] of volumeMap.entries()) {
          if (Math.abs(volTime - timeKey) < 3600) {
            volume = volValue;
            break;
          }
        }
      }

      return {
        time: time,
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
        volume: volume,
      };
    });

    return candles;
  } catch (error) {
    console.error('Error fetching historical data with volume:', error);
    // Fallback to OHLC only
    return fetchHistoricalData(coinId, timeframe);
  }
};
