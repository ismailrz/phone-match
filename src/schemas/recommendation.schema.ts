import { z } from 'zod';

export const RecommendInputSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters').max(500, 'Query too long'),
});

export const CompareInputSchema = z.object({
  phones: z
    .array(z.string().min(1))
    .min(2, 'At least 2 phones required for comparison')
    .max(5, 'Maximum 5 phones can be compared'),
});

export const PhoneDetailsInputSchema = z.object({
  phone: z.string().min(1, 'Phone name is required'),
});

export const SearchMcpInputSchema = z.object({
  brand: z.string().optional().describe('Brand name to filter by (e.g., Apple, Samsung)'),
  model: z.string().optional().describe('Model name to search for'),
  maxPrice: z.number().positive().optional().describe('Maximum price in USD'),
  minPrice: z.number().positive().optional().describe('Minimum price in USD'),
  os: z.enum(['Android', 'iOS']).optional().describe('Operating system filter'),
  minRam: z.number().positive().optional().describe('Minimum RAM in GB'),
  minStorage: z.number().positive().optional().describe('Minimum storage in GB'),
});

export type RecommendInput = z.infer<typeof RecommendInputSchema>;
export type CompareInput = z.infer<typeof CompareInputSchema>;
export type PhoneDetailsInput = z.infer<typeof PhoneDetailsInputSchema>;
export type SearchMcpInput = z.infer<typeof SearchMcpInputSchema>;
