import { NextRequest, NextResponse } from 'next/server';
import { createMarketDataProvider } from '@/lib/market-data';
import { searchCache, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get('t');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!ticker) {
    return NextResponse.json(
      { error: 'Ticker parameter is required' },
      { status: 400 }
    );
  }

  const cacheKey = `news:${ticker.toUpperCase()}:${from || 'default'}:${to || 'default'}`;

  // Check cache first (news cache shorter - 1 hour)
  const cached = searchCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const { generateStockNews } = await import('@/ai/flows/news-generation');
    const result = await generateStockNews({ ticker: ticker.toUpperCase(), count: 5 });
    const news = result.articles;

    // Cache the result (1 hour)
    searchCache.set(cacheKey, news, 3600);

    return NextResponse.json(news);
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
