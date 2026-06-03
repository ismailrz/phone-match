import { describe, it, expect, vi } from 'vitest';
import { RecommendationService } from '../src/modules/recommendations/recommendation.service.js';
import type { PhoneWithScores } from '../src/types/index.js';
import type { PhoneRepository } from '../src/repositories/phone.repository.js';
import type { AiService } from '../src/services/ai.service.js';
import type { ExtractionResponse } from '../src/prompts/extraction.prompt.js';

function makePhone(
  id: number,
  brand: string,
  model: string,
  priceUsd: number,
  scores: Partial<PhoneWithScores['scores']> = {},
  os = 'Android',
): PhoneWithScores {
  return {
    id,
    brand,
    model,
    releaseYear: 2024,
    priceUsd,
    operatingSystem: os,
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
    scores: {
      cameraScore: 70,
      batteryScore: 70,
      gamingScore: 70,
      performanceScore: 70,
      displayScore: 70,
      durabilityScore: 70,
      valueScore: 70,
      ...scores,
    },
  };
}

function mockRepo(phones: PhoneWithScores[]) {
  return {
    findTopN: vi.fn().mockResolvedValue(phones),
    findAll: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    findByNames: vi.fn(),
    search: vi.fn(),
  } as unknown as PhoneRepository;
}

function mockAi(response: ExtractionResponse) {
  return {
    extractWeights: vi.fn().mockResolvedValue(response),
  } as unknown as AiService;
}

const CAMERA_RESPONSE: ExtractionResponse = {
  weights: { camera: 60, battery: 10, gaming: 5, performance: 10, display: 10, durability: 0, value: 5 },
};

const BATTERY_RESPONSE: ExtractionResponse = {
  weights: { camera: 5, battery: 70, gaming: 5, performance: 5, display: 5, durability: 5, value: 5 },
};

describe('RecommendationService', () => {
  describe('recommend()', () => {
    it('returns top 5 phones ranked by camera score for camera query', async () => {
      const phones = [
        makePhone(1, 'Apple', 'iPhone 17 Pro Max', 1099, { cameraScore: 98 }),
        makePhone(2, 'Google', 'Pixel 9 Pro', 999, { cameraScore: 96 }),
        makePhone(3, 'Samsung', 'Galaxy S25 Ultra', 1299, { cameraScore: 97 }),
        makePhone(4, 'Xiaomi', 'Xiaomi 15', 899, { cameraScore: 89 }),
        makePhone(5, 'OnePlus', 'OnePlus 13', 799, { cameraScore: 85 }),
        makePhone(6, 'Nothing', 'Nothing Phone 3a', 379, { cameraScore: 75 }),
      ];

      const service = new RecommendationService(mockRepo(phones), mockAi(CAMERA_RESPONSE));
      const results = await service.recommend('best camera phone');

      expect(results).toHaveLength(5);
      expect(results[0]!.phone.model).toBe('iPhone 17 Pro Max');
      expect(results[0]!.rank).toBe(1);
      expect(results[1]!.phone.model).toBe('Galaxy S25 Ultra');
      expect(results[2]!.phone.model).toBe('Pixel 9 Pro');
    });

    it('filters by maxPriceUsd constraint', async () => {
      const phones = [
        makePhone(1, 'Apple', 'iPhone 17 Pro Max', 1099, { cameraScore: 98 }),
        makePhone(2, 'Google', 'Pixel 9a', 499, { cameraScore: 88 }),
        makePhone(3, 'Nothing', 'Nothing Phone 3a', 379, { cameraScore: 78 }),
      ];

      const response: ExtractionResponse = {
        ...CAMERA_RESPONSE,
        constraints: { maxPriceUsd: 500 },
      };

      const service = new RecommendationService(mockRepo(phones), mockAi(response));
      const results = await service.recommend('best camera phone under $500');

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.phone.priceUsd <= 500)).toBe(true);
      expect(results[0]!.phone.model).toBe('Pixel 9a');
    });

    it('filters by operatingSystem constraint', async () => {
      const phones = [
        makePhone(1, 'Apple', 'iPhone 17 Pro', 1099, {}, 'iOS'),
        makePhone(2, 'Samsung', 'Galaxy S25', 799, {}, 'Android'),
        makePhone(3, 'Google', 'Pixel 9', 799, {}, 'Android'),
      ];

      const response: ExtractionResponse = {
        ...CAMERA_RESPONSE,
        constraints: { operatingSystem: 'iOS' },
      };

      const service = new RecommendationService(mockRepo(phones), mockAi(response));
      const results = await service.recommend('best iPhone camera');

      expect(results).toHaveLength(1);
      expect(results[0]!.phone.operatingSystem).toBe('iOS');
    });

    it('returns cheapest phones as suggestions when no phones match budget', async () => {
      const phones = [
        makePhone(1, 'Apple', 'iPhone 17 Pro Max', 1099),
        makePhone(2, 'Samsung', 'Galaxy S25 Ultra', 1299),
      ];

      const response: ExtractionResponse = {
        ...BATTERY_RESPONSE,
        constraints: { maxPriceUsd: 200 },
      };

      const service = new RecommendationService(mockRepo(phones), mockAi(response));
      const results = await service.recommend('best battery phone under $200');

      // Should return cheapest alternatives with explanatory message
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]!.explanation).toContain('No phones found under $200');
    });

    it('returns empty array when database is empty', async () => {
      const service = new RecommendationService(mockRepo([]), mockAi(CAMERA_RESPONSE));
      const results = await service.recommend('best camera phone');
      expect(results).toHaveLength(0);
    });

    it('ranks by battery score for battery query', async () => {
      const phones = [
        makePhone(1, 'Motorola', 'Moto G Power 5G', 249, { batteryScore: 95 }),
        makePhone(2, 'OnePlus', 'OnePlus 13', 899, { batteryScore: 93 }),
        makePhone(3, 'Apple', 'iPhone 17', 799, { batteryScore: 72 }),
      ];

      const service = new RecommendationService(mockRepo(phones), mockAi(BATTERY_RESPONSE));
      const results = await service.recommend('best battery life phone');

      expect(results[0]!.phone.model).toBe('Moto G Power 5G');
      expect(results[1]!.phone.model).toBe('OnePlus 13');
    });

    it('includes explanation in each result', async () => {
      const phones = [makePhone(1, 'Test', 'Model A', 500)];
      const service = new RecommendationService(mockRepo(phones), mockAi(CAMERA_RESPONSE));
      const results = await service.recommend('camera phone');

      expect(results[0]!.explanation).toBeTruthy();
      expect(typeof results[0]!.explanation).toBe('string');
    });

    it('assigns correct rank numbers', async () => {
      const phones = Array.from({ length: 5 }, (_, i) =>
        makePhone(i + 1, 'Brand', `Model ${i + 1}`, 500, { cameraScore: 90 - i * 5 }),
      );

      const service = new RecommendationService(mockRepo(phones), mockAi(CAMERA_RESPONSE));
      const results = await service.recommend('camera phone');

      results.forEach((r, i) => {
        expect(r.rank).toBe(i + 1);
      });
    });

    it('filters esim required feature', async () => {
      const withEsim = makePhone(1, 'Apple', 'iPhone 17', 799, {});
      withEsim.esimSupport = true;
      const withoutEsim = makePhone(2, 'Samsung', 'Galaxy A25', 249, {});
      withoutEsim.esimSupport = false;

      const response: ExtractionResponse = {
        ...CAMERA_RESPONSE,
        constraints: { requiredFeatures: ['esim'] },
      };

      const service = new RecommendationService(mockRepo([withEsim, withoutEsim]), mockAi(response));
      const results = await service.recommend('esim phone');

      expect(results).toHaveLength(1);
      expect(results[0]!.phone.esimSupport).toBe(true);
    });
  });
});
