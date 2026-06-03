export interface PhoneScores {
  cameraScore: number;
  batteryScore: number;
  gamingScore: number;
  performanceScore: number;
  displayScore: number;
  durabilityScore: number;
  valueScore: number;
}

export type ScoreKey = keyof PhoneScores;

export interface Weights extends Partial<PhoneScores> {
  maxPriceUsd?: number;
  minPriceUsd?: number;
  preferredBrands?: string[];
  operatingSystem?: 'Android' | 'iOS';
  requiredFeatures?: string[];
}

export interface PhoneRow {
  id: number;
  brand: string;
  model: string;
  releaseYear: number;
  priceUsd: number;
  operatingSystem: string;
  chipset: string;
  ram: number;
  storage: number;
  batteryMah: number;
  chargingWatt: number;
  displaySize: number;
  displayType: string;
  refreshRate: number;
  waterproofRating: string | null;
  esimSupport: boolean;
  createdAt: Date;
}

export interface PhoneWithScores extends PhoneRow {
  scores: PhoneScores;
}

export interface RecommendationResult {
  rank: number;
  phone: PhoneWithScores;
  finalScore: number;
  explanation: string;
}

export interface ComparisonResult {
  phones: PhoneWithScores[];
  winner: PhoneWithScores;
  analysis: string[];
}

export interface SearchFilters {
  brand?: string;
  model?: string;
  maxPrice?: number;
  minPrice?: number;
  os?: 'Android' | 'iOS';
  minRam?: number;
  minStorage?: number;
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
