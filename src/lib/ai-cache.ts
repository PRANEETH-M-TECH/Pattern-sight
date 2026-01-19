/**
 * Client-side AI cache (sessionStorage) to avoid repeated AI calls.
 * Stores aiPredictions per ticker + range with a TTL.
 */

import type { AIPredictions } from '@/lib/types';

type AiCacheEntry = {
  ticker: string;
  range: string;
  ai: AIPredictions;
  timestamp: number;
};

const KEY = 'patternsight_ai_cache';
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function load(): AiCacheEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function save(entries: AiCacheEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function getCachedAI(ticker: string, range: string): AIPredictions | null {
  const entries = load();
  const now = Date.now();
  const match = entries.find(
    e => e.ticker === ticker.toUpperCase() && e.range === range && now - e.timestamp < TTL_MS
  );
  return match ? match.ai : null;
}

export function setCachedAI(ticker: string, range: string, ai: AIPredictions) {
  const entries = load().filter(e => Date.now() - e.timestamp < TTL_MS);
  entries.push({ ticker: ticker.toUpperCase(), range, ai, timestamp: Date.now() });
  save(entries);
}
