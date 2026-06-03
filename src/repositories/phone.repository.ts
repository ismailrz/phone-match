import { and, count, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../db/schema.js';
import { phones, phoneScores } from '../db/schema.js';
import type { PhoneWithScores, SearchFilters } from '../types/index.js';

type DB = NodePgDatabase<typeof schema>;

type RawRow = {
  phones: typeof phones.$inferSelect;
  phone_scores: typeof phoneScores.$inferSelect | null;
};

function mapRow(row: RawRow): PhoneWithScores | null {
  if (!row.phone_scores) return null;
  const p = row.phones;
  const s = row.phone_scores;
  return {
    id: p.id,
    brand: p.brand,
    model: p.model,
    releaseYear: p.releaseYear,
    priceUsd: p.priceUsd,
    operatingSystem: p.operatingSystem,
    chipset: p.chipset,
    ram: p.ram,
    storage: p.storage,
    batteryMah: p.batteryMah,
    chargingWatt: p.chargingWatt,
    displaySize: p.displaySize,
    displayType: p.displayType,
    refreshRate: p.refreshRate,
    waterproofRating: p.waterproofRating ?? null,
    esimSupport: p.esimSupport,
    createdAt: p.createdAt,
    scores: {
      cameraScore: s.cameraScore,
      batteryScore: s.batteryScore,
      gamingScore: s.gamingScore,
      performanceScore: s.performanceScore,
      displayScore: s.displayScore,
      durabilityScore: s.durabilityScore,
      valueScore: s.valueScore,
    },
  };
}

export class PhoneRepository {
  constructor(private readonly db: DB) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: PhoneWithScores[]; total: number }> {
    const offset = (page - 1) * limit;

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(phones)
        .leftJoin(phoneScores, eq(phones.id, phoneScores.phoneId))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: count() }).from(phones),
    ]);

    const data = rows.map((r) => mapRow(r as RawRow)).filter((p): p is PhoneWithScores => p !== null);
    const total = countResult[0]?.count ?? 0;

    return { data, total };
  }

  async findById(id: number): Promise<PhoneWithScores | null> {
    const rows = await this.db
      .select()
      .from(phones)
      .leftJoin(phoneScores, eq(phones.id, phoneScores.phoneId))
      .where(eq(phones.id, id))
      .limit(1);

    if (!rows[0]) return null;
    return mapRow(rows[0] as RawRow);
  }

  async findByName(name: string): Promise<PhoneWithScores | null> {
    const normalized = name.trim().toLowerCase();

    const rows = await this.db
      .select()
      .from(phones)
      .leftJoin(phoneScores, eq(phones.id, phoneScores.phoneId))
      .where(
        or(
          ilike(sql`${phones.brand} || ' ' || ${phones.model}`, `%${normalized}%`),
          ilike(phones.model, `%${normalized}%`),
        ),
      )
      .limit(1);

    if (!rows[0]) return null;
    return mapRow(rows[0] as RawRow);
  }

  async findByNames(names: string[]): Promise<(PhoneWithScores | null)[]> {
    return Promise.all(names.map((name) => this.findByName(name)));
  }

  async search(filters: SearchFilters): Promise<PhoneWithScores[]> {
    const conditions = [];

    if (filters.brand) {
      conditions.push(ilike(phones.brand, `%${filters.brand}%`));
    }
    if (filters.model) {
      conditions.push(ilike(phones.model, `%${filters.model}%`));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(phones.priceUsd, filters.maxPrice));
    }
    if (filters.minPrice !== undefined) {
      conditions.push(gte(phones.priceUsd, filters.minPrice));
    }
    if (filters.os) {
      conditions.push(eq(phones.operatingSystem, filters.os));
    }

    const rows = await this.db
      .select()
      .from(phones)
      .leftJoin(phoneScores, eq(phones.id, phoneScores.phoneId))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    let results = rows
      .map((r) => mapRow(r as RawRow))
      .filter((p): p is PhoneWithScores => p !== null);

    if (filters.minRam !== undefined) {
      results = results.filter((p) => p.ram >= (filters.minRam ?? 0));
    }
    if (filters.minStorage !== undefined) {
      results = results.filter((p) => p.storage >= (filters.minStorage ?? 0));
    }

    return results;
  }

  async findTopN(limit = 200): Promise<PhoneWithScores[]> {
    const rows = await this.db
      .select()
      .from(phones)
      .leftJoin(phoneScores, eq(phones.id, phoneScores.phoneId))
      .limit(limit);

    return rows
      .map((r) => mapRow(r as RawRow))
      .filter((p): p is PhoneWithScores => p !== null);
  }
}
