'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockForm } from './stock-form';
import { CandlestickChart } from './candlestick-chart';
import { IndicatorCards } from './indicator-cards';
import { getAnalysis } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AnalysisResult } from '@/lib/types';

export function AnalyticsTab() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState('1Y');
  const [selectedInterval, setSelectedInterval] = useState('D');
  const { toast } = useToast();

  const handleAnalysis = async (ticker: string) => {
    setLoading(true);
    setAnalysisResult(null);

    try {
      const interval = selectedRange === '1D' ? '30' : 'D';
      setSelectedInterval(interval);
      const result = await getAnalysis(ticker, false, selectedRange, interval); // No AI for analytics tab
      setAnalysisResult(result);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error.message || 'Could not fetch stock data.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate risk score (simple volatility-based)
  const calculateRiskScore = (data: AnalysisResult['chartData']) => {
    if (data.length < 20) return { score: 50, level: 'Medium' };

    const returns = data.slice(-20).map((d, i) => {
      if (i === 0) return 0;
      return (d.close - data[i - 1].close) / data[i - 1].close;
    });

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized

    // Convert volatility to risk score (0-100)
    const score = Math.min(100, Math.max(0, volatility * 1000));
    
    let level = 'Low';
    if (score > 70) level = 'High';
    else if (score > 40) level = 'Medium';

    return { score: Math.round(score), level };
  };

  const riskScore = analysisResult ? calculateRiskScore(analysisResult.chartData) : null;

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Stock for Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <StockForm onSubmit={handleAnalysis} loading={loading} />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Range:</span>
              {['1D', '5D', '1M', '6M', '1Y'].map(range => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`text-sm px-3 py-1 rounded border ${selectedRange === range ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
                  disabled={loading}
                >
                  {range}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Intraday (1D) uses 30m interval; others use daily bars.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Analytics Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Risk Score */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {riskScore && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Risk Score</span>
                      <span className={`font-bold ${
                        riskScore.level === 'High' ? 'text-red-500' :
                        riskScore.level === 'Medium' ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                        {riskScore.level} ({riskScore.score}/100)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          riskScore.level === 'High' ? 'bg-red-500' :
                          riskScore.level === 'Medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${riskScore.score}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on 20-day volatility. Higher volatility indicates higher risk.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
        </div>
      )}

      {/* Empty State */}
      {!analysisResult && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Enter a stock ticker above to view detailed analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
