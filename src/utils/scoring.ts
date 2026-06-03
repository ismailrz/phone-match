import type { PhoneScores, PhoneWithScores, ScoreKey, Weights } from '../types/index.js';

const SCORE_KEY_MAP: Record<string, ScoreKey> = {
  camera: 'cameraScore',
  battery: 'batteryScore',
  gaming: 'gamingScore',
  performance: 'performanceScore',
  display: 'displayScore',
  durability: 'durabilityScore',
  value: 'valueScore',
};

export function mapWeightKeys(rawWeights: Partial<Record<string, number>>): Partial<PhoneScores> {
  const mapped: Partial<PhoneScores> = {};
  for (const [key, weight] of Object.entries(rawWeights)) {
    const scoreKey = SCORE_KEY_MAP[key];
    if (scoreKey !== undefined && typeof weight === 'number') {
      mapped[scoreKey] = weight;
    }
  }
  return mapped;
}

export function normalizeWeights(weights: Partial<Record<string, number>>): Record<string, number> {
  let total = 0;
  for (const w of Object.values(weights)) {
    total += w ?? 0;
  }
  if (total === 0) return { ...weights } as Record<string, number>;
  const normalized: Record<string, number> = {};
  for (const [key, weight] of Object.entries(weights)) {
    normalized[key] = Math.round(((weight ?? 0) / total) * 100);
  }
  return normalized;
}

export function computeWeightedScore(
  scores: PhoneScores,
  weights: Partial<PhoneScores>,
): number {
  let totalScore = 0;
  let totalWeight = 0;

  const entries = Object.entries(weights) as [ScoreKey, number | undefined][];
  for (const [key, weight] of entries) {
    if (weight !== undefined && weight > 0) {
      totalScore += scores[key] * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

export function computeRawScore(
  scores: PhoneScores,
  weights: Partial<PhoneScores>,
): number {
  let totalScore = 0;
  let totalWeight = 0;

  const entries = Object.entries(weights) as [ScoreKey, number | undefined][];
  for (const [key, weight] of entries) {
    if (weight !== undefined && weight > 0) {
      totalScore += scores[key] * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

export function generateExplanation(
  phone: PhoneWithScores,
  weights: Partial<PhoneScores>,
  finalScore: number,
): string {
  const { scores } = phone;
  const name = `${phone.brand} ${phone.model}`;

  const highlights: string[] = [];

  const dimensionLabels: [ScoreKey, string][] = [
    ['cameraScore', 'camera'],
    ['batteryScore', 'battery life'],
    ['gamingScore', 'gaming'],
    ['performanceScore', 'performance'],
    ['displayScore', 'display'],
    ['durabilityScore', 'durability'],
    ['valueScore', 'value'],
  ];

  const sortedDimensions = dimensionLabels
    .filter(([key]) => (weights[key] ?? 0) > 0)
    .sort(([aKey], [bKey]) => (weights[bKey] ?? 0) - (weights[aKey] ?? 0));

  for (const [key, label] of sortedDimensions.slice(0, 3)) {
    const score = scores[key];
    if (score >= 85) highlights.push(`excellent ${label} (${score}/100)`);
    else if (score >= 70) highlights.push(`good ${label} (${score}/100)`);
    else highlights.push(`${label} (${score}/100)`);
  }

  const priceNote = `$${phone.priceUsd}`;
  const highlightText = highlights.length > 0 ? `, featuring ${highlights.join(', ')}` : '';

  return `${name} scores ${finalScore}/100 for your requirements${highlightText}. Priced at ${priceNote}.`;
}

export function buildDefaultWeights(): Weights {
  return {
    cameraScore: 20,
    batteryScore: 20,
    gamingScore: 10,
    performanceScore: 20,
    displayScore: 15,
    durabilityScore: 5,
    valueScore: 10,
  };
}
