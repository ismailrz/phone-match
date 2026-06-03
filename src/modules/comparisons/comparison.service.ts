import type { PhoneRepository } from '../../repositories/phone.repository.js';
import { NotFoundError } from '../../types/index.js';
import type { ComparisonResult, PhoneScores, PhoneWithScores, ScoreKey } from '../../types/index.js';

const SCORE_DIMENSIONS: [ScoreKey, string][] = [
  ['cameraScore', 'Camera'],
  ['batteryScore', 'Battery Life'],
  ['gamingScore', 'Gaming'],
  ['performanceScore', 'Performance'],
  ['displayScore', 'Display'],
  ['durabilityScore', 'Durability'],
  ['valueScore', 'Value for Money'],
];

function averageScore(scores: PhoneScores): number {
  const keys = Object.keys(scores) as ScoreKey[];
  const sum = keys.reduce((acc, k) => acc + scores[k], 0);
  return sum / keys.length;
}

export class ComparisonService {
  constructor(private readonly repo: PhoneRepository) {}

  async compare(phoneNames: string[]): Promise<ComparisonResult> {
    const found = await this.repo.findByNames(phoneNames);

    const phones: PhoneWithScores[] = [];
    for (let i = 0; i < found.length; i++) {
      const phone = found[i];
      if (!phone) {
        throw new NotFoundError(
          `Phone "${phoneNames[i]}" not found. Try searching with /search_phone first.`,
        );
      }
      phones.push(phone);
    }

    // Determine winner by average score across all dimensions (tiebreaker: first phone)
    let winner = phones[0]!;
    let winnerAvg = averageScore(winner.scores);
    for (let i = 1; i < phones.length; i++) {
      const avg = averageScore(phones[i]!.scores);
      if (avg > winnerAvg) {
        winner = phones[i]!;
        winnerAvg = avg;
      }
    }

    const analysis = SCORE_DIMENSIONS.map(([key, label]) => {
      const scores = phones.map((p) => ({ name: `${p.brand} ${p.model}`, score: p.scores[key] }));
      scores.sort((a, b) => b.score - a.score);
      const leader = scores[0]!;
      const scoreList = scores.map((s) => `${s.name}: ${s.score}`).join(', ');
      return `${label}: ${leader.name} leads (${scoreList})`;
    });

    return { phones, winner, analysis };
  }
}
