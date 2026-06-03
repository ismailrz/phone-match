import { describe, it, expect, vi } from 'vitest';
import { SearchService } from '../src/modules/search/search.service.js';
import type { PhoneWithScores, SearchFilters } from '../src/types/index.js';
import type { PhoneRepository } from '../src/repositories/phone.repository.js';

function makePhone(
  id: number,
  brand: string,
  model: string,
  priceUsd: number,
  os: string,
  ram = 8,
  storage = 128,
): PhoneWithScores {
  return {
    id,
    brand,
    model,
    releaseYear: 2024,
    priceUsd,
    operatingSystem: os,
    chipset: 'Test Chip',
    ram,
    storage,
    batteryMah: 5000,
    chargingWatt: 45,
    displaySize: 6.5,
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
    },
  };
}

const TEST_PHONES: PhoneWithScores[] = [
  makePhone(1, 'Apple', 'iPhone 17 Pro Max', 1099, 'iOS', 12, 256),
  makePhone(2, 'Apple', 'iPhone 16', 699, 'iOS', 8, 128),
  makePhone(3, 'Samsung', 'Galaxy S25 Ultra', 1299, 'Android', 12, 256),
  makePhone(4, 'Samsung', 'Galaxy A35', 349, 'Android', 6, 128),
  makePhone(5, 'Google', 'Pixel 9 Pro', 999, 'Android', 16, 256),
  makePhone(6, 'Nothing', 'Phone 3a', 379, 'Android', 8, 128),
];

function mockRepo(results: PhoneWithScores[]) {
  return {
    search: vi.fn().mockResolvedValue(results),
    findAll: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    findByNames: vi.fn(),
    findTopN: vi.fn(),
  } as unknown as PhoneRepository;
}

describe('SearchService', () => {
  it('delegates to repository with correct filters', async () => {
    const repo = mockRepo([TEST_PHONES[0]!]);
    const service = new SearchService(repo);
    const filters: SearchFilters = { brand: 'Apple', maxPrice: 1200 };

    await service.search(filters);

    expect(repo.search).toHaveBeenCalledWith(filters);
  });

  it('returns all phones when no filters provided', async () => {
    const repo = mockRepo(TEST_PHONES);
    const service = new SearchService(repo);

    const results = await service.search({});
    expect(results).toHaveLength(6);
  });

  it('returns empty array when no matches', async () => {
    const repo = mockRepo([]);
    const service = new SearchService(repo);

    const results = await service.search({ brand: 'Nokia' });
    expect(results).toHaveLength(0);
  });

  it('passes through all filter fields to repository', async () => {
    const repo = mockRepo([]);
    const service = new SearchService(repo);

    const filters: SearchFilters = {
      brand: 'Samsung',
      model: 'S25',
      maxPrice: 1300,
      minPrice: 1000,
      os: 'Android',
      minRam: 12,
      minStorage: 256,
    };

    await service.search(filters);
    expect(repo.search).toHaveBeenCalledWith(filters);
  });

  it('returns the phones from repository unchanged', async () => {
    const repo = mockRepo([TEST_PHONES[2]!, TEST_PHONES[4]!]);
    const service = new SearchService(repo);

    const results = await service.search({ os: 'Android' });
    expect(results).toHaveLength(2);
    expect(results[0]!.brand).toBe('Samsung');
    expect(results[1]!.brand).toBe('Google');
  });
});

describe('SearchService filter edge cases', () => {
  it('handles undefined optional filters', async () => {
    const repo = mockRepo(TEST_PHONES);
    const service = new SearchService(repo);

    const filters: SearchFilters = { brand: undefined, maxPrice: undefined };
    const results = await service.search(filters);
    expect(results).toHaveLength(6);
  });

  it('correctly passes minRam filter', async () => {
    const highRamPhones = TEST_PHONES.filter((p) => p.ram >= 12);
    const repo = mockRepo(highRamPhones);
    const service = new SearchService(repo);

    const results = await service.search({ minRam: 12 });
    expect(results.every((p) => p.ram >= 12)).toBe(true);
  });
});
