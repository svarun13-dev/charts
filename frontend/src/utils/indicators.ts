import type { Candle, MovingAverage, BollingerBands, SwingPoint, FibLevel, SupportResistance } from '../types';

// Calculate Exponential Moving Average
export const calculateEMA = (data: Candle[], period: number): MovingAverage[] => {
  if (data.length < period) return [];

  const ema: MovingAverage[] = [];
  const multiplier = 2 / (period + 1);

  // Calculate initial SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let emaValue = sum / period;
  ema.push({ time: data[period - 1].time, value: emaValue });

  // Calculate EMA for remaining data
  for (let i = period; i < data.length; i++) {
    emaValue = (data[i].close - emaValue) * multiplier + emaValue;
    ema.push({ time: data[i].time, value: emaValue });
  }

  return ema;
};

// Calculate Simple Moving Average
export const calculateSMA = (data: Candle[], period: number): MovingAverage[] => {
  if (data.length < period) return [];

  const sma: MovingAverage[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    sma.push({ time: data[i].time, value: sum / period });
  }

  return sma;
};

// Calculate Bollinger Bands
export const calculateBollingerBands = (
  data: Candle[],
  period: number = 20,
  stdDev: number = 2
): BollingerBands[] => {
  if (data.length < period) return [];

  const bands: BollingerBands[] = [];

  for (let i = period - 1; i < data.length; i++) {
    // Calculate SMA (middle band)
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const sma = sum / period;

    // Calculate standard deviation
    let variance = 0;
    for (let j = 0; j < period; j++) {
      variance += Math.pow(data[i - j].close - sma, 2);
    }
    const std = Math.sqrt(variance / period);

    bands.push({
      time: data[i].time,
      upper: sma + stdDev * std,
      middle: sma,
      lower: sma - stdDev * std,
    });
  }

  return bands;
};

// Detect swing highs and lows
export const detectSwingPoints = (data: Candle[], leftBars: number = 5, rightBars: number = 5): SwingPoint[] => {
  const swingPoints: SwingPoint[] = [];

  for (let i = leftBars; i < data.length - rightBars; i++) {
    let isSwingHigh = true;
    let isSwingLow = true;

    // Check if current point is a swing high
    for (let j = 1; j <= leftBars; j++) {
      if (data[i].high <= data[i - j].high) {
        isSwingHigh = false;
        break;
      }
    }
    for (let j = 1; j <= rightBars; j++) {
      if (data[i].high <= data[i + j].high) {
        isSwingHigh = false;
        break;
      }
    }

    // Check if current point is a swing low
    for (let j = 1; j <= leftBars; j++) {
      if (data[i].low >= data[i - j].low) {
        isSwingLow = false;
        break;
      }
    }
    for (let j = 1; j <= rightBars; j++) {
      if (data[i].low >= data[i + j].low) {
        isSwingLow = false;
        break;
      }
    }

    if (isSwingHigh) {
      swingPoints.push({
        time: data[i].time,
        price: data[i].high,
        type: 'high',
      });
    }

    if (isSwingLow) {
      swingPoints.push({
        time: data[i].time,
        price: data[i].low,
        type: 'low',
      });
    }
  }

  return swingPoints;
};

// Calculate Fibonacci retracement levels
export const calculateFibonacciLevels = (high: number, low: number): FibLevel[] => {
  const diff = high - low;
  const levels = [
    { level: 0, label: '0%' },
    { level: 0.236, label: '23.6%' },
    { level: 0.382, label: '38.2%' },
    { level: 0.5, label: '50%' },
    { level: 0.618, label: '61.8%' },
    { level: 0.786, label: '78.6%' },
    { level: 1, label: '100%' },
  ];

  return levels.map((level) => ({
    price: high - diff * level.level,
    level: level.level,
    label: level.label,
  }));
};

// Get latest Fibonacci levels from swing points
export const getLatestFibonacci = (swingPoints: SwingPoint[]): { high: number; low: number } | null => {
  if (swingPoints.length < 2) return null;

  // Get the most recent significant swing high and low
  const recentSwings = swingPoints.slice(-10); // Look at last 10 swing points
  const highs = recentSwings.filter((s) => s.type === 'high');
  const lows = recentSwings.filter((s) => s.type === 'low');

  if (highs.length === 0 || lows.length === 0) return null;

  const latestHigh = highs[highs.length - 1];
  const latestLow = lows[lows.length - 1];

  return {
    high: latestHigh.price,
    low: latestLow.price,
  };
};

// Detect support and resistance levels
export const detectSupportResistance = (
  data: Candle[],
  tolerance: number = 0.002 // 0.2% tolerance
): SupportResistance[] => {
  const levels: Map<number, { touches: number; prices: number[] }> = new Map();

  // Collect all highs and lows
  data.forEach((candle) => {
    [candle.high, candle.low].forEach((price) => {
      let found = false;

      // Check if price is near an existing level
      for (const [level, data] of levels.entries()) {
        if (Math.abs(price - level) / level <= tolerance) {
          data.touches++;
          data.prices.push(price);
          found = true;
          break;
        }
      }

      if (!found) {
        levels.set(price, { touches: 1, prices: [price] });
      }
    });
  });

  // Filter and format levels
  const supportResistance: SupportResistance[] = [];

  for (const [_level, data] of levels.entries()) {
    if (data.touches >= 2) {
      // Only consider levels touched at least twice
      const avgPrice = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
      supportResistance.push({
        price: avgPrice,
        strength: data.touches,
        touches: data.touches,
      });
    }
  }

  // Sort by strength (number of touches)
  return supportResistance.sort((a, b) => b.strength - a.strength).slice(0, 10); // Top 10 levels
};

// Calculate VWAP (Volume Weighted Average Price)
export const calculateVWAP = (data: Candle[]): MovingAverage[] => {
  const vwap: MovingAverage[] = [];
  let cumulativeTPV = 0; // Typical Price × Volume
  let cumulativeVolume = 0;

  data.forEach((candle) => {
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    cumulativeTPV += typicalPrice * candle.volume;
    cumulativeVolume += candle.volume;

    if (cumulativeVolume > 0) {
      vwap.push({
        time: candle.time,
        value: cumulativeTPV / cumulativeVolume,
      });
    }
  });

  return vwap;
};

// Calculate volume profile (price levels with most volume)
export const calculateVolumeProfile = (
  data: Candle[],
  bins: number = 24
): Array<{ price: number; volume: number }> => {
  if (data.length === 0) return [];

  // Find price range
  const prices = data.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceStep = (maxPrice - minPrice) / bins;

  // Initialize bins
  const volumeProfile: Array<{ price: number; volume: number }> = [];
  for (let i = 0; i < bins; i++) {
    volumeProfile.push({
      price: minPrice + priceStep * (i + 0.5),
      volume: 0,
    });
  }

  // Distribute volume to bins
  data.forEach((candle) => {
    const avgPrice = (candle.high + candle.low + candle.close) / 3;
    const binIndex = Math.min(Math.floor((avgPrice - minPrice) / priceStep), bins - 1);
    if (binIndex >= 0 && binIndex < bins) {
      volumeProfile[binIndex].volume += candle.volume;
    }
  });

  return volumeProfile;
};
