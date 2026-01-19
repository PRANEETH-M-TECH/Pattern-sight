/**
 * Market Data Provider Interface and Finnhub Implementation
 * Abstracts market data fetching to allow easy provider switching
 */

import type { StockDataPoint } from './types';

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  timestamp: number;
}

export interface TickerSearchResult {
  symbol: string;
  description: string;
  type: string;
}

export interface NewsArticle {
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  image?: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface MarketDataProvider {
  getQuote(ticker: string): Promise<Quote>;
  getHistory(ticker: string, range: string, interval: string): Promise<StockDataPoint[]>;
  searchTickers(query: string): Promise<TickerSearchResult[]>;
  getCompanyNews(ticker: string, from?: string, to?: string): Promise<NewsArticle[]>;
}

/**
 * StockData.org API Implementation
 */
export class StockDataProvider implements MarketDataProvider {
  private apiKey: string;
  private baseUrl = 'https://api.stockdata.org/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(ticker: string): Promise<Quote> {
    const url = `${this.baseUrl}/data/quote?api_token=${this.apiKey}&symbols=${ticker}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${ticker}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0]) {
      throw new Error(`Invalid ticker or no data: ${ticker}`);
    }

    const quote = data.data[0];
    
    return {
      symbol: ticker,
      price: quote.price || quote.close || 0,
      change: quote.change || 0,
      changePercent: quote.percent_change || 0,
      high: quote.high || 0,
      low: quote.low || 0,
      open: quote.open || 0,
      previousClose: quote.previous_close || quote.close || 0,
      volume: quote.volume || 0,
      timestamp: quote.updated_at ? new Date(quote.updated_at).getTime() : Date.now(),
    };
  }

  async getHistory(
    ticker: string,
    range: string = '1Y',
    interval: string = 'D' // 'D' for daily, '60' for 1h, '30' for 30m
  ): Promise<StockDataPoint[]> {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    // StockData.org free tier: max 1 month historical data
    // Adjust ranges to fit within 1 month limit
    switch (range) {
      case '1D':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '5D':
        startDate.setDate(startDate.getDate() - 5);
        break;
      case '1M':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '6M':
      case '1Y':
        // Free tier limited to 1 month, use 1 month for longer ranges
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const dateFrom = startDate.toISOString().split('T')[0];
    const dateTo = endDate.toISOString().split('T')[0];

    // Use EOD (end-of-day) endpoint for daily data
    // For intraday, use intraday endpoint
    let url: string;
    if (interval === 'D') {
      url = `${this.baseUrl}/data/eod?api_token=${this.apiKey}&symbols=${ticker}&date_from=${dateFrom}&date_to=${dateTo}&sort=asc`;
    } else {
      // Intraday endpoint (free tier: 1 month max, 1 symbol per request)
      const intervalParam = interval === '60' ? 'hour' : 'minute';
      url = `${this.baseUrl}/data/intraday/adjusted?api_token=${this.apiKey}&symbols=${ticker}&interval=${intervalParam}&date_from=${dateFrom}&date_to=${dateTo}&sort=asc`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch history for ${ticker}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Convert StockData.org format to StockDataPoint[]
    return data.data.map((item: any) => ({
      date: item.date || item.datetime?.split('T')[0] || new Date().toISOString().split('T')[0],
      open: item.open || 0,
      high: item.high || 0,
      low: item.low || 0,
      close: item.close || 0,
      volume: item.volume || 0,
    }));
  }

  async searchTickers(query: string): Promise<TickerSearchResult[]> {
    // StockData.org doesn't have a search endpoint in free tier
    // Return common tickers that match the query (client-side filtering)
    const commonTickers = [
      { symbol: 'AAPL', description: 'Apple Inc.', type: 'Stock' },
      { symbol: 'MSFT', description: 'Microsoft Corporation', type: 'Stock' },
      { symbol: 'GOOGL', description: 'Alphabet Inc.', type: 'Stock' },
      { symbol: 'AMZN', description: 'Amazon.com Inc.', type: 'Stock' },
      { symbol: 'TSLA', description: 'Tesla Inc.', type: 'Stock' },
      { symbol: 'META', description: 'Meta Platforms Inc.', type: 'Stock' },
      { symbol: 'NVDA', description: 'NVIDIA Corporation', type: 'Stock' },
      { symbol: 'JPM', description: 'JPMorgan Chase & Co.', type: 'Stock' },
      { symbol: 'V', description: 'Visa Inc.', type: 'Stock' },
      { symbol: 'JNJ', description: 'Johnson & Johnson', type: 'Stock' },
    ];

    const upperQuery = query.toUpperCase();
    return commonTickers
      .filter(item => 
        item.symbol.includes(upperQuery) || 
        item.description.toUpperCase().includes(upperQuery)
      )
      .slice(0, 10)
      .map(item => ({
        symbol: item.symbol,
        description: item.description,
        type: item.type,
      }));
  }

  async getCompanyNews(ticker: string, from?: string, to?: string): Promise<NewsArticle[]> {
    // StockData.org free tier doesn't include news endpoint
    // Return empty array or use alternative news source
    // For now, return empty - can integrate alternative news API later
    return [];
  }
}

// Factory function to create provider instance
export function createMarketDataProvider(): MarketDataProvider {
  const apiKey = process.env.STOCKDATA_API_KEY;
  if (!apiKey) {
    throw new Error('STOCKDATA_API_KEY is not set in environment variables');
  }
  return new StockDataProvider(apiKey);
}
