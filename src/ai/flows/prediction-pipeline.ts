'use server';

/**
 * @fileOverview This file implements the prediction pipeline, integrating LSTM for trend prediction and CNN for pattern classification.
 *
 * - `predictStock` - A function that orchestrates the prediction process.
 * - `PredictionInput` - The input type for the predictStock function.
 * - `PredictionOutput` - The return type for the predictStock function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictionInputSchema = z.object({
  lstmPrediction: z.string().describe('The predicted trend from the LSTM model (up/down).'),
  cnnPattern: z.string().describe('The identified chart pattern from the CNN model (e.g., double top, triangle, breakout).'),
});
export type PredictionInput = z.infer<typeof PredictionInputSchema>;

const PredictionOutputSchema = z.object({
  trendPrediction: z.string().describe('The predicted stock trend.'),
  chartPattern: z.string().describe('The identified chart pattern.'),
  analysisSummary: z.string().describe('A summary of the predicted trend and identified chart pattern.'),
});
export type PredictionOutput = z.infer<typeof PredictionOutputSchema>;

export async function predictStock(input: PredictionInput): Promise<PredictionOutput> {
  return predictionPipelineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictionPipelinePrompt',
  input: {schema: PredictionInputSchema},
  output: {schema: PredictionOutputSchema},
  prompt: `You are an expert stock market analyst. Your goal is to provide a clear, concise, and insightful summary based on AI-driven predictions.
Combine the LSTM trend prediction and the CNN chart pattern to create a holistic analysis summary.
Explain how these two factors together influence the potential future movement of the stock.

LSTM Prediction (Trend): {{{lstmPrediction}}}
CNN Pattern (Market Structure): {{{cnnPattern}}}

Provide your analysis summary below.`,
});

const predictionPipelineFlow = ai.defineFlow(
  {
    name: 'predictionPipelineFlow',
    inputSchema: PredictionInputSchema,
    outputSchema: PredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      trendPrediction: input.lstmPrediction,
      chartPattern: input.cnnPattern,
      analysisSummary: output?.analysisSummary || 'No analysis summary available.',
    };
  }
);
