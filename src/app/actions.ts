'use server';

import { z } from 'zod';
import { classifyChartPattern } from '@/ai/flows/cnn-pattern-classification';
import { trainLSTMModel } from '@/ai/flows/lstm-model-training';
import { predictStock } from '@/ai/flows/prediction-pipeline';
import type { StockDataPoint, AnalysisResult } from '@/lib/types';

// Mock data generation and calculations
const generateMockStockData = (ticker: string): StockDataPoint[] => {
  const data: StockDataPoint[] = [];
  let lastClose = 150 + Math.random() * 50;
  for (let i = 0; i < 252; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (252 - i));
    const open = lastClose * (1 + (Math.random() - 0.5) * 0.05);
    const close = open * (1 + (Math.random() - 0.5) * 0.05);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = 1000000 + Math.random() * 5000000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume,
    });
    lastClose = close;
  }
  return data;
};

const calculateMockIndicators = (data: StockDataPoint[]) => {
  const lastClose = data[data.length - 1].close;
  return {
    rsi: 40 + Math.random() * 30,
    macd: {
      MACD: Math.random() * 2 - 1,
      signal: Math.random() * 2 - 1,
      histogram: Math.random() * 0.5 - 0.25,
    },
    ma20: lastClose * (1 - (Math.random() - 0.5) * 0.05),
    ma50: lastClose * (1 - (Math.random() - 0.5) * 0.1),
    ma200: lastClose * (1 - (Math.random() - 0.5) * 0.2),
  };
};

const calculateMockSupportResistance = (data: StockDataPoint[]) => {
    const prices = data.map(p => p.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    return {
        support: [
            minPrice + (maxPrice - minPrice) * 0.1,
            minPrice + (maxPrice - minPrice) * 0.25,
        ],
        resistance: [
            maxPrice - (maxPrice - minPrice) * 0.1,
            maxPrice - (maxPrice - minPrice) * 0.25,
        ]
    };
};

const tickerSchema = z.string().min(1, 'Ticker is required').max(10, 'Ticker is too long');

export async function getAnalysis(ticker: string): Promise<AnalysisResult> {
  const validation = tickerSchema.safeParse(ticker);
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }
  const safeTicker = validation.data.toUpperCase();

  // 1. Fetch/mock data
  const historicalData = generateMockStockData(safeTicker);
  const historicalDataString = JSON.stringify(historicalData.slice(-90)); // Use last 90 days for AI

  // 2. Run AI Flows in parallel
  const [lstmResult, cnnResult] = await Promise.all([
    trainLSTMModel({ historicalData: historicalDataString }),
    classifyChartPattern({ historicalData: historicalDataString }),
  ]);

  // 3. Run prediction pipeline
  const pipelineResult = await predictStock({
    lstmPrediction: lstmResult.predictedTrend,
    cnnPattern: cnnResult.pattern,
  });

  // 4. Calculate indicators and levels
  const indicators = calculateMockIndicators(historicalData);
  const supportResistance = calculateMockSupportResistance(historicalData);
  
  // 5. Assemble and return result
  return {
    ticker: safeTicker,
    chartData: historicalData,
    indicators,
    supportResistance,
    aiPredictions: {
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
    },
  };
}
