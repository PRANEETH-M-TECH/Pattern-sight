'use client';

import { useState } from 'react';
import { StockForm } from './stock-form';
import { QuoteDisplay } from './quote-display';
import { CandlestickChart } from './candlestick-chart';
import { IndicatorCards } from './indicator-cards';
import { PredictionCards } from './prediction-cards';
import { ResultsDisplay } from './results-display';
import { NewsFeed } from './news-feed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAnalysis } from '@/app/actions';
import { addToPortfolio, isInPortfolio } from '@/lib/portfolio';
import { getCachedAI, setCachedAI } from '@/lib/ai-cache';
import type { AnalysisResult } from '@/lib/types';
import type { Quote as QuoteType } from '@/lib/market-data';

type OverviewTabProps = {
  onAddToPortfolio?: (ticker: string) => void;
};

export function OverviewTab({ onAddToPortfolio }: OverviewTabProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [quote, setQuote] = useState<QuoteType | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState('1Y');
  const [selectedInterval, setSelectedInterval] = useState('D'); // 'D' or intraday like '30'
  const { toast } = useToast();

  const handleAnalysis = async (ticker: string) => {
    setLoading(true);
    setAnalysisResult(null);
    setQuote(null);

    try {
      // Decide interval based on range
      const interval = selectedRange === '1D' ? '30' : 'D';
      setSelectedInterval(interval);

      // Fetch quote first
      const quoteResponse = await fetch(`/api/quote?t=${ticker}`);
      if (quoteResponse.ok) {
        const quoteData = await quoteResponse.json();
        setQuote(quoteData);
      }

      // AI cache check (client-side) to reduce AI calls
      const cached = getCachedAI(ticker, selectedRange);
      if (cached) {
        const result = await getAnalysis(ticker, false, selectedRange, interval);
        result.aiPredictions = cached;
        setAnalysisResult(result);
        return;
      }

      // AI is always enabled by default
      const result = await getAnalysis(ticker, true, selectedRange, interval);
      setCachedAI(ticker, selectedRange, result.aiPredictions);
      setAnalysisResult(result);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error.message || 'Could not fetch or analyze stock data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPortfolio = () => {
    if (!analysisResult || !quote) return;

    const priceAtAdd = quote.price;
    addToPortfolio(analysisResult.ticker, priceAtAdd);
    
    toast({
      title: 'Added to Portfolio',
      description: `${analysisResult.ticker} has been added to your portfolio.`,
    });

    if (onAddToPortfolio) {
      onAddToPortfolio(analysisResult.ticker);
    }
  };

  const isStockInPortfolio = analysisResult ? isInPortfolio(analysisResult.ticker) : false;

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StockForm onSubmit={handleAnalysis} loading={loading} />
          
          {/* Range Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Time Range:</span>
            {['1D', '5D', '1M', '6M', '1Y'].map((range) => (
              <Button
                key={range}
                variant={selectedRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedRange(range);
                  if (analysisResult) {
                    handleAnalysis(analysisResult.ticker);
                  }
                }}
              >
                {range}
              </Button>
            ))}
          </div>

        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Quote Display */}
      {quote && <QuoteDisplay quote={quote} loading={loading} />}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Add to Portfolio Button */}
          {!isStockInPortfolio && (
            <Button onClick={handleAddToPortfolio} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add {analysisResult.ticker} to Portfolio
            </Button>
          )}

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <CandlestickChart
                data={analysisResult.chartData}
                supportResistance={analysisResult.supportResistance}
              />
            </CardContent>
          </Card>

          {/* Technical Indicators */}
          <div>
            <h3 className="text-2xl font-bold tracking-tight font-headline mb-4">
              Technical Indicators
            </h3>
            <IndicatorCards indicators={analysisResult.indicators} />
          </div>

          {/* AI Predictions (always enabled) */}
          <div>
            <h3 className="text-2xl font-bold tracking-tight font-headline mb-4">
              AI Predictions
            </h3>
            <PredictionCards predictions={analysisResult.aiPredictions} />
          </div>

          {/* News Feed */}
          <NewsFeed ticker={analysisResult.ticker} maxItems={5} />
        </div>
      )}

      {/* Empty State */}
      {!analysisResult && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Enter a stock ticker above to view analysis and insights.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
