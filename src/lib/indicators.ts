/**
 * Technical Indicator Calculations
 * Pure functions that compute indicators from historical OHLCV data
 */

import type { StockDataPoint } from './types';

/**
 * Calculate RSI (Relative Strength Index)
 * @param data Array of stock data points
 * @param period Period for RSI calculation (default 14)
 * @returns Array of RSI values aligned with data points
 */
export function calculateRSI(data: StockDataPoint[], period: number = 14): number[] {
  if (data.length < period + 1) {
    return new Array(data.length).fill(50); // Neutral RSI if not enough data
  }

  const rsi: number[] = new Array(data.length).fill(NaN);
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Calculate RSI for first valid point
  if (avgLoss === 0) {
    rsi[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    rsi[period] = 100 - (100 / (1 + rs));
  }

  // Calculate RSI for remaining points using Wilder's smoothing
  for (let i = period + 1; i < data.length; i++) {
    const gain = gains[i - 1];
    const loss = losses[i - 1];

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
  }

  return rsi;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param data Array of stock data points
 * @param fastPeriod Fast EMA period (default 12)
 * @param slowPeriod Slow EMA period (default 26)
 * @param signalPeriod Signal line period (default 9)
 * @returns Object with MACD line, signal line, and histogram arrays
 */
export function calculateMACD(
  data: StockDataPoint[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { MACD: number[]; signal: number[]; histogram: number[] } {
  if (data.length < slowPeriod + signalPeriod) {
    return {
      MACD: new Array(data.length).fill(0),
      signal: new Array(data.length).fill(0),
      histogram: new Array(data.length).fill(0),
    };
  }

  const closes = data.map(d => d.close);

  // Calculate EMAs
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  // Calculate MACD line
  const MACD = fastEMA.map((fast, i) => fast - slowEMA[i]);

  // Calculate signal line (EMA of MACD)
  const signal = calculateEMA(MACD, signalPeriod);

  // Calculate histogram
  const histogram = MACD.map((macd, i) => macd - signal[i]);

  return { MACD, signal, histogram };
}

/**
 * Calculate EMA (Exponential Moving Average)
 */
function calculateEMA(values: number[], period: number): number[] {
  const ema: number[] = new Array(values.length).fill(NaN);
  const multiplier = 2 / (period + 1);

  // Start with SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  ema[period - 1] = sum / period;

  // Calculate EMA for remaining points
  for (let i = period; i < values.length; i++) {
    ema[i] = (values[i] - ema[i - 1]) * multiplier + ema[i - 1];
  }

  return ema;
}

/**
 * Calculate Simple Moving Average
 * @param data Array of stock data points
 * @param period Period for MA calculation
 * @param field Field to average (default 'close')
 * @returns Array of MA values aligned with data points
 */
export function calculateMA(
  data: StockDataPoint[],
  period: number,
  field: 'open' | 'high' | 'low' | 'close' = 'close'
): number[] {
  if (data.length < period) {
    return new Array(data.length).fill(NaN);
  }

  const ma: number[] = new Array(data.length).fill(NaN);
  const values = data.map(d => d[field]);

  for (let i = period - 1; i < data.length; i++) {
    const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    ma[i] = sum / period;
  }

  return ma;
}

/**
 * Get the latest indicator values (for display cards)
 */
export function getLatestIndicators(data: StockDataPoint[]) {
  const rsi = calculateRSI(data);
  const macd = calculateMACD(data);
  const ma20 = calculateMA(data, 20);
  const ma50 = calculateMA(data, 50);
  const ma200 = calculateMA(data, 200);

  return {
    rsi: rsi[rsi.length - 1] || 50,
    macd: {
      MACD: macd.MACD[macd.MACD.length - 1] || 0,
      signal: macd.signal[macd.signal.length - 1] || 0,
      histogram: macd.histogram[macd.histogram.length - 1] || 0,
    },
    ma20: ma20[ma20.length - 1] || data[data.length - 1]?.close || 0,
    ma50: ma50[ma50.length - 1] || data[data.length - 1]?.close || 0,
    ma200: ma200[ma200.length - 1] || data[data.length - 1]?.close || 0,
  };
}
