/**
 * Support and Resistance Level Detection
 * Simple algorithm to identify key price levels
 */

import type { StockDataPoint, SupportResistance } from './types';

/**
 * Detect support and resistance levels from price data
 * Uses local minima (support) and maxima (resistance) detection
 */
export function detectSupportResistance(
  data: StockDataPoint[],
  lookbackPeriod: number = 20,
  minTouches: number = 2
): SupportResistance {
  if (data.length < lookbackPeriod * 2) {
    // Not enough data, return simple min/max based levels
    const prices = data.map(d => d.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;

    return {
      support: [
        minPrice + range * 0.1,
        minPrice + range * 0.25,
      ],
      resistance: [
        maxPrice - range * 0.1,
        maxPrice - range * 0.25,
      ],
    };
  }

  const closes = data.map(d => d.close);
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);

  // Find local minima (potential support) and maxima (potential resistance)
  const supportLevels: number[] = [];
  const resistanceLevels: number[] = [];

  for (let i = lookbackPeriod; i < data.length - lookbackPeriod; i++) {
    // Check for local minimum (support)
    const windowLow = Math.min(...lows.slice(i - lookbackPeriod, i + lookbackPeriod));
    if (lows[i] === windowLow) {
      supportLevels.push(lows[i]);
    }

    // Check for local maximum (resistance)
    const windowHigh = Math.max(...highs.slice(i - lookbackPeriod, i + lookbackPeriod));
    if (highs[i] === windowHigh) {
      resistanceLevels.push(highs[i]);
    }
  }

  // Cluster similar levels together and count touches
  const clusteredSupport = clusterLevels(supportLevels, minTouches);
  const clusteredResistance = clusterLevels(resistanceLevels, minTouches);

  // Sort by significance (number of touches, then by proximity to current price)
  const currentPrice = closes[closes.length - 1];
  
  clusteredSupport.sort((a, b) => {
    if (b.touches !== a.touches) return b.touches - a.touches;
    return Math.abs(a.level - currentPrice) - Math.abs(b.level - currentPrice);
  });

  clusteredResistance.sort((a, b) => {
    if (b.touches !== a.touches) return b.touches - a.touches;
    return Math.abs(a.level - currentPrice) - Math.abs(b.level - currentPrice);
  });

  // Return top 2-3 levels
  return {
    support: clusteredSupport.slice(0, 3).map(c => c.level),
    resistance: clusteredResistance.slice(0, 3).map(c => c.level),
  };
}

interface ClusteredLevel {
  level: number;
  touches: number;
}

/**
 * Cluster similar price levels together
 * Levels within 2% of each other are considered the same level
 */
function clusterLevels(levels: number[], minTouches: number): ClusteredLevel[] {
  if (levels.length === 0) return [];

  const clusters: ClusteredLevel[] = [];
  const tolerance = 0.02; // 2% tolerance

  for (const level of levels) {
    // Find existing cluster within tolerance
    let found = false;
    for (const cluster of clusters) {
      if (Math.abs(cluster.level - level) / cluster.level < tolerance) {
        cluster.touches++;
        cluster.level = (cluster.level * (cluster.touches - 1) + level) / cluster.touches; // Average
        found = true;
        break;
      }
    }

    // Create new cluster if not found
    if (!found) {
      clusters.push({ level, touches: 1 });
    }
  }

  // Filter by minimum touches and return
  return clusters.filter(c => c.touches >= minTouches);
}
