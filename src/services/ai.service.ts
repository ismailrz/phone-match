import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/index.js';
import {
  ExtractionResponseSchema,
  EXTRACTION_SYSTEM_PROMPT,
} from '../prompts/extraction.prompt.js';
import type { ExtractionResponse } from '../prompts/extraction.prompt.js';
import { normalizeWeights } from '../utils/scoring.js';

const DEFAULT_WEIGHTS = {
  camera: 20,
  battery: 20,
  gaming: 10,
  performance: 20,
  display: 15,
  durability: 5,
  value: 10,
};

export class AiService {
  private client: Anthropic | null = null;

  constructor() {
    if (config.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
    }
  }

  async extractWeights(query: string): Promise<ExtractionResponse> {
    if (this.client) {
      try {
        return await this.callClaude(query);
      } catch {
        return this.keywordExtract(query);
      }
    }
    return this.keywordExtract(query);
  }

  private async callClaude(query: string): Promise<ExtractionResponse> {
    const response = await this.client!.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: query }],
    });

    const text = response.content[0];
    if (text?.type !== 'text') throw new Error('Unexpected response type from Claude');

    const raw = JSON.parse(text.text) as unknown;
    const result = ExtractionResponseSchema.safeParse(raw);
    if (!result.success) throw new Error('Claude response failed schema validation');

    return result.data;
  }

  private keywordExtract(query: string): ExtractionResponse {
    const q = query.toLowerCase();
    const weights = { ...DEFAULT_WEIGHTS };
    const constraints: ExtractionResponse['constraints'] = {};

    // Camera boosts
    if (/camera|photo|photography|portrait|zoom|selfie|picture/.test(q)) {
      weights.camera += 30;
      weights.value -= 10;
      weights.gaming -= 10;
    }

    // Battery boosts
    if (/battery|long.?lasting|all.?day|endurance|standby/.test(q)) {
      weights.battery += 30;
      weights.display -= 10;
      weights.gaming -= 10;
    }

    // Gaming boosts
    if (/gaming|game|fps|pubg|fortnite|genshin|performance/.test(q)) {
      weights.gaming += 40;
      weights.performance += 10;
      weights.value -= 20;
      weights.durability -= 10;
    }

    // Value / budget
    if (/cheap|budget|affordable|value|price|low.?cost|inexpensive/.test(q)) {
      weights.value += 30;
      weights.performance -= 10;
      weights.durability -= 5;
    }

    // Durability
    if (/waterproof|rugged|durable|drop.?proof|tough/.test(q)) {
      weights.durability += 30;
      weights.gaming -= 10;
      weights.value -= 10;
      constraints.requiredFeatures = ['waterproof'];
    }

    // Display
    if (/screen|display|amoled|oled|refresh/.test(q)) {
      weights.display += 25;
      weights.value -= 10;
    }

    // Travel
    if (/travel|trip|vacation|backpack/.test(q)) {
      weights.camera += 15;
      weights.battery += 15;
      weights.durability += 10;
      weights.gaming -= 15;
    }

    // Parents / elderly
    if (/parent|elderly|senior|simple|easy/.test(q)) {
      weights.display += 20;
      weights.value += 15;
      weights.gaming -= 25;
      weights.performance -= 10;
    }

    // Price extraction
    const priceMatch = q.match(/(?:under|below|less than|max|budget of?)\s*\$?(\d+)/);
    if (priceMatch?.[1]) {
      constraints.maxPriceUsd = parseInt(priceMatch[1], 10);
    }

    // OS detection
    if (/iphone|ios|apple/.test(q)) {
      constraints.operatingSystem = 'iOS';
    } else if (/android|samsung|google|pixel|oneplus|xiaomi/.test(q)) {
      constraints.operatingSystem = 'Android';
    }

    // Brand extraction
    const brands: string[] = [];
    if (/apple|iphone/.test(q)) brands.push('Apple');
    if (/samsung/.test(q)) brands.push('Samsung');
    if (/google|pixel/.test(q)) brands.push('Google');
    if (/oneplus/.test(q)) brands.push('OnePlus');
    if (/xiaomi|redmi|poco/.test(q)) brands.push('Xiaomi');
    if (/nothing/.test(q)) brands.push('Nothing');
    if (/motorola/.test(q)) brands.push('Motorola');
    if (brands.length > 0) constraints.preferredBrands = brands;

    // Clamp all weights to [0, 100]
    for (const key of Object.keys(weights) as (keyof typeof weights)[]) {
      weights[key] = Math.max(0, weights[key]);
    }

    // Normalize to sum to 100
    const normalized = normalizeWeights(weights);
    const normalizedWeights = {
      camera: normalized['camera'] ?? DEFAULT_WEIGHTS.camera,
      battery: normalized['battery'] ?? DEFAULT_WEIGHTS.battery,
      gaming: normalized['gaming'] ?? DEFAULT_WEIGHTS.gaming,
      performance: normalized['performance'] ?? DEFAULT_WEIGHTS.performance,
      display: normalized['display'] ?? DEFAULT_WEIGHTS.display,
      durability: normalized['durability'] ?? DEFAULT_WEIGHTS.durability,
      value: normalized['value'] ?? DEFAULT_WEIGHTS.value,
    };

    return {
      weights: normalizedWeights,
      constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
    };
  }
}
