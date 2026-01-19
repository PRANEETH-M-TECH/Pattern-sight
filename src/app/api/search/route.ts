import { NextRequest, NextResponse } from 'next/server';
import { createMarketDataProvider } from '@/lib/market-data';
import { searchCache, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query parameter must be at least 2 characters' },
      { status: 400 }
    );
  }

  const cacheKey = `search:${query.toLowerCase()}`;

  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const provider = createMarketDataProvider();
    const results = await provider.searchTickers(query);

    // Cache the result
    searchCache.set(cacheKey, results, CACHE_TTL.SEARCH);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error searching tickers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search tickers' },
      { status: 500 }
    );
  }
}
