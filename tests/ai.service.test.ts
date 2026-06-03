import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock config before any module imports that transitively load it
vi.mock('../src/config/index.js', () => ({
  config: {
    ANTHROPIC_API_KEY: undefined,
    GEMINI_API_KEY: undefined,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    PORT: 3000,
    NODE_ENV: 'test' as const,
    LOG_LEVEL: 'info' as const,
  },
}));

const mockLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  trace: () => {},
  fatal: () => {},
  child: () => mockLogger,
} as unknown as import('fastify').FastifyBaseLogger;

import { AiService } from '../src/services/ai.service.js';

describe('AiService (keyword extraction fallback)', () => {
  let service: AiService;

  beforeEach(() => {
    service = new AiService(mockLogger);
  });

  describe('extractWeights()', () => {
    it('returns valid weights summing to ~100 for camera query', async () => {
      const result = await service.extractWeights('best camera phone for travel photography');
      const sum = Object.values(result.weights).reduce((a, b) => a + b, 0);
      expect(sum).toBeGreaterThan(90);
      expect(sum).toBeLessThanOrEqual(110);
      expect(result.weights.camera).toBeGreaterThan(result.weights.gaming);
    });

    it('boosts battery weight for battery queries', async () => {
      const result = await service.extractWeights('phone with great battery life for all-day use');
      expect(result.weights.battery).toBeGreaterThan(result.weights.camera);
    });

    it('boosts gaming weight for gaming queries', async () => {
      const result = await service.extractWeights('best gaming phone for PUBG and fps games');
      expect(result.weights.gaming).toBeGreaterThanOrEqual(result.weights.camera);
    });

    it('boosts value weight and sets price for budget queries', async () => {
      const result = await service.extractWeights('cheap budget phone under $300');
      expect(result.weights.value).toBeGreaterThan(0);
      expect(result.constraints?.maxPriceUsd).toBe(300);
    });

    it('boosts durability weight for waterproof queries', async () => {
      const result = await service.extractWeights('waterproof rugged phone for outdoor use');
      expect(result.weights.durability).toBeGreaterThan(0);
      expect(result.constraints?.requiredFeatures).toContain('waterproof');
    });

    it('extracts iOS OS constraint from iPhone mention', async () => {
      const result = await service.extractWeights('best iPhone for photos');
      expect(result.constraints?.operatingSystem).toBe('iOS');
    });

    it('extracts Android OS constraint from Samsung mention', async () => {
      const result = await service.extractWeights('best Samsung android phone');
      expect(result.constraints?.operatingSystem).toBe('Android');
    });

    it('extracts price from "under $X" pattern', async () => {
      const result = await service.extractWeights('good phone under $500');
      expect(result.constraints?.maxPriceUsd).toBe(500);
    });

    it('extracts price from "less than" pattern', async () => {
      const result = await service.extractWeights('phone less than $700');
      expect(result.constraints?.maxPriceUsd).toBe(700);
    });

    it('rejects "I am mobile" as not phone-related', async () => {
      const result = await service.extractWeights('I am mobile');
      expect(result.relevant).toBe(false);
    });

    it('rejects "my phone is ringing" as not phone-shopping', async () => {
      const result = await service.extractWeights('my phone is ringing');
      expect(result.relevant).toBe(false);
    });

    it('rejects random gibberish', async () => {
      const result = await service.extractWeights('asdfghjkl qwerty');
      expect(result.relevant).toBe(false);
    });

    it('rejects unrelated topics', async () => {
      const result = await service.extractWeights('what is the weather today');
      expect(result.relevant).toBe(false);
    });

    it('accepts "best camera phone" as relevant', async () => {
      const result = await service.extractWeights('best camera phone under $800');
      expect(result.relevant).toBe(true);
    });

    it('accepts "is there a phone under $300" as relevant', async () => {
      const result = await service.extractWeights('is there a phone under $300');
      expect(result.relevant).toBe(true);
    });

    it('accepts brand names without extra intent as relevant', async () => {
      const result = await service.extractWeights('Samsung Galaxy S25');
      expect(result.relevant).toBe(true);
    });

    it('all returned weights are non-negative', async () => {
      const result = await service.extractWeights('gaming phone with long battery and great camera');
      for (const [key, val] of Object.entries(result.weights)) {
        expect(val, `${key} should be non-negative`).toBeGreaterThanOrEqual(0);
      }
    });

    it('boosts display weight for screen queries', async () => {
      const result = await service.extractWeights('best AMOLED display phone with high refresh rate');
      expect(result.weights.display).toBeGreaterThan(0);
    });

    it('extracts Apple brand preference', async () => {
      const result = await service.extractWeights('recommend an Apple iPhone');
      expect(result.constraints?.preferredBrands).toContain('Apple');
    });

    it('travel query boosts camera and battery', async () => {
      const result = await service.extractWeights('phone for travel backpacking');
      expect(result.weights.camera).toBeGreaterThan(result.weights.gaming);
      expect(result.weights.battery).toBeGreaterThan(result.weights.gaming);
    });

    it('parents query boosts display and value', async () => {
      const result = await service.extractWeights('phone for my elderly parents with large screen');
      expect(result.weights.display).toBeGreaterThan(result.weights.gaming);
    });
  });
});
