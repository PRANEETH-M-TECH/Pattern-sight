'use server';

import { z } from 'zod';
import { classifyChartPattern } from '@/ai/flows/cnn-pattern-classification';
import { trainLSTMModel } from '@/ai/flows/lstm-model-training';
import { predictStock } from '@/ai/flows/prediction-pipeline';
import { analyzePortfolio } from '@/ai/flows/portfolio-analysis';
import type { StockDataPoint, AnalysisResult } from '@/lib/types';
import { getLatestIndicators } from '@/lib/indicators';
import { detectSupportResistance } from '@/lib/support-resistance';

const tickerSchema = z.string().min(1, 'Ticker is required').max(10, 'Ticker is too long');

/**
 * Fetch historical data from API
 * Uses direct provider call instead of API route to avoid server-side fetch issues
 */
async function fetchHistoricalData(ticker: string, range: string = '1Y', interval: string = 'D'): Promise<StockDataPoint[]> {
  // Import provider directly for server-side use
  const { createMarketDataProvider } = await import('@/lib/market-data');
  const provider = createMarketDataProvider();
  
  return provider.getHistory(ticker, range, interval);
}

/**
 * Get stock analysis with real market data
 * @param ticker Stock ticker symbol
 * @param enableAI Whether to run AI analysis (default: true - AI always enabled)
 * @param range Time range for historical data (default: '1Y')
 */
export async function getAnalysis(
  ticker: string,
  enableAI: boolean = true, // AI enabled by default
  range: string = '1Y',
  interval: string = 'D'
): Promise<AnalysisResult> {
  const validation = tickerSchema.safeParse(ticker);
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }
  const safeTicker = validation.data.toUpperCase();

  // 1. Fetch real historical data
  const historicalData = await fetchHistoricalData(safeTicker, range, interval);
  
  if (historicalData.length === 0) {
    throw new Error(`No historical data found for ${safeTicker}`);
  }

  // 2. Calculate real indicators from historical data
  const indicators = getLatestIndicators(historicalData);

  // 3. Detect support/resistance levels
  const supportResistance = detectSupportResistance(historicalData);

  // 4. Run AI flows (always enabled by default)
  let aiPredictions = {
    lstm: {
      trend: 'Neutral',
      summary: 'Analyzing...',
    },
    cnn: {
      pattern: 'unknown',
      confidence: 0,
    },
    pipeline: {
      summary: 'Generating AI analysis...',
    },
  };

  if (enableAI) {
    try {
      const historicalDataString = JSON.stringify(historicalData.slice(-90)); // Use last 90 days for AI

      // Run AI Flows in parallel
      const [lstmResult, cnnResult] = await Promise.all([
        trainLSTMModel({ historicalData: historicalDataString }),
        classifyChartPattern({ historicalData: historicalDataString }),
      ]);

      // Run prediction pipeline
      const pipelineResult = await predictStock({
        lstmPrediction: lstmResult.predictedTrend,
        cnnPattern: cnnResult.pattern,
      });

      aiPredictions = {
        lstm: {
          trend: lstmResult.predictedTrend,
          summary: lstmResult.modelSummary,
        },
        cnn: {
          pattern: cnnResult.pattern,
          confidence: cnnResult.confidence,
        },
        pipeline: {
          summary: pipelineResult.analysisSummary,
        },
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Provide fallback AI predictions
      aiPredictions = {
        lstm: {
          trend: 'Neutral',
          summary: 'AI analysis temporarily unavailable. Please try again.',
        },
        cnn: {
          pattern: 'unknown',
          confidence: 0,
        },
        pipeline: {
          summary: 'Unable to generate AI analysis at this time.',
        },
      };
    }
  }
  
  // 5. Assemble and return result
  return {
    ticker: safeTicker,
    chartData: historicalData,
    indicators,
    supportResistance,
    aiPredictions,
  };
}

/**
 * Get AI-powered portfolio analysis
 * @param portfolioData JSON string of portfolio items with performance metrics
 */
export async function getPortfolioAnalysis(portfolioData: string) {
  try {
    return await analyzePortfolio({ portfolioData });
  } catch (error) {
    console.error('Portfolio analysis failed:', error);
    return {
      summary: 'Unable to generate portfolio analysis at this time.',
      strengths: [],
      risks: [],
      recommendations: [],
    };
  }
}
