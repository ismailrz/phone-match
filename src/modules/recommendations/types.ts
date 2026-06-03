export type { RecommendationResult, Weights } from '../../types/index.js';
import type { z } from 'zod';
import type { RecommendInputSchema } from '../../schemas/recommendation.schema.js';

export type RecommendRequest = z.infer<typeof RecommendInputSchema>;
