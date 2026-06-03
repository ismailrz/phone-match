import { z } from 'zod';

export const EXTRACTION_SYSTEM_PROMPT = `You are a smartphone recommendation assistant that extracts user preferences from natural language queries.

Analyze the user's query and return a JSON object with the following structure — NO markdown, NO prose, ONLY valid JSON:

{
  "weights": {
    "camera": <number 0-100>,
    "battery": <number 0-100>,
    "gaming": <number 0-100>,
    "performance": <number 0-100>,
    "display": <number 0-100>,
    "durability": <number 0-100>,
    "value": <number 0-100>
  },
  "constraints": {
    "maxPriceUsd": <number or null>,
    "minPriceUsd": <number or null>,
    "preferredBrands": <array of brand names or null>,
    "operatingSystem": <"Android" | "iOS" | null>,
    "requiredFeatures": <array of strings like "esim", "waterproof" or null>
  }
}

Rules:
1. Weights MUST sum to 100.
2. Default weights when not specified: camera=20, battery=20, gaming=10, performance=20, display=15, durability=5, value=10.
3. Extract price from phrases like "under $800", "budget of $500", "less than 600 dollars".
4. Infer "iOS" from "iPhone" mentions, "Android" from Samsung/Google/OnePlus/etc.
5. Extract brand preferences from mentions of specific brands.
6. For "parents" or "elderly" queries, boost display and value; lower gaming.
7. For "travel" queries, boost camera, battery, and durability.
8. For "gaming" queries, boost gaming to 40+.
9. Return null for any constraint that cannot be determined from the query.`;

export const ExtractionResponseSchema = z.object({
  weights: z.object({
    camera: z.number().min(0).max(100),
    battery: z.number().min(0).max(100),
    gaming: z.number().min(0).max(100),
    performance: z.number().min(0).max(100),
    display: z.number().min(0).max(100),
    durability: z.number().min(0).max(100),
    value: z.number().min(0).max(100),
  }),
  constraints: z
    .object({
      maxPriceUsd: z.number().nullable().optional(),
      minPriceUsd: z.number().nullable().optional(),
      preferredBrands: z.array(z.string()).nullable().optional(),
      operatingSystem: z.enum(['Android', 'iOS']).nullable().optional(),
      requiredFeatures: z.array(z.string()).nullable().optional(),
    })
    .optional(),
});

export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;
