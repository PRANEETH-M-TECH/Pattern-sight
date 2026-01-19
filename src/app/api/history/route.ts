import { NextRequest, NextResponse } from 'next/server';
import { createMarketDataProvider } from '@/lib/market-data';
import { historyCache, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get('t');
  const range = searchParams.get('range') || '1Y';
  const interval = searchParams.get('interval') || 'D';

  if (!ticker) {
    return NextResponse.json(
      { error: 'Ticker parameter is required' },
      { status: 400 }
    );
  }

  const cacheKey = `history:${ticker.toUpperCase()}:${range}:${interval}`;

  // Check cache first
  const cached = historyCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const provider = createMarketDataProvider();
    const history = await provider.getHistory(ticker.toUpperCase(), range, interval);

    // Cache the result (longer cache for StockData.org due to daily limits)
    historyCache.set(cacheKey, history, CACHE_TTL.HISTORY);

    return NextResponse.json(history);
  } catch (error: any) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
