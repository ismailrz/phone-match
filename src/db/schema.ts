import {
  pgTable,
  serial,
  integer,
  varchar,
  boolean,
  timestamp,
  real,
} from 'drizzle-orm/pg-core';

export const phones = pgTable('phones', {
  id: serial('id').primaryKey(),
  brand: varchar('brand', { length: 100 }).notNull(),
  model: varchar('model', { length: 150 }).notNull(),
  releaseYear: integer('release_year').notNull(),
  priceUsd: integer('price_usd').notNull(),
  operatingSystem: varchar('operating_system', { length: 20 }).notNull(),
  chipset: varchar('chipset', { length: 150 }).notNull(),
  ram: integer('ram').notNull(),
  storage: integer('storage').notNull(),
  batteryMah: integer('battery_mah').notNull(),
  chargingWatt: integer('charging_watt').notNull(),
  displaySize: real('display_size').notNull(),
  displayType: varchar('display_type', { length: 80 }).notNull(),
  refreshRate: integer('refresh_rate').notNull(),
  waterproofRating: varchar('waterproof_rating', { length: 20 }),
  esimSupport: boolean('esim_support').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const phoneScores = pgTable('phone_scores', {
  phoneId: integer('phone_id')
    .primaryKey()
    .references(() => phones.id, { onDelete: 'cascade' }),
  cameraScore: integer('camera_score').notNull(),
  batteryScore: integer('battery_score').notNull(),
  gamingScore: integer('gaming_score').notNull(),
  performanceScore: integer('performance_score').notNull(),
  displayScore: integer('display_score').notNull(),
  durabilityScore: integer('durability_score').notNull(),
  valueScore: integer('value_score').notNull(),
});

export type Phone = typeof phones.$inferSelect;
export type NewPhone = typeof phones.$inferInsert;
export type PhoneScore = typeof phoneScores.$inferSelect;
export type NewPhoneScore = typeof phoneScores.$inferInsert;
