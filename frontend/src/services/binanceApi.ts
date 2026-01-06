import axios from 'axios';
import type { Candle, BinanceKline, Timeframe } from '../types';

const BASE_URL = 'https://api.binance.com/api/v3';
const WS_URL = 'wss://stream.binance.com:9443/ws';

// Convert timeframe to Binance interval format
const timeframeToInterval = (timeframe: Timeframe): string => {
  const mapping: Record<Timeframe, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d',
  };
  return mapping[timeframe];
};

// Fetch historical klines from Binance
export const fetchHistoricalData = async (
  symbol: string = 'BTCUSDT',
  timeframe: Timeframe = '1h',
  limit: number = 500
): Promise<Candle[]> => {
  try {
    const interval = timeframeToInterval(timeframe);
    const response = await axios.get(`${BASE_URL}/klines`, {
      params: {
        symbol,
        interval,
        limit,
      },
    });

    const klines: BinanceKline[] = response.data;
    return klines.map((kline) => ({
      time: Math.floor(kline[0] / 1000), // Convert to seconds
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

// WebSocket connection for real-time updates
export class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private symbol: string;
  private timeframe: Timeframe;
  private onUpdateCallback: ((candle: Candle) => void) | null = null;

  constructor(symbol: string = 'BTCUSDT', timeframe: Timeframe = '1h') {
    this.symbol = symbol.toLowerCase();
    this.timeframe = timeframe;
  }

  connect(onUpdate: (candle: Candle) => void) {
    this.onUpdateCallback = onUpdate;
    const interval = timeframeToInterval(this.timeframe);
    const wsUrl = `${WS_URL}/${this.symbol}@kline_${interval}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const kline = data.k;

      const candle: Candle = {
        time: Math.floor(kline.t / 1000),
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v),
      };

      if (this.onUpdateCallback) {
        this.onUpdateCallback(candle);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  updateSymbol(symbol: string, timeframe: Timeframe) {
    this.disconnect();
    this.symbol = symbol.toLowerCase();
    this.timeframe = timeframe;
    if (this.onUpdateCallback) {
      this.connect(this.onUpdateCallback);
    }
  }
}
