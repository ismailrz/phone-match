import type { PhoneRepository } from '../../repositories/phone.repository.js';
import { NotFoundError } from '../../types/index.js';
import type { PhoneWithScores } from '../../types/index.js';

export class PhoneService {
  constructor(private readonly repo: PhoneRepository) {}

  async getAll(page: number, limit: number): Promise<{ data: PhoneWithScores[]; total: number }> {
    return this.repo.findAll(page, limit);
  }

  async getById(id: number): Promise<PhoneWithScores> {
    const phone = await this.repo.findById(id);
    if (!phone) throw new NotFoundError(`Phone with id ${id} not found`);
    return phone;
  }

  async getByName(name: string): Promise<PhoneWithScores> {
    const phone = await this.repo.findByName(name);
    if (!phone) throw new NotFoundError(`Phone "${name}" not found`);
    return phone;
  }
}
