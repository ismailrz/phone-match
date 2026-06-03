import type { PhoneRepository } from '../../repositories/phone.repository.js';
import type { PhoneWithScores, SearchFilters } from '../../types/index.js';

export class SearchService {
  constructor(private readonly repo: PhoneRepository) {}

  async search(filters: SearchFilters): Promise<PhoneWithScores[]> {
    return this.repo.search(filters);
  }
}
