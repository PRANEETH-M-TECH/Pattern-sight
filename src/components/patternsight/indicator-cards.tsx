import type { TechnicalIndicators } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, TrendingUp, TrendingDown, Gauge, MoveHorizontal } from 'lucide-react';

type IndicatorCardProps = {
  title: string;
  value: string | number;
  interpretation: string;
  Icon: React.ElementType;
};

const IndicatorCard = ({ title, value, interpretation, Icon }: IndicatorCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{interpretation}</p>
    </CardContent>
  </Card>
);

export function IndicatorCards({ indicators }: { indicators: TechnicalIndicators }) {
  const rsiInterpretation = indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral';
  const macdInterpretation = indicators.macd.histogram > 0 ? 'Bullish momentum' : 'Bearish momentum';
  const priceVsMa20 = indicators.ma20 > indicators.ma50 ? 'Above 50-day avg' : 'Below 50-day avg';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <IndicatorCard 
        title="RSI (14)"
        value={indicators.rsi.toFixed(2)}
        interpretation={rsiInterpretation}
        Icon={Gauge}
      />
      <IndicatorCard 
        title="MACD Hist."
        value={indicators.macd.histogram.toFixed(4)}
        interpretation={macdInterpretation}
        Icon={indicators.macd.histogram > 0 ? TrendingUp : TrendingDown}
      />
       <IndicatorCard 
        title="20-Day MA"
        value={`$${indicators.ma20.toFixed(2)}`}
        interpretation={priceVsMa20}
        Icon={MoveHorizontal}
      />
       <IndicatorCard 
        title="50-Day MA"
        value={`$${indicators.ma50.toFixed(2)}`}
        interpretation="Mid-term trend indicator"
        Icon={MoveHorizontal}
      />
      <IndicatorCard 
        title="200-Day MA"
        value={`$${indicators.ma200.toFixed(2)}`}
        interpretation="Long-term trend indicator"
        Icon={MoveHorizontal}
      />
    </div>
  );
}
