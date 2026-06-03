import type { AiService } from '../../services/ai.service.js';
import type { PhoneRepository } from '../../repositories/phone.repository.js';
import type { PhoneWithScores, RecommendationResult } from '../../types/index.js';
import {
  computeWeightedScore,
  computeRawScore,
  generateExplanation,
  mapWeightKeys,
} from '../../utils/scoring.js';

const SCORE_KEYS_FOR_LOG = [
  'camera',
  'battery',
  'gaming',
  'performance',
  'display',
  'durability',
  'value',
] as const;

export class RecommendationService {
  constructor(
    private readonly repo: PhoneRepository,
    private readonly aiService: AiService,
  ) {}

  async recommend(query: string): Promise<RecommendationResult[]> {
    const { weights, constraints } = await this.aiService.extractWeights(query);

    const mappedWeights = mapWeightKeys(weights);

    let phones = await this.repo.findTopN(200);

    // OS filter
    if (constraints?.operatingSystem) {
      phones = phones.filter((p) => p.operatingSystem === constraints.operatingSystem);
    }

    // Apply filters and get top 5
    const results = this.rankPhones(phones, mappedWeights, constraints, weights);

    // Relax brand constraint if fewer than 2 results
    if (results.length < 2 && constraints?.preferredBrands?.length) {
      const relaxed = this.rankPhones(phones, mappedWeights, { ...constraints, preferredBrands: [] }, weights);
      return relaxed;
    }

    return results;
  }

  private rankPhones(
    phones: PhoneWithScores[],
    mappedWeights: ReturnType<typeof mapWeightKeys>,
    constraints: Record<string, unknown> | undefined,
    _rawWeights: Record<string, number>,
  ): RecommendationResult[] {
    let filtered = [...phones];

    // Price filters
    const maxPrice = (constraints as Record<string, unknown> | undefined)?.['maxPriceUsd'];
    const minPrice = (constraints as Record<string, unknown> | undefined)?.['minPriceUsd'];
    if (typeof maxPrice === 'number') {
      filtered = filtered.filter((p) => p.priceUsd <= maxPrice);
    }
    if (typeof minPrice === 'number') {
      filtered = filtered.filter((p) => p.priceUsd >= minPrice);
    }

    // Brand preference filter
    const preferredBrands = (constraints as Record<string, unknown> | undefined)?.['preferredBrands'];
    if (Array.isArray(preferredBrands) && preferredBrands.length > 0) {
      const brandSet = new Set((preferredBrands as string[]).map((b) => b.toLowerCase()));
      filtered = filtered.filter((p) => brandSet.has(p.brand.toLowerCase()));
    }

    // Required features
    const requiredFeatures = (constraints as Record<string, unknown> | undefined)?.['requiredFeatures'];
    if (Array.isArray(requiredFeatures)) {
      for (const feature of requiredFeatures as string[]) {
        if (feature === 'esim') {
          filtered = filtered.filter((p) => p.esimSupport);
        }
        if (feature === 'waterproof') {
          filtered = filtered.filter((p) => p.waterproofRating !== null && p.waterproofRating !== '');
        }
      }
    }

    // Score and rank — sort by raw (unrounded) score for precision, display rounded score
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

  getScoreBreakdown(weights: Record<string, number>): Record<string, number> {
    const breakdown: Record<string, number> = {};
    for (const key of SCORE_KEYS_FOR_LOG) {
      if (weights[key] !== undefined) breakdown[key] = weights[key] ?? 0;
    }
    return breakdown;
  }
}
