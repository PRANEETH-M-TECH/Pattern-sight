'use server';

/**
 * @fileOverview An LSTM model training flow for predicting stock price trends.
 *
 * - trainLSTMModel - A function to train the LSTM model.
 * - LSTMModelTrainingInput - The input type for the trainLSTMModel function.
 * - LSTMModelTrainingOutput - The return type for the trainLSTMModel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LSTMModelTrainingInputSchema = z.object({
  historicalData: z
    .string()
    .describe("Historical stock data in a format that can be processed, such as a CSV string."),
});
export type LSTMModelTrainingInput = z.infer<typeof LSTMModelTrainingInputSchema>;

const LSTMModelTrainingOutputSchema = z.object({
  modelSummary: z.string().describe('A summary of the trained LSTM model including accuracy.'),
  predictedTrend: z.string().describe('The predicted price trend (up or down).'),
});
export type LSTMModelTrainingOutput = z.infer<typeof LSTMModelTrainingOutputSchema>;

export async function trainLSTMModel(input: LSTMModelTrainingInput): Promise<LSTMModelTrainingOutput> {
  return lstmModelTrainingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lstmModelTrainingPrompt',
  input: {schema: LSTMModelTrainingInputSchema},
  output: {schema: LSTMModelTrainingOutputSchema},
  prompt: `You are an AI model training expert specializing in time series analysis.

You will train an LSTM model using the historical stock data provided, then predict the future price trend (up or down).

Provide a model summary, including training accuracy, and the predicted trend based on the trained model.

Historical Data: {{{historicalData}}}
`,
});

const lstmModelTrainingFlow = ai.defineFlow(
  {
    name: 'lstmModelTrainingFlow',
    inputSchema: LSTMModelTrainingInputSchema,
    outputSchema: LSTMModelTrainingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
