import type { AnalysisResult } from '@/lib/types';
import { CandlestickChart } from './candlestick-chart';
import { IndicatorCards } from './indicator-cards';
import { PredictionCards } from './prediction-cards';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type ResultsDisplayProps = {
  result: AnalysisResult;
};

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">Analysis for {result.ticker}</h2>
        <p className="text-muted-foreground">
          Displaying analysis for the last trading year.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>Price Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <CandlestickChart 
                        data={result.chartData} 
                        supportResistance={result.supportResistance} 
                    />
                </CardContent>
            </Card>
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold tracking-tight font-headline mb-4">AI Predictions</h3>
        <PredictionCards predictions={result.aiPredictions} />
      </div>

      <div>
         <h3 className="text-2xl font-bold tracking-tight font-headline mb-4">Technical Indicators</h3>
        <IndicatorCards indicators={result.indicators} />
      </div>
    </div>
  );
}
