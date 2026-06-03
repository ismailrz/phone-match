import { describe, it, expect } from 'vitest';
import {
  computeWeightedScore,
  normalizeWeights,
  generateExplanation,
  mapWeightKeys,
  buildDefaultWeights,
} from '../src/utils/scoring.js';
import type { PhoneScores, PhoneWithScores } from '../src/types/index.js';

const baseScores: PhoneScores = {
  cameraScore: 80,
  batteryScore: 70,
  gamingScore: 60,
  performanceScore: 75,
  displayScore: 85,
  durabilityScore: 65,
  valueScore: 90,
};

function makePhone(overrides: Partial<PhoneWithScores> = {}): PhoneWithScores {
  return {
    id: 1,
    brand: 'Test',
    model: 'Phone X',
    releaseYear: 2024,
    priceUsd: 500,
    operatingSystem: 'Android',
    chipset: 'Test Chip',
    ram: 8,
    storage: 128,
    batteryMah: 5000,
    chargingWatt: 45,
    displaySize: 6.5,
    displayType: 'AMOLED',
    refreshRate: 120,
    waterproofRating: 'IP68',
    esimSupport: true,
    createdAt: new Date(),
    scores: baseScores,
    ...overrides,
  };
}

describe('computeWeightedScore', () => {
  it('returns correct score with equal weights', () => {
    const weights: Partial<PhoneScores> = {
      cameraScore: 1,
      batteryScore: 1,
      gamingScore: 1,
      performanceScore: 1,
      displayScore: 1,
      durabilityScore: 1,
      valueScore: 1,
    };
    // (80+70+60+75+85+65+90)/7 = 525/7 = 75
    expect(computeWeightedScore(baseScores, weights)).toBe(75);
  });

  it('ignores dimensions with zero weight', () => {
    const weights: Partial<PhoneScores> = {
      cameraScore: 0,
      batteryScore: 1,
    };
    expect(computeWeightedScore(baseScores, weights)).toBe(70);
  });

  it('handles partial weights (only some dimensions)', () => {
    const weights: Partial<PhoneScores> = {
      cameraScore: 50,
      batteryScore: 50,
    };
    // (80*50 + 70*50) / 100 = 75
    expect(computeWeightedScore(baseScores, weights)).toBe(75);
  });

  it('returns 0 when all weights are zero', () => {
    const weights: Partial<PhoneScores> = {
      cameraScore: 0,
      batteryScore: 0,
    };
    expect(computeWeightedScore(baseScores, weights)).toBe(0);
  });

  it('returns 0 for empty weights', () => {
    expect(computeWeightedScore(baseScores, {})).toBe(0);
  });

  it('correctly applies high camera weight', () => {
    const weights: Partial<PhoneScores> = {
      cameraScore: 80,
      valueScore: 20,
    };
    // (80*80 + 90*20) / 100 = (6400 + 1800) / 100 = 82
    expect(computeWeightedScore(baseScores, weights)).toBe(82);
  });

  it('rounds to integer', () => {
    const scores: PhoneScores = {
      ...baseScores,
      cameraScore: 100,
      batteryScore: 99,
    };
    const weights: Partial<PhoneScores> = {
      cameraScore: 1,
      batteryScore: 2,
    };
    // (100*1 + 99*2) / 3 = 298/3 = 99.33... → rounds to 99
    expect(computeWeightedScore(scores, weights)).toBe(99);
  });

  it('handles a single dimension', () => {
    const weights: Partial<PhoneScores> = { displayScore: 100 };
    expect(computeWeightedScore(baseScores, weights)).toBe(85);
  });
});

describe('normalizeWeights', () => {
  it('normalizes weights to sum to 100', () => {
    const weights = { camera: 3, battery: 2 };
    const result = normalizeWeights(weights);
    expect(result['camera']).toBe(60);
    expect(result['battery']).toBe(40);
  });

  it('handles already-normalized weights', () => {
    const weights = { camera: 50, battery: 50 };
    const result = normalizeWeights(weights);
    expect(result['camera']).toBe(50);
    expect(result['battery']).toBe(50);
  });

  it('returns copy with zeros when all weights are zero', () => {
    const weights = { camera: 0, battery: 0 };
    const result = normalizeWeights(weights);
    expect(result['camera']).toBe(0);
    expect(result['battery']).toBe(0);
  });

  it('handles single weight', () => {
    const weights = { camera: 5 };
    const result = normalizeWeights(weights);
    expect(result['camera']).toBe(100);
  });
});

describe('mapWeightKeys', () => {
  it('maps human-readable keys to score keys', () => {
    const result = mapWeightKeys({ camera: 50, battery: 30, value: 20 });
    expect(result.cameraScore).toBe(50);
    expect(result.batteryScore).toBe(30);
    expect(result.valueScore).toBe(20);
  });

  it('ignores unknown keys', () => {
    const result = mapWeightKeys({ camera: 50, unknown_key: 30 });
    expect(result.cameraScore).toBe(50);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('maps all 7 dimensions', () => {
    const result = mapWeightKeys({
      camera: 10, battery: 15, gaming: 20,
      performance: 25, display: 10, durability: 10, value: 10,
    });
    expect(Object.keys(result)).toHaveLength(7);
    expect(result.gamingScore).toBe(20);
    expect(result.performanceScore).toBe(25);
  });
});

describe('generateExplanation', () => {
  it('includes phone name and score', () => {
    const phone = makePhone();
    const weights: Partial<PhoneScores> = { cameraScore: 70, batteryScore: 30 };
    const explanation = generateExplanation(phone, weights, 77);
    expect(explanation).toContain('Test Phone X');
    expect(explanation).toContain('77/100');
  });

  it('includes price', () => {
    const phone = makePhone({ priceUsd: 699 });
    const weights: Partial<PhoneScores> = { cameraScore: 100 };
    const explanation = generateExplanation(phone, weights, 80);
    expect(explanation).toContain('$699');
  });

  it('mentions excellent scores', () => {
    const phone = makePhone({ scores: { ...baseScores, cameraScore: 95 } });
    const weights: Partial<PhoneScores> = { cameraScore: 100 };
    const explanation = generateExplanation(phone, weights, 95);
    expect(explanation).toContain('excellent');
  });

  it('handles empty weights gracefully', () => {
    const phone = makePhone();
    const explanation = generateExplanation(phone, {}, 0);
    expect(explanation).toContain('Test Phone X');
    expect(explanation).toContain('0/100');
  });
});

describe('buildDefaultWeights', () => {
  it('returns weights summing to 100', () => {
    const weights = buildDefaultWeights();
    const sum = Object.values(weights)
      .filter((v): v is number => typeof v === 'number')
      .reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });
});
