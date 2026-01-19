'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Define the article schema to match NewsArticle interface
const NewsArticleSchema = z.object({
    headline: z.string().describe('The title of the news article.'),
    summary: z.string().describe('A brief summary of the news story.'),
    source: z.string().describe('The name of the news source or publisher.'),
    url: z.string().describe('The link to the full news article.'),
    datetime: z.number().describe('Unix timestamp of when the article was published.'),
    sentiment: z.enum(['positive', 'negative', 'neutral']).describe('The overall sentiment of the news article.'),
});

const NewsGenerationInputSchema = z.object({
    ticker: z.string().describe('The stock ticker symbol to search news for.'),
    count: z.number().optional().default(5).describe('Number of news articles to generate.'),
});

const NewsGenerationOutputSchema = z.object({
    articles: z.array(NewsArticleSchema),
});

export type NewsGenerationInput = z.infer<typeof NewsGenerationInputSchema>;
export type NewsGenerationOutput = z.infer<typeof NewsGenerationOutputSchema>;

/**
 * Generate stock news using Gemini with Google Search tool
 */
export const generateStockNews = ai.defineFlow(
    {
        name: 'generateStockNews',
        inputSchema: NewsGenerationInputSchema,
        outputSchema: NewsGenerationOutputSchema,
    },
    async (input) => {
        // NOTE: Gemini currently does not support 'application/json' response mime type 
        // simultaneously with tools like Google Search. We must fetch as text and then parse.
        const response = await ai.generate({
            model: 'googleai/gemini-2.5-flash', // Switched to 2.5 as requested by user
            config: {
                temperature: 0.1,
                googleSearchRetrieval: {}, // Enable Google Search retrieval
            },
            prompt: `Find the most recent and relevant financial news for the stock ticker: ${input.ticker}.
      Provide a list of up to ${input.count} articles. For each article, provide:
      1. headline
      2. summary (1-2 sentences)
      3. source
      4. url (valid link)
      5. datetime (Unix timestamp)
      6. sentiment (positive, negative, or neutral)
      
      Return ONLY a valid JSON object with an "articles" property containing the array of articles.
      Ensure the output is valid JSON and nothing else.`,
        });

        const text = response.text;
        try {
            // Clean up potentially backticked JSON
            const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            const cleanedText = jsonMatch ? jsonMatch[0] : text;
            const parsed = JSON.parse(cleanedText);

            // Validate and transform to ensure it matches schema
            const articles = (parsed.articles || []).map((a: any) => ({
                headline: a.headline || 'No Headline',
                summary: a.summary || '',
                source: a.source || 'Unknown',
                url: a.url || '#',
                datetime: Number(a.datetime) || Math.floor(Date.now() / 1000),
                sentiment: ['positive', 'negative', 'neutral'].includes(a.sentiment) ? a.sentiment : 'neutral'
            }));

            return { articles };
        } catch (e) {
            console.error('Failed to parse AI news response:', e, text);
            return { articles: [] };
        }
    }
);
