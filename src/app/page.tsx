'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BarChart3, TrendingUp, Sparkles, ArrowRight, Zap, Shield, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="flex-1 overflow-hidden">
      {/* Hero Section with Animation */}
      <section className="container py-12 md:py-20 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className={`text-center max-w-4xl mx-auto space-y-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-4">
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl font-headline bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-gradient">
              PatternSight
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground animate-fade-in-up delay-200">
            AI-Powered Stock Analysis & Portfolio Intelligence
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up delay-400">
            Analyze stocks with real-time data, technical indicators, and AI-driven insights.
            Build and track your portfolio with intelligent pattern recognition.
          </p>
          <div className={`flex items-center justify-center gap-4 pt-4 animate-fade-in-up delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link href="/dashboard?tab=overview">
              <Button size="lg" className="text-lg px-8 hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl">
                <Search className="mr-2 h-5 w-5" />
                Analyze a Stock
              </Button>
            </Link>
            <Link href="/dashboard?tab=portfolio">
              <Button size="lg" variant="outline" className="text-lg px-8 hover:scale-105 transition-transform duration-200">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section with Scroll Animation */}
      <section className="container py-12 md:py-20 border-t">
        <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">How It Works</h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-slide-in-left">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10 animate-bounce-slow">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">1. Search Stock</h3>
                <p className="text-muted-foreground">
                  Enter any stock ticker symbol to fetch live market data and historical prices.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-slide-in-up delay-200">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10 animate-bounce-slow delay-300">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">2. View Analysis</h3>
                <p className="text-muted-foreground">
                  Get technical indicators, chart patterns, support/resistance levels, and AI-powered insights.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-slide-in-right delay-400">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10 animate-bounce-slow delay-600">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">3. Track Portfolio</h3>
                <p className="text-muted-foreground">
                  Save stocks to your portfolio and monitor performance with real-time updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Features */}
      <section className="container py-12 md:py-20 border-t">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200 animate-fade-in-left">
            <div className="p-2 rounded-lg bg-primary/10 animate-pulse-slow">
              <Sparkles className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Get trend predictions and chart pattern recognition powered by advanced AI models.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200 animate-fade-in-right delay-200">
            <div className="p-2 rounded-lg bg-primary/10 animate-pulse-slow delay-300">
              <BarChart3 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Technical Indicators</h3>
              <p className="text-muted-foreground">
                RSI, MACD, Moving Averages, and support/resistance levels calculated from real market data.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200 animate-fade-in-left delay-400">
            <div className="p-2 rounded-lg bg-primary/10 animate-pulse-slow delay-600">
              <TrendingUp className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Live Market Data</h3>
              <p className="text-muted-foreground">
                Real-time stock prices and historical data powered by reliable market data APIs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors duration-200 animate-fade-in-right delay-600">
            <div className="p-2 rounded-lg bg-primary/10 animate-pulse-slow delay-900">
              <Target className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Portfolio Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your saved stocks with gain/loss tracking and performance metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-12 md:py-20 border-t">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-xl transition-all duration-300 animate-fade-in-up">
          <CardContent className="pt-6">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground">
                Start analyzing stocks and building your portfolio today.
              </p>
              <Link href="/dashboard?tab=overview">
                <Button size="lg" className="text-lg px-8 hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>



      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
        .delay-600 { animation-delay: 0.6s; opacity: 0; }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out forwards;
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out forwards;
        }
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out forwards;
        }
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out forwards;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
