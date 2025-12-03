import type { AIPredictions } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, BrainCircuit, TrendingUp, TrendingDown, Shapes } from 'lucide-react';

const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend.toLowerCase() === 'up') {
        return <TrendingUp className="h-6 w-6 text-green-500" />;
    }
    if (trend.toLowerCase() === 'down') {
        return <TrendingDown className="h-6 w-6 text-red-500" />;
    }
    return <TrendingUp className="h-6 w-6 text-muted-foreground" />;
};


export function PredictionCards({ predictions }: { predictions: AIPredictions }) {
  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {/* Main AI Summary */}
        <Card className="lg:col-span-3 bg-secondary">
             <CardHeader>
                <div className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary"/>
                    <CardTitle className="text-xl">AI Analysis Summary</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-base text-foreground">{predictions.pipeline.summary}</p>
            </CardContent>
        </Card>

        {/* LSTM Trend */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-muted-foreground"/>
                    <CardTitle>LSTM Trend Prediction</CardTitle>
                </div>
                <CardDescription>Short-term price direction</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <div className="text-3xl font-bold capitalize">{predictions.lstm.trend}</div>
                <TrendIcon trend={predictions.lstm.trend} />
            </CardContent>
        </Card>

        {/* CNN Pattern */}
        <Card>
            <CardHeader>
                 <div className="flex items-center gap-2">
                    <Shapes className="h-5 w-5 text-muted-foreground"/>
                    <CardTitle>CNN Chart Pattern</CardTitle>
                </div>
                <CardDescription>Identified market structure</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-3xl font-bold capitalize">{predictions.cnn.pattern.replace(/_/g, ' ')}</div>
                 <p className="text-xs text-muted-foreground mt-1">Confidence: {(predictions.cnn.confidence * 100).toFixed(1)}%</p>
            </CardContent>
        </Card>
        
        <Card className="hidden lg:block">
            <CardHeader>
                <CardTitle>Model Details</CardTitle>
                <CardDescription>Insights from model training</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{predictions.lstm.summary}</p>
            </CardContent>
        </Card>
    </div>
  );
}
