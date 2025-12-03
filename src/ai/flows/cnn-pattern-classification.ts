'use server';

/**
 * @fileOverview This file defines a Genkit flow for training and classifying stock chart patterns using a 1D CNN model.
 *
 * - classifyChartPattern - A function that classifies the chart pattern of a given stock data.
 * - ChartPatternInput - The input type for the classifyChartPattern function, including OHLCV data.
 * - ChartPatternOutput - The return type for the classifyChartPattern function, indicating the classified pattern.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChartPatternInputSchema = z.object({
  historicalData: z.string().describe('A stringified JSON array of historical OHLCV data for a stock. Each object in the array should contain open, high, low, close, and volume fields.'),
});
export type ChartPatternInput = z.infer<typeof ChartPatternInputSchema>;

const ChartPatternOutputSchema = z.object({
  pattern: z.string().describe('The classified chart pattern, e.g., double_top, triangle, breakout, or unknown.'),
  confidence: z.number().describe('The confidence level of the classification (0 to 1).'),
});
export type ChartPatternOutput = z.infer<typeof ChartPatternOutputSchema>;

export async function classifyChartPattern(input: ChartPatternInput): Promise<ChartPatternOutput> {
  return classifyChartPatternFlow(input);
}

const classifyChartPatternPrompt = ai.definePrompt({
  name: 'classifyChartPatternPrompt',
  input: {schema: ChartPatternInputSchema},
  output: {schema: ChartPatternOutputSchema},
  prompt: `You are an expert financial analyst specializing in identifying chart patterns in stock data.
  Given the following historical OHLCV data, classify the chart pattern into one of the following categories: double_top, triangle, breakout, or unknown.
  Also, provide a confidence level (0 to 1) for your classification.

  Historical Data: {{{historicalData}}}

  Return the classification and confidence level in JSON format.
  `,
});

const classifyChartPatternFlow = ai.defineFlow(
  {
    name: 'classifyChartPatternFlow',
    inputSchema: ChartPatternInputSchema,
    outputSchema: ChartPatternOutputSchema,
  },
  async input => {
    try {
      //Consider safety settings to allow broader classification results.
      const {output} = await classifyChartPatternPrompt(input, {
        config: {
          safetySettings: [
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
        },
      });
      return output!;
    } catch (error) {
      console.error('Error classifying chart pattern:', error);
      return {
        pattern: 'unknown',
        confidence: 0.0,
      };
    }
  }
);
