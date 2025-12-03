import { config } from 'dotenv';
config();

import '@/ai/flows/cnn-pattern-classification.ts';
import '@/ai/flows/lstm-model-training.ts';
import '@/ai/flows/prediction-pipeline.ts';