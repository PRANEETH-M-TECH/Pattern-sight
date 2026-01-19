'use server';

/**
 * @fileOverview Portfolio-level AI analysis
 * Provides AI-generated insights about the user's portfolio composition and performance
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PortfolioAnalysisInputSchema = z.object({
  portfolioData: z.string().describe('JSON string of portfolio items with tickers, prices, gains/losses, and performance metrics.'),
});

export type PortfolioAnalysisInput = z.infer<typeof PortfolioAnalysisInputSchema>;

const PortfolioAnalysisOutputSchema = z.object({
  summary: z.string().describe('A comprehensive AI-generated summary of the portfolio performance, diversification, and recommendations.'),
  strengths: z.array(z.string()).describe('Key strengths of the portfolio.'),
  risks: z.array(z.string()).describe('Potential risks or areas of concern.'),
  recommendations: z.array(z.string()).describe('Actionable recommendations for the portfolio.'),
});

export type PortfolioAnalysisOutput = z.infer<typeof PortfolioAnalysisOutputSchema>;

export async function analyzePortfolio(input: PortfolioAnalysisInput): Promise<PortfolioAnalysisOutput> {
  return portfolioAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'portfolioAnalysisPrompt',
  input: {schema: PortfolioAnalysisInputSchema},
  output: {schema: PortfolioAnalysisOutputSchema},
  prompt: `You are an expert financial advisor analyzing a stock portfolio. Analyze the provided portfolio data and provide:

1. A comprehensive summary of the portfolio's performance, diversification, and overall health
2. Key strengths (what's working well)
3. Potential risks or areas of concern
4. Actionable recommendations for improvement

Portfolio Data:
{{{portfolioData}}}

Provide your analysis in a clear, professional, and trader-focused manner. Focus on practical insights that help with decision-making.`,
});

const portfolioAnalysisFlow = ai.defineFlow(
  {
    name: 'portfolioAnalysisFlow',
    inputSchema: PortfolioAnalysisInputSchema,
    outputSchema: PortfolioAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      summary: output?.summary || 'Unable to generate portfolio analysis.',
      strengths: output?.strengths || [],
      risks: output?.risks || [],
      recommendations: output?.recommendations || [],
    };
  }
);
