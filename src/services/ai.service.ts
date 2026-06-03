import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FastifyBaseLogger } from 'fastify';
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
  private gemini: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;
  readonly provider: string;
  private readonly log: FastifyBaseLogger;

  constructor(logger: FastifyBaseLogger) {
    this.log = logger;
    if (config.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      this.gemini = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      this.provider = 'gemini-2.0-flash';
    } else {
      this.provider = 'keyword-fallback';
    }
    this.log.info({ provider: this.provider }, 'AiService initialized');
  }

  async extractWeights(query: string): Promise<ExtractionResponse> {
    if (this.gemini) {
      try {
        const result = await this.callGemini(query);
        this.log.debug({ query }, 'Gemini extraction succeeded');
        return result;
      } catch (err) {
        this.log.warn({ err, query }, 'Gemini extraction failed, falling back to keywords');
        return this.keywordExtract(query);
      }
    }
    return this.keywordExtract(query);
  }

  private async callGemini(query: string): Promise<ExtractionResponse> {
    const prompt = `${EXTRACTION_SYSTEM_PROMPT}\n\nUser query: "${query}"`;
    const result = await this.gemini!.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the JSON
    const json = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const raw = JSON.parse(json) as unknown;
    const parsed = ExtractionResponseSchema.safeParse(raw);
    if (!parsed.success) throw new Error('Gemini response failed schema validation');

    return parsed.data;
  }

  private keywordExtract(query: string): ExtractionResponse {
    const q = query.toLowerCase();

    // Tier 1 — specific terms that unambiguously mean phone shopping
    const specificTerms = /\b(iphone|android|samsung|pixel|oneplus|xiaomi|nothing phone|motorola|oppo|vivo|asus rog|realme|smartphone|5g phone|gaming phone|camera phone|flagship phone)\b/;

    // Tier 2 — generic terms that need a buying intent alongside them
    const genericTerms = /\b(phone|mobile|device|handset|cellphone|cell phone)\b/;
    const intentTerms = /\b(recommend|suggest|best|find|buy|need|want|looking|compare|which|what|good|cheap|affordable|budget|under|below|review|top|worth|pick|choose|camera|battery|gaming|display|screen|storage|ram|waterproof|esim|charger)\b|\$\d+/;

    const isRelevant = specificTerms.test(q) || (genericTerms.test(q) && intentTerms.test(q));

    if (!isRelevant) {
      return { relevant: false, weights: { ...DEFAULT_WEIGHTS } };
    }

    const weights = { ...DEFAULT_WEIGHTS };
    const constraints: ExtractionResponse['constraints'] = {};

    if (/camera|photo|photography|portrait|zoom|selfie|picture/.test(q)) {
      weights.camera += 30;
      weights.value -= 10;
      weights.gaming -= 10;
    }
    if (/battery|long.?lasting|all.?day|endurance|standby/.test(q)) {
      weights.battery += 30;
      weights.display -= 10;
      weights.gaming -= 10;
    }
    if (/gaming|game|fps|pubg|fortnite|genshin|performance/.test(q)) {
      weights.gaming += 40;
      weights.performance += 10;
      weights.value -= 20;
      weights.durability -= 10;
    }
    if (/cheap|budget|affordable|value|price|low.?cost|inexpensive/.test(q)) {
      weights.value += 30;
      weights.performance -= 10;
      weights.durability -= 5;
    }
    if (/waterproof|rugged|durable|drop.?proof|tough/.test(q)) {
      weights.durability += 30;
      weights.gaming -= 10;
      weights.value -= 10;
      constraints.requiredFeatures = ['waterproof'];
    }
    if (/screen|display|amoled|oled|refresh/.test(q)) {
      weights.display += 25;
      weights.value -= 10;
    }
    if (/travel|trip|vacation|backpack/.test(q)) {
      weights.camera += 15;
      weights.battery += 15;
      weights.durability += 10;
      weights.gaming -= 15;
    }
    if (/parent|elderly|senior|simple|easy/.test(q)) {
      weights.display += 20;
      weights.value += 15;
      weights.gaming -= 25;
      weights.performance -= 10;
    }

    const pricePatterns = [
      /(?:under|below|less than|max|budget of?|around|about|up to)\s*\$?\s*(\d+)/,
      /(\d+)\s*(?:dollars?|usd)/,
      /\$\s*(\d+)/,
      /(\d+)\s*\$/,
    ];
    for (const pattern of pricePatterns) {
      const m = q.match(pattern);
      if (m?.[1]) {
        constraints.maxPriceUsd = parseInt(m[1], 10);
        break;
      }
    }

    if (/iphone|ios|apple/.test(q)) {
      constraints.operatingSystem = 'iOS';
    } else if (/android|samsung|google|pixel|oneplus|xiaomi/.test(q)) {
      constraints.operatingSystem = 'Android';
    }

    const brands: string[] = [];
    if (/apple|iphone/.test(q)) brands.push('Apple');
    if (/samsung/.test(q)) brands.push('Samsung');
    if (/google|pixel/.test(q)) brands.push('Google');
    if (/oneplus/.test(q)) brands.push('OnePlus');
    if (/xiaomi|redmi|poco/.test(q)) brands.push('Xiaomi');
    if (/nothing/.test(q)) brands.push('Nothing');
    if (/motorola/.test(q)) brands.push('Motorola');
    if (brands.length > 0) constraints.preferredBrands = brands;

    for (const key of Object.keys(weights) as (keyof typeof weights)[]) {
      weights[key] = Math.max(0, weights[key]);
    }

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
      relevant: true,
      weights: normalizedWeights,
      constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
    };
  }
}
