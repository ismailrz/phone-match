import type { AiService } from '../../services/ai.service.js';
import type { PhoneRepository } from '../../repositories/phone.repository.js';
import type { PhoneWithScores, RecommendationResult } from '../../types/index.js';
import type { ExtractionResponse } from '../../prompts/extraction.prompt.js';
import {
  computeWeightedScore,
  computeRawScore,
  generateExplanation,
  mapWeightKeys,
} from '../../utils/scoring.js';

type Constraints = NonNullable<ExtractionResponse['constraints']>;

export class RecommendationService {
  constructor(
    private readonly repo: PhoneRepository,
    private readonly aiService: AiService,
  ) {}

  async recommend(query: string): Promise<RecommendationResult[]> {
    const { relevant, weights, constraints } = await this.aiService.extractWeights(query);

    if (relevant === false) {
      return [];
    }

    const mappedWeights = mapWeightKeys(weights);

    let phones = await this.repo.findTopN(200);

    // OS filter
    if (constraints?.operatingSystem) {
      phones = phones.filter((p) => p.operatingSystem === constraints.operatingSystem);
    }

    // Apply filters and get top 5
    const results = this.rankPhones(phones, mappedWeights, constraints);

    // Relax brand constraint if fewer than 2 results
    if (results.length < 2 && constraints?.preferredBrands?.length) {
      return this.rankPhones(phones, mappedWeights, { ...constraints, preferredBrands: [] });
    }

    // If budget is set but nothing found, return cheapest phones as suggestions
    if (results.length === 0 && constraints?.maxPriceUsd != null) {
      const sorted = [...phones].sort((a, b) => a.priceUsd - b.priceUsd).slice(0, 5);
      return sorted.map((phone, index) => ({
        rank: index + 1,
        phone,
        finalScore: computeWeightedScore(phone.scores, mappedWeights),
        explanation: `No phones found under $${constraints.maxPriceUsd}. The most affordable option is ${phone.brand} ${phone.model} at $${phone.priceUsd}.`,
      }));
    }

    return results;
  }

  private rankPhones(
    phones: PhoneWithScores[],
    mappedWeights: ReturnType<typeof mapWeightKeys>,
    constraints: Constraints | undefined,
  ): RecommendationResult[] {
    let filtered = [...phones];

    const maxPrice = constraints?.maxPriceUsd;
    const minPrice = constraints?.minPriceUsd;
    if (typeof maxPrice === 'number') {
      filtered = filtered.filter((p) => p.priceUsd <= maxPrice);
    }
    if (typeof minPrice === 'number') {
      filtered = filtered.filter((p) => p.priceUsd >= minPrice);
    }

    const preferredBrands = constraints?.preferredBrands;
    if (preferredBrands && preferredBrands.length > 0) {
      const brandSet = new Set(preferredBrands.map((b) => b.toLowerCase()));
      filtered = filtered.filter((p) => brandSet.has(p.brand.toLowerCase()));
    }

    const requiredFeatures = constraints?.requiredFeatures;
    if (requiredFeatures) {
      for (const feature of requiredFeatures) {
        if (feature === 'esim') {
          filtered = filtered.filter((p) => p.esimSupport);
        }
        if (feature === 'waterproof') {
          filtered = filtered.filter((p) => p.waterproofRating !== null && p.waterproofRating !== '');
        }
      }
    }

    // Sort by raw (unrounded) score for tie-breaking precision
    const scored = filtered.map((phone) => ({
      phone,
      rawScore: computeRawScore(phone.scores, mappedWeights),
      finalScore: computeWeightedScore(phone.scores, mappedWeights),
    }));

    scored.sort((a, b) => b.rawScore - a.rawScore);

    return scored.slice(0, 5).map(({ phone, finalScore }, index) => ({
      rank: index + 1,
      phone,
      finalScore,
      explanation: generateExplanation(phone, mappedWeights, finalScore),
    }));
  }
}
