'use client';

import { useState } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { getAnalysis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { StockForm } from '@/components/patternsight/stock-form';
import { ResultsDisplay } from '@/components/patternsight/results-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/patternsight/logo';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = async (ticker: string) => {
    setLoading(true);
    setAnalysisResult(null);
    try {
      const result = await getAnalysis(ticker);
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not fetch or analyze stock data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <section className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl font-headline">
              AI-Powered Stock Pattern Analysis
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Enter a stock ticker to unlock insights. Our AI models will detect chart patterns, predict trends, and visualize key technical indicators.
            </p>
          </section>

          <section className="mt-8 md:mt-12 max-w-md mx-auto">
            <StockForm onSubmit={handleAnalysis} loading={loading} />
          </section>

          <section className="mt-8 md:mt-12">
            {loading && <LoadingSkeleton />}
            {analysisResult && <ResultsDisplay result={analysisResult} />}
          </section>
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-center text-muted-foreground md:text-left">
            Built with AI. Powered by Next.js.
          </p>
          <p className="text-sm text-center text-muted-foreground md:text-left">
            Disclaimer: For educational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-3">
    <div className="lg:col-span-3 space-y-4">
      <Skeleton className="h-[450px] w-full" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  </div>
);
