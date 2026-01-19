'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { NewsArticle } from '@/lib/market-data';
import { format } from 'date-fns';

type NewsFeedProps = {
  ticker: string;
  maxItems?: number;
};

export function NewsFeed({ ticker, maxItems = 10 }: NewsFeedProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;
    
    setLoading(true);
    setError(null);
    
    fetch(`/api/news?t=${ticker}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch news');
        return res.json();
      })
      .then(data => {
        setNews(Array.isArray(data) ? data.slice(0, maxItems) : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [ticker, maxItems]);

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load news. {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (news.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No news available for {ticker}.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>News Feed - {ticker}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((article, index) => (
            <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm flex-1">{article.headline}</h4>
                <div className="flex items-center gap-1">
                  {getSentimentIcon(article.sentiment)}
                  <span className={`text-xs ${getSentimentColor(article.sentiment)}`}>
                    {article.sentiment || 'neutral'}
                  </span>
                </div>
              </div>
              {article.summary && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {article.summary}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{article.source}</span>
                  <span>•</span>
                  <span>
                    {article.datetime
                      ? format(new Date(article.datetime * 1000), 'MMM d, yyyy')
                      : 'Recent'}
                  </span>
                </div>
                {article.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(article.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
