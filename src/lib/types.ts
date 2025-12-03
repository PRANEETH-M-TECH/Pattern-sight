export type StockDataPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type TechnicalIndicators = {
  rsi: number;
  macd: {
    MACD: number;
    signal: number;
    histogram: number;
  };
  ma20: number;
  ma50: number;
  ma200: number;
};

export type AIPredictions = {
  lstm: {
    trend: string;
    summary: string;
  };
  cnn: {
    pattern: string;
    confidence: number;
  };
  pipeline: {
    summary: string;
  };
};

export type SupportResistance = {
  support: number[];
  resistance: number[];
};

export type AnalysisResult = {
  ticker: string;
  chartData: StockDataPoint[];
  indicators: TechnicalIndicators;
  aiPredictions: AIPredictions;
  supportResistance: SupportResistance;
};
