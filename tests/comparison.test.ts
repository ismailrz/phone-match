import { describe, it, expect, vi } from 'vitest';
import { ComparisonService } from '../src/modules/comparisons/comparison.service.js';
import { NotFoundError } from '../src/types/index.js';
import type { PhoneWithScores } from '../src/types/index.js';
import type { PhoneRepository } from '../src/repositories/phone.repository.js';

function makePhone(
  id: number,
  brand: string,
  model: string,
  scores: Partial<PhoneWithScores['scores']> = {},
): PhoneWithScores {
  return {
    id,
    brand,
    model,
    releaseYear: 2024,
    priceUsd: 999,
    operatingSystem: 'Android',
    chipset: 'Test Chip',
    ram: 12,
    storage: 256,
    batteryMah: 5000,
    chargingWatt: 45,
    displaySize: 6.7,
    displayType: 'AMOLED',
    refreshRate: 120,
    waterproofRating: 'IP68',
    esimSupport: true,
    createdAt: new Date(),
    scores: {
      cameraScore: 80,
      batteryScore: 80,
      gamingScore: 80,
      performanceScore: 80,
      displayScore: 80,
      durabilityScore: 80,
      valueScore: 80,
      ...scores,
    },
  };
}

function mockRepo(resolveMap: Record<string, PhoneWithScores | null>) {
  return {
    findByNames: vi.fn().mockImplementation((names: string[]) =>
      Promise.resolve(names.map((n) => resolveMap[n] ?? null)),
    ),
    findAll: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    search: vi.fn(),
    findTopN: vi.fn(),
  } as unknown as PhoneRepository;
}

const IPHONE = makePhone(1, 'Apple', 'iPhone 17 Pro Max', {
  cameraScore: 98,
  batteryScore: 82,
  gamingScore: 88,
  performanceScore: 99,
  displayScore: 97,
  durabilityScore: 92,
  valueScore: 58,
});

const GALAXY = makePhone(2, 'Samsung', 'Galaxy S25 Ultra', {
  cameraScore: 97,
  batteryScore: 88,
  gamingScore: 94,
  performanceScore: 98,
  displayScore: 99,
  durabilityScore: 93,
  valueScore: 58,
});

const PIXEL = makePhone(3, 'Google', 'Pixel 9 Pro', {
  cameraScore: 99,
  batteryScore: 84,
  gamingScore: 77,
  performanceScore: 95,
  displayScore: 94,
  durabilityScore: 85,
  valueScore: 64,
});

describe('ComparisonService', () => {
  describe('compare()', () => {
    it('returns both phones in result', async () => {
      const repo = mockRepo({ 'iPhone 17 Pro Max': IPHONE, 'Galaxy S25 Ultra': GALAXY });
      const service = new ComparisonService(repo);

      const result = await service.compare(['iPhone 17 Pro Max', 'Galaxy S25 Ultra']);

      expect(result.phones).toHaveLength(2);
      expect(result.phones.map((p) => p.model)).toContain('iPhone 17 Pro Max');
      expect(result.phones.map((p) => p.model)).toContain('Galaxy S25 Ultra');
    });

    it('selects correct winner by average score', async () => {
      // GALAXY avg: (97+88+94+98+99+93+58)/7 = 627/7 ≈ 89.57
      // IPHONE avg: (98+82+88+99+97+92+58)/7 = 614/7 ≈ 87.71
      const repo = mockRepo({ 'iPhone 17 Pro Max': IPHONE, 'Galaxy S25 Ultra': GALAXY });
      const service = new ComparisonService(repo);

      const result = await service.compare(['iPhone 17 Pro Max', 'Galaxy S25 Ultra']);
      expect(result.winner.model).toBe('Galaxy S25 Ultra');
    });

    it('throws NotFoundError when a phone is not found', async () => {
      const repo = mockRepo({ 'iPhone 17 Pro Max': IPHONE, 'Unknown Phone': null });
      const service = new ComparisonService(repo);

      await expect(
        service.compare(['iPhone 17 Pro Max', 'Unknown Phone']),
      ).rejects.toThrow(NotFoundError);
    });

    it('returns 7 analysis entries (one per dimension)', async () => {
      const repo = mockRepo({ 'iPhone 17 Pro Max': IPHONE, 'Galaxy S25 Ultra': GALAXY });
      const service = new ComparisonService(repo);

      const result = await service.compare(['iPhone 17 Pro Max', 'Galaxy S25 Ultra']);
      expect(result.analysis).toHaveLength(7);
    });

    it('handles 3-phone comparison', async () => {
      const repo = mockRepo({
        'iPhone 17 Pro Max': IPHONE,
        'Galaxy S25 Ultra': GALAXY,
        'Pixel 9 Pro': PIXEL,
      });
      const service = new ComparisonService(repo);

      const result = await service.compare(['iPhone 17 Pro Max', 'Galaxy S25 Ultra', 'Pixel 9 Pro']);
      expect(result.phones).toHaveLength(3);
      expect(result.winner).toBeDefined();
    });

    it('first phone wins on exact tie', async () => {
      const phone1 = makePhone(1, 'Brand A', 'Model 1', { cameraScore: 80 });
      const phone2 = makePhone(2, 'Brand B', 'Model 2', { cameraScore: 80 });

      const repo = mockRepo({ 'Model 1': phone1, 'Model 2': phone2 });
      const service = new ComparisonService(repo);

      const result = await service.compare(['Model 1', 'Model 2']);
      expect(result.winner.model).toBe('Model 1');
    });

    it('analysis entries mention leading phone name', async () => {
      const repo = mockRepo({ 'iPhone 17 Pro Max': IPHONE, 'Galaxy S25 Ultra': GALAXY });
      const service = new ComparisonService(repo);

      const result = await service.compare(['iPhone 17 Pro Max', 'Galaxy S25 Ultra']);

      for (const entry of result.analysis) {
        expect(typeof entry).toBe('string');
        expect(entry.length).toBeGreaterThan(0);
      }
    });

    it('calls findByNames with all phone names', async () => {
      const repo = mockRepo({ 'iPhone 17 Pro Max': IPHONE, 'Galaxy S25 Ultra': GALAXY });
      const service = new ComparisonService(repo);

      await service.compare(['iPhone 17 Pro Max', 'Galaxy S25 Ultra']);
      expect(repo.findByNames).toHaveBeenCalledWith(['iPhone 17 Pro Max', 'Galaxy S25 Ultra']);
    });
  });
});
