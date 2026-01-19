'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import type { Quote } from '@/lib/market-data';

type QuoteDisplayProps = {
  quote: Quote | null;
  loading?: boolean;
};

export function QuoteDisplay({ quote, loading }: QuoteDisplayProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return null;
  }

  const isPositive = quote.change >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{quote.symbol}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold">${quote.price.toFixed(2)}</span>
              <span className={`flex items-center gap-1 ${changeColor}`}>
                <ChangeIcon className="h-5 w-5" />
                <span className="text-lg font-semibold">
                  {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                </span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Open</p>
            <p className="font-semibold">${quote.open.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">High</p>
            <p className="font-semibold text-green-500">${quote.high.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Low</p>
            <p className="font-semibold text-red-500">${quote.low.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Volume</p>
            <p className="font-semibold">{quote.volume.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
