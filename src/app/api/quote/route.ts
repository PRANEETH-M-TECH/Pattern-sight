import { NextRequest, NextResponse } from 'next/server';
import { createMarketDataProvider } from '@/lib/market-data';
import { quoteCache, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get('t');

  if (!ticker) {
    return NextResponse.json(
      { error: 'Ticker parameter is required' },
      { status: 400 }
    );
  }

  const cacheKey = `quote:${ticker.toUpperCase()}`;

  // Check cache first
  const cached = quoteCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const provider = createMarketDataProvider();
    const quote = await provider.getQuote(ticker.toUpperCase());

    // Cache the result (longer cache for StockData.org due to daily limits)
    quoteCache.set(cacheKey, quote, CACHE_TTL.QUOTE);

    return NextResponse.json(quote);
  } catch (error: any) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
