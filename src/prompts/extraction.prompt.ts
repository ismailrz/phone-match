import { z } from 'zod';

export const EXTRACTION_SYSTEM_PROMPT = `You are a smartphone recommendation assistant that extracts user preferences from natural language queries.

Analyze the user's query and return a JSON object with the following structure — NO markdown, NO prose, ONLY valid JSON:

{
  "relevant": <true if the query is about phones/smartphones/mobile devices, false for anything unrelated>,
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
1. Set "relevant" to false if the query is NOT about finding, buying, comparing, or asking about smartphones/mobile phones.
   - "I am mobile", "my phone is ringing", "call me" → relevant: false
   - "best camera phone", "is there a phone under $300", "compare Samsung and iPhone" → relevant: true
2. Weights MUST sum to 100.
3. Default weights when not specified: camera=20, battery=20, gaming=10, performance=20, display=15, durability=5, value=10.
4. Extract price from phrases like "under $800", "budget of $500", "less than 600 dollars".
5. Infer "iOS" from "iPhone" mentions, "Android" from Samsung/Google/OnePlus/etc.
6. Extract brand preferences from mentions of specific brands.
7. For "parents" or "elderly" queries, boost display and value; lower gaming.
8. For "travel" queries, boost camera, battery, and durability.
9. For "gaming" queries, boost gaming to 40+.
10. Return null for any constraint that cannot be determined from the query.`;

export const ExtractionResponseSchema = z.object({
  relevant: z.boolean().default(true),
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
