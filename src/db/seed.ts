import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { phones, phoneScores } from './schema.js';
import type { NewPhone, NewPhoneScore } from './schema.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env['DATABASE_URL'] ?? 'postgresql://phonematch:phonematch@localhost:5432/phonematch',
});
const db = drizzle(pool);

// ── Phone data ────────────────────────────────────────────────────────────────
const PHONES: NewPhone[] = [
  // Apple (15)
  { brand: 'Apple', model: 'iPhone 17 Pro Max', releaseYear: 2025, priceUsd: 1299, operatingSystem: 'iOS', chipset: 'Apple A19 Pro', ram: 12, storage: 256, batteryMah: 4685, chargingWatt: 30, displaySize: 6.9, displayType: 'Super Retina XDR OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 17 Pro', releaseYear: 2025, priceUsd: 1099, operatingSystem: 'iOS', chipset: 'Apple A19 Pro', ram: 12, storage: 256, batteryMah: 4422, chargingWatt: 30, displaySize: 6.3, displayType: 'Super Retina XDR OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 17 Plus', releaseYear: 2025, priceUsd: 899, operatingSystem: 'iOS', chipset: 'Apple A19', ram: 8, storage: 128, batteryMah: 4740, chargingWatt: 25, displaySize: 6.7, displayType: 'Super Retina XDR OLED', refreshRate: 60, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 17', releaseYear: 2025, priceUsd: 799, operatingSystem: 'iOS', chipset: 'Apple A19', ram: 8, storage: 128, batteryMah: 3726, chargingWatt: 25, displaySize: 6.1, displayType: 'Super Retina XDR OLED', refreshRate: 60, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 16 Pro Max', releaseYear: 2024, priceUsd: 1099, operatingSystem: 'iOS', chipset: 'Apple A18 Pro', ram: 8, storage: 256, batteryMah: 4685, chargingWatt: 27, displaySize: 6.9, displayType: 'Super Retina XDR OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 16 Pro', releaseYear: 2024, priceUsd: 999, operatingSystem: 'iOS', chipset: 'Apple A18 Pro', ram: 8, storage: 128, batteryMah: 3582, chargingWatt: 27, displaySize: 6.3, displayType: 'Super Retina XDR OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 16 Plus', releaseYear: 2024, priceUsd: 799, operatingSystem: 'iOS', chipset: 'Apple A18', ram: 8, storage: 128, batteryMah: 4674, chargingWatt: 25, displaySize: 6.7, displayType: 'Super Retina XDR OLED', refreshRate: 60, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 16', releaseYear: 2024, priceUsd: 699, operatingSystem: 'iOS', chipset: 'Apple A18', ram: 8, storage: 128, batteryMah: 3561, chargingWatt: 25, displaySize: 6.1, displayType: 'Super Retina XDR OLED', refreshRate: 60, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 16e', releaseYear: 2025, priceUsd: 599, operatingSystem: 'iOS', chipset: 'Apple A16', ram: 8, storage: 128, batteryMah: 3279, chargingWatt: 20, displaySize: 6.1, displayType: 'Super Retina XDR OLED', refreshRate: 60, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 15 Pro Max', releaseYear: 2023, priceUsd: 849, operatingSystem: 'iOS', chipset: 'Apple A17 Pro', ram: 8, storage: 256, batteryMah: 4422, chargingWatt: 27, displaySize: 6.7, displayType: 'Super Retina XDR OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 15 Pro', releaseYear: 2023, priceUsd: 749, operatingSystem: 'iOS', chipset: 'Apple A17 Pro', ram: 8, storage: 128, batteryMah: 3274, chargingWatt: 27, displaySize: 6.1, displayType: 'Super Retina XDR OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 15 Plus', releaseYear: 2023, priceUsd: 649, operatingSystem: 'iOS', chipset: 'Apple A16 Bionic', ram: 6, storage: 128, batteryMah: 4383, chargingWatt: 20, displaySize: 6.7, displayType: 'Super Retina XDR OLED', refreshRate: 60, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 15', releaseYear: 2023, priceUsd: 549, operatingSystem: 'iOS', chipset: 'Apple A16 Bionic', ram: 6, storage: 128, batteryMah: 3349, chargingWatt: 20, displaySize: 6.1, displayType: 'Super Retina XDR OLED', refreshRate: 60, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone 14 Pro Max', releaseYear: 2022, priceUsd: 699, operatingSystem: 'iOS', chipset: 'Apple A16 Bionic', ram: 6, storage: 128, batteryMah: 4323, chargingWatt: 27, displaySize: 6.7, displayType: 'Super Retina XDR OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Apple', model: 'iPhone SE 3rd Gen', releaseYear: 2022, priceUsd: 329, operatingSystem: 'iOS', chipset: 'Apple A15 Bionic', ram: 4, storage: 64, batteryMah: 2018, chargingWatt: 20, displaySize: 4.7, displayType: 'Retina IPS LCD', refreshRate: 60, waterproofRating: 'IP67', esimSupport: true },

  // Samsung (15)
  { brand: 'Samsung', model: 'Galaxy S25 Ultra', releaseYear: 2025, priceUsd: 1299, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 12, storage: 256, batteryMah: 5000, chargingWatt: 45, displaySize: 6.9, displayType: 'Dynamic AMOLED 2X', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Samsung', model: 'Galaxy S25+', releaseYear: 2025, priceUsd: 999, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 12, storage: 256, batteryMah: 4900, chargingWatt: 45, displaySize: 6.7, displayType: 'Dynamic AMOLED 2X', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Samsung', model: 'Galaxy S25', releaseYear: 2025, priceUsd: 799, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 12, storage: 128, batteryMah: 4000, chargingWatt: 25, displaySize: 6.2, displayType: 'Dynamic AMOLED 2X', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', releaseYear: 2024, priceUsd: 1099, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 3', ram: 12, storage: 256, batteryMah: 5000, chargingWatt: 45, displaySize: 6.8, displayType: 'Dynamic AMOLED 2X', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Samsung', model: 'Galaxy S24+', releaseYear: 2024, priceUsd: 899, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 3', ram: 12, storage: 256, batteryMah: 4900, chargingWatt: 45, displaySize: 6.7, displayType: 'Dynamic AMOLED 2X', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Samsung', model: 'Galaxy S24', releaseYear: 2024, priceUsd: 699, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 3', ram: 8, storage: 128, batteryMah: 4000, chargingWatt: 25, displaySize: 6.2, displayType: 'Dynamic AMOLED 2X', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Samsung', model: 'Galaxy S23 Ultra', releaseYear: 2023, priceUsd: 799, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 2', ram: 12, storage: 256, batteryMah: 5000, chargingWatt: 45, displaySize: 6.8, displayType: 'Dynamic AMOLED 2X', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Samsung', model: 'Galaxy Z Fold 6', releaseYear: 2024, priceUsd: 1899, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 3', ram: 12, storage: 256, batteryMah: 4400, chargingWatt: 25, displaySize: 7.6, displayType: 'Dynamic AMOLED 2X Foldable', refreshRate: 120, waterproofRating: 'IPX8', esimSupport: true },
  { brand: 'Samsung', model: 'Galaxy Z Flip 6', releaseYear: 2024, priceUsd: 1099, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 3', ram: 12, storage: 256, batteryMah: 4000, chargingWatt: 25, displaySize: 6.7, displayType: 'Dynamic AMOLED 2X Flip', refreshRate: 120, waterproofRating: 'IPX8', esimSupport: true },
  { brand: 'Samsung', model: 'Galaxy A55 5G', releaseYear: 2024, priceUsd: 449, operatingSystem: 'Android', chipset: 'Exynos 1480', ram: 8, storage: 128, batteryMah: 5000, chargingWatt: 25, displaySize: 6.6, displayType: 'Super AMOLED', refreshRate: 120, waterproofRating: 'IP67', esimSupport: false },
  { brand: 'Samsung', model: 'Galaxy A35 5G', releaseYear: 2024, priceUsd: 349, operatingSystem: 'Android', chipset: 'Exynos 1380', ram: 6, storage: 128, batteryMah: 5000, chargingWatt: 25, displaySize: 6.6, displayType: 'Super AMOLED', refreshRate: 120, waterproofRating: 'IP67', esimSupport: false },
  { brand: 'Samsung', model: 'Galaxy A25 5G', releaseYear: 2024, priceUsd: 249, operatingSystem: 'Android', chipset: 'Exynos 1280', ram: 6, storage: 128, batteryMah: 5000, chargingWatt: 25, displaySize: 6.5, displayType: 'Super AMOLED', refreshRate: 120, waterproofRating: null, esimSupport: false },
  { brand: 'Samsung', model: 'Galaxy M55 5G', releaseYear: 2024, priceUsd: 349, operatingSystem: 'Android', chipset: 'Snapdragon 7 Gen 1', ram: 8, storage: 128, batteryMah: 5000, chargingWatt: 45, displaySize: 6.7, displayType: 'Super AMOLED', refreshRate: 120, waterproofRating: null, esimSupport: false },
  { brand: 'Samsung', model: 'Galaxy F55 5G', releaseYear: 2024, priceUsd: 299, operatingSystem: 'Android', chipset: 'Snapdragon 7 Gen 1', ram: 8, storage: 128, batteryMah: 5000, chargingWatt: 45, displaySize: 6.7, displayType: 'Super AMOLED', refreshRate: 120, waterproofRating: null, esimSupport: false },
  { brand: 'Samsung', model: 'Galaxy S23', releaseYear: 2023, priceUsd: 499, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 2', ram: 8, storage: 128, batteryMah: 3900, chargingWatt: 25, displaySize: 6.1, displayType: 'Dynamic AMOLED 2X', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },

  // Google (10)
  { brand: 'Google', model: 'Pixel 9 Pro XL', releaseYear: 2024, priceUsd: 1099, operatingSystem: 'Android', chipset: 'Google Tensor G4', ram: 16, storage: 256, batteryMah: 5060, chargingWatt: 37, displaySize: 6.8, displayType: 'LTPO OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Google', model: 'Pixel 9 Pro', releaseYear: 2024, priceUsd: 999, operatingSystem: 'Android', chipset: 'Google Tensor G4', ram: 16, storage: 128, batteryMah: 4700, chargingWatt: 37, displaySize: 6.3, displayType: 'LTPO OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Google', model: 'Pixel 9 Pro Fold', releaseYear: 2024, priceUsd: 1799, operatingSystem: 'Android', chipset: 'Google Tensor G4', ram: 16, storage: 256, batteryMah: 4650, chargingWatt: 37, displaySize: 8.0, displayType: 'LTPO OLED Foldable', refreshRate: 120, waterproofRating: 'IPX8', esimSupport: true },
  { brand: 'Google', model: 'Pixel 9', releaseYear: 2024, priceUsd: 799, operatingSystem: 'Android', chipset: 'Google Tensor G4', ram: 12, storage: 128, batteryMah: 4700, chargingWatt: 27, displaySize: 6.3, displayType: 'Actua OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Google', model: 'Pixel 9a', releaseYear: 2025, priceUsd: 499, operatingSystem: 'Android', chipset: 'Google Tensor G4', ram: 8, storage: 128, batteryMah: 5100, chargingWatt: 23, displaySize: 6.3, displayType: 'Actua OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Google', model: 'Pixel 8 Pro', releaseYear: 2023, priceUsd: 749, operatingSystem: 'Android', chipset: 'Google Tensor G3', ram: 12, storage: 128, batteryMah: 5050, chargingWatt: 30, displaySize: 6.7, displayType: 'LTPO OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Google', model: 'Pixel 8', releaseYear: 2023, priceUsd: 549, operatingSystem: 'Android', chipset: 'Google Tensor G3', ram: 8, storage: 128, batteryMah: 4575, chargingWatt: 27, displaySize: 6.2, displayType: 'Actua OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Google', model: 'Pixel 8a', releaseYear: 2024, priceUsd: 499, operatingSystem: 'Android', chipset: 'Google Tensor G3', ram: 8, storage: 128, batteryMah: 4492, chargingWatt: 18, displaySize: 6.1, displayType: 'Actua OLED', refreshRate: 120, waterproofRating: 'IP67', esimSupport: true },
  { brand: 'Google', model: 'Pixel 7 Pro', releaseYear: 2022, priceUsd: 499, operatingSystem: 'Android', chipset: 'Google Tensor G2', ram: 12, storage: 128, batteryMah: 5000, chargingWatt: 30, displaySize: 6.7, displayType: 'LTPO OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Google', model: 'Pixel 7a', releaseYear: 2023, priceUsd: 349, operatingSystem: 'Android', chipset: 'Google Tensor G2', ram: 8, storage: 128, batteryMah: 4385, chargingWatt: 18, displaySize: 6.1, displayType: 'OLED', refreshRate: 90, waterproofRating: 'IP67', esimSupport: true },

  // OnePlus (7)
  { brand: 'OnePlus', model: '13', releaseYear: 2025, priceUsd: 899, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 12, storage: 256, batteryMah: 6000, chargingWatt: 100, displaySize: 6.82, displayType: 'LTPO AMOLED', refreshRate: 120, waterproofRating: 'IP65', esimSupport: true },
  { brand: 'OnePlus', model: '12', releaseYear: 2024, priceUsd: 799, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 3', ram: 12, storage: 256, batteryMah: 5400, chargingWatt: 100, displaySize: 6.82, displayType: 'LTPO AMOLED', refreshRate: 120, waterproofRating: 'IP65', esimSupport: true },
  { brand: 'OnePlus', model: '12R', releaseYear: 2024, priceUsd: 499, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 1', ram: 8, storage: 128, batteryMah: 5500, chargingWatt: 80, displaySize: 6.78, displayType: 'AMOLED', refreshRate: 120, waterproofRating: null, esimSupport: false },
  { brand: 'OnePlus', model: 'Nord 4', releaseYear: 2024, priceUsd: 449, operatingSystem: 'Android', chipset: 'Snapdragon 7+ Gen 3', ram: 8, storage: 128, batteryMah: 5500, chargingWatt: 100, displaySize: 6.74, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP65', esimSupport: false },
  { brand: 'OnePlus', model: 'Nord CE 4', releaseYear: 2024, priceUsd: 349, operatingSystem: 'Android', chipset: 'Snapdragon 7s Gen 2', ram: 8, storage: 128, batteryMah: 5500, chargingWatt: 100, displaySize: 6.67, displayType: 'AMOLED', refreshRate: 120, waterproofRating: null, esimSupport: false },
  { brand: 'OnePlus', model: 'Open', releaseYear: 2023, priceUsd: 1499, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 2', ram: 16, storage: 512, batteryMah: 4805, chargingWatt: 67, displaySize: 7.82, displayType: 'Foldable AMOLED', refreshRate: 120, waterproofRating: 'IPX4', esimSupport: true },
  { brand: 'OnePlus', model: '11', releaseYear: 2023, priceUsd: 649, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 2', ram: 8, storage: 128, batteryMah: 5000, chargingWatt: 100, displaySize: 6.7, displayType: 'LTPO3 AMOLED', refreshRate: 120, waterproofRating: null, esimSupport: false },

  // Xiaomi (10)
  { brand: 'Xiaomi', model: '15 Ultra', releaseYear: 2025, priceUsd: 1399, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 16, storage: 512, batteryMah: 6000, chargingWatt: 120, displaySize: 6.73, displayType: 'LTPO AMOLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Xiaomi', model: '15 Pro', releaseYear: 2025, priceUsd: 1099, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 12, storage: 256, batteryMah: 6100, chargingWatt: 90, displaySize: 6.73, displayType: 'LTPO AMOLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Xiaomi', model: '15', releaseYear: 2025, priceUsd: 899, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 12, storage: 256, batteryMah: 5240, chargingWatt: 90, displaySize: 6.36, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Xiaomi', model: '14 Ultra', releaseYear: 2024, priceUsd: 1299, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 3', ram: 16, storage: 512, batteryMah: 5300, chargingWatt: 90, displaySize: 6.73, displayType: 'LTPO AMOLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Xiaomi', model: '14T Pro', releaseYear: 2024, priceUsd: 799, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 9300+', ram: 12, storage: 256, batteryMah: 5000, chargingWatt: 120, displaySize: 6.67, displayType: 'LTPO AMOLED', refreshRate: 144, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Xiaomi', model: '14T', releaseYear: 2024, priceUsd: 649, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 8300-Ultra', ram: 12, storage: 256, batteryMah: 5000, chargingWatt: 67, displaySize: 6.67, displayType: 'AMOLED', refreshRate: 144, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Xiaomi', model: 'Redmi Note 14 Pro+', releaseYear: 2025, priceUsd: 399, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 9300+', ram: 8, storage: 256, batteryMah: 6200, chargingWatt: 90, displaySize: 6.67, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: false },
  { brand: 'Xiaomi', model: 'Redmi Note 14 Pro', releaseYear: 2025, priceUsd: 329, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 7300-Ultra', ram: 8, storage: 256, batteryMah: 5500, chargingWatt: 45, displaySize: 6.67, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: false },
  { brand: 'Xiaomi', model: 'POCO F6 Pro', releaseYear: 2024, priceUsd: 549, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 2', ram: 12, storage: 256, batteryMah: 5000, chargingWatt: 67, displaySize: 6.67, displayType: 'LTPO AMOLED', refreshRate: 120, waterproofRating: 'IP64', esimSupport: false },
  { brand: 'Xiaomi', model: 'POCO X6 Pro', releaseYear: 2024, priceUsd: 349, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 8300-Ultra', ram: 8, storage: 256, batteryMah: 5000, chargingWatt: 67, displaySize: 6.67, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP64', esimSupport: false },

  // Nothing (5)
  { brand: 'Nothing', model: 'Phone (3a) Pro', releaseYear: 2025, priceUsd: 449, operatingSystem: 'Android', chipset: 'Snapdragon 7s Gen 3', ram: 8, storage: 256, batteryMah: 5000, chargingWatt: 50, displaySize: 6.77, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP64', esimSupport: true },
  { brand: 'Nothing', model: 'Phone (3a)', releaseYear: 2025, priceUsd: 379, operatingSystem: 'Android', chipset: 'Snapdragon 7s Gen 3', ram: 8, storage: 128, batteryMah: 5000, chargingWatt: 45, displaySize: 6.77, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP64', esimSupport: true },
  { brand: 'Nothing', model: 'Phone (2a) Plus', releaseYear: 2024, priceUsd: 399, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 7350 Pro', ram: 12, storage: 256, batteryMah: 5000, chargingWatt: 50, displaySize: 6.7, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP54', esimSupport: false },
  { brand: 'Nothing', model: 'Phone (2)', releaseYear: 2023, priceUsd: 499, operatingSystem: 'Android', chipset: 'Snapdragon 8+ Gen 1', ram: 8, storage: 128, batteryMah: 4700, chargingWatt: 45, displaySize: 6.7, displayType: 'OLED', refreshRate: 120, waterproofRating: 'IP54', esimSupport: false },
  { brand: 'Nothing', model: 'Phone (2a)', releaseYear: 2024, priceUsd: 349, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 7200 Pro', ram: 8, storage: 128, batteryMah: 5000, chargingWatt: 45, displaySize: 6.7, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP54', esimSupport: false },

  // Motorola (7)
  { brand: 'Motorola', model: 'Edge 50 Ultra', releaseYear: 2024, priceUsd: 799, operatingSystem: 'Android', chipset: 'Snapdragon 8s Gen 3', ram: 12, storage: 512, batteryMah: 4500, chargingWatt: 125, displaySize: 6.67, displayType: 'pOLED', refreshRate: 165, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Motorola', model: 'Edge 50 Pro', releaseYear: 2024, priceUsd: 599, operatingSystem: 'Android', chipset: 'Snapdragon 7 Gen 3', ram: 12, storage: 256, batteryMah: 4500, chargingWatt: 125, displaySize: 6.7, displayType: 'pOLED', refreshRate: 144, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Motorola', model: 'Edge 50 Fusion', releaseYear: 2024, priceUsd: 399, operatingSystem: 'Android', chipset: 'Snapdragon 7s Gen 2', ram: 8, storage: 256, batteryMah: 5000, chargingWatt: 68, displaySize: 6.7, displayType: 'pOLED', refreshRate: 144, waterproofRating: 'IP68', esimSupport: false },
  { brand: 'Motorola', model: 'Razr 50 Ultra', releaseYear: 2024, priceUsd: 1099, operatingSystem: 'Android', chipset: 'Snapdragon 8s Gen 3', ram: 12, storage: 256, batteryMah: 4000, chargingWatt: 45, displaySize: 6.9, displayType: 'pOLED Flip', refreshRate: 165, waterproofRating: 'IP48', esimSupport: true },
  { brand: 'Motorola', model: 'Razr 50', releaseYear: 2024, priceUsd: 699, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 7300X', ram: 8, storage: 256, batteryMah: 4200, chargingWatt: 30, displaySize: 6.9, displayType: 'pOLED Flip', refreshRate: 120, waterproofRating: 'IP48', esimSupport: true },
  { brand: 'Motorola', model: 'Moto G85', releaseYear: 2024, priceUsd: 299, operatingSystem: 'Android', chipset: 'Snapdragon 6s Gen 3', ram: 8, storage: 128, batteryMah: 5000, chargingWatt: 33, displaySize: 6.67, displayType: 'pOLED', refreshRate: 120, waterproofRating: 'IP52', esimSupport: false },
  { brand: 'Motorola', model: 'Moto G Power 5G', releaseYear: 2024, priceUsd: 249, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 7025', ram: 8, storage: 256, batteryMah: 6000, chargingWatt: 30, displaySize: 6.7, displayType: 'IPS LCD', refreshRate: 120, waterproofRating: null, esimSupport: false },

  // OPPO (5)
  { brand: 'OPPO', model: 'Find X8 Pro', releaseYear: 2025, priceUsd: 1199, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 9400', ram: 12, storage: 256, batteryMah: 5910, chargingWatt: 100, displaySize: 6.78, displayType: 'LTPO AMOLED', refreshRate: 120, waterproofRating: 'IP69', esimSupport: true },
  { brand: 'OPPO', model: 'Find X8', releaseYear: 2025, priceUsd: 999, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 9400', ram: 12, storage: 256, batteryMah: 5630, chargingWatt: 80, displaySize: 6.59, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP65', esimSupport: true },
  { brand: 'OPPO', model: 'Reno 13 Pro', releaseYear: 2025, priceUsd: 549, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 8350', ram: 12, storage: 256, batteryMah: 5600, chargingWatt: 80, displaySize: 6.83, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP66', esimSupport: false },
  { brand: 'OPPO', model: 'Reno 12 Pro', releaseYear: 2024, priceUsd: 449, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 7300-Energy', ram: 12, storage: 256, batteryMah: 5000, chargingWatt: 80, displaySize: 6.7, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP65', esimSupport: false },
  { brand: 'OPPO', model: 'A3 Pro', releaseYear: 2024, priceUsd: 299, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 7050', ram: 8, storage: 256, batteryMah: 5000, chargingWatt: 45, displaySize: 6.7, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP65', esimSupport: false },

  // Vivo (5)
  { brand: 'Vivo', model: 'X200 Ultra', releaseYear: 2025, priceUsd: 1299, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 16, storage: 512, batteryMah: 6000, chargingWatt: 90, displaySize: 6.82, displayType: 'LTPO AMOLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Vivo', model: 'X200 Pro', releaseYear: 2024, priceUsd: 1099, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 9400', ram: 16, storage: 512, batteryMah: 6000, chargingWatt: 90, displaySize: 6.78, displayType: 'LTPO AMOLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Vivo', model: 'X200', releaseYear: 2024, priceUsd: 799, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 9400', ram: 12, storage: 256, batteryMah: 5800, chargingWatt: 90, displaySize: 6.67, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Vivo', model: 'V40 Pro', releaseYear: 2024, priceUsd: 549, operatingSystem: 'Android', chipset: 'Snapdragon 7 Gen 3', ram: 12, storage: 256, batteryMah: 5500, chargingWatt: 80, displaySize: 6.78, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: false },
  { brand: 'Vivo', model: 'V40', releaseYear: 2024, priceUsd: 399, operatingSystem: 'Android', chipset: 'Snapdragon 7 Gen 3', ram: 8, storage: 128, batteryMah: 5500, chargingWatt: 80, displaySize: 6.78, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP64', esimSupport: false },

  // Sony (3)
  { brand: 'Sony', model: 'Xperia 1 VII', releaseYear: 2025, priceUsd: 1399, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 16, storage: 256, batteryMah: 5000, chargingWatt: 30, displaySize: 6.5, displayType: '4K OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Sony', model: 'Xperia 5 VII', releaseYear: 2025, priceUsd: 999, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 12, storage: 256, batteryMah: 4000, chargingWatt: 30, displaySize: 6.1, displayType: 'OLED', refreshRate: 120, waterproofRating: 'IP68', esimSupport: true },
  { brand: 'Sony', model: 'Xperia 10 VII', releaseYear: 2025, priceUsd: 499, operatingSystem: 'Android', chipset: 'Snapdragon 6 Gen 1', ram: 6, storage: 128, batteryMah: 5000, chargingWatt: 30, displaySize: 6.1, displayType: 'OLED', refreshRate: 60, waterproofRating: 'IP68', esimSupport: false },

  // ASUS (3)
  { brand: 'ASUS', model: 'ROG Phone 9 Pro', releaseYear: 2025, priceUsd: 1299, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 24, storage: 1024, batteryMah: 5800, chargingWatt: 65, displaySize: 6.78, displayType: 'AMOLED', refreshRate: 185, waterproofRating: 'IPX4', esimSupport: false },
  { brand: 'ASUS', model: 'ROG Phone 9', releaseYear: 2025, priceUsd: 999, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 16, storage: 512, batteryMah: 5800, chargingWatt: 65, displaySize: 6.78, displayType: 'AMOLED', refreshRate: 185, waterproofRating: 'IPX4', esimSupport: false },
  { brand: 'ASUS', model: 'Zenfone 11 Ultra', releaseYear: 2024, priceUsd: 899, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 3', ram: 12, storage: 256, batteryMah: 5500, chargingWatt: 65, displaySize: 6.78, displayType: 'AMOLED', refreshRate: 144, waterproofRating: 'IP68', esimSupport: true },

  // Realme (5)
  { brand: 'Realme', model: 'GT 7 Pro', releaseYear: 2025, priceUsd: 799, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 12, storage: 256, batteryMah: 6500, chargingWatt: 120, displaySize: 6.78, displayType: 'LTPO AMOLED', refreshRate: 120, waterproofRating: 'IP69', esimSupport: true },
  { brand: 'Realme', model: 'GT 6T', releaseYear: 2024, priceUsd: 449, operatingSystem: 'Android', chipset: 'Snapdragon 7+ Gen 3', ram: 8, storage: 256, batteryMah: 5500, chargingWatt: 120, displaySize: 6.67, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP65', esimSupport: false },
  { brand: 'Realme', model: '13 Pro+', releaseYear: 2024, priceUsd: 399, operatingSystem: 'Android', chipset: 'Snapdragon 7s Gen 2', ram: 12, storage: 256, batteryMah: 5200, chargingWatt: 67, displaySize: 6.7, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP65', esimSupport: false },
  { brand: 'Realme', model: '12 Pro+', releaseYear: 2024, priceUsd: 349, operatingSystem: 'Android', chipset: 'Snapdragon 7s Gen 2', ram: 8, storage: 256, batteryMah: 5000, chargingWatt: 67, displaySize: 6.7, displayType: 'AMOLED', refreshRate: 120, waterproofRating: 'IP64', esimSupport: false },
  { brand: 'Realme', model: 'Narzo 70 Pro', releaseYear: 2024, priceUsd: 249, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 7050', ram: 8, storage: 128, batteryMah: 5000, chargingWatt: 45, displaySize: 6.67, displayType: 'AMOLED', refreshRate: 120, waterproofRating: null, esimSupport: false },

  // Tecno (3)
  { brand: 'Tecno', model: 'Phantom V Fold2', releaseYear: 2024, priceUsd: 999, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 9200', ram: 12, storage: 256, batteryMah: 5000, chargingWatt: 45, displaySize: 7.85, displayType: 'AMOLED Foldable', refreshRate: 120, waterproofRating: null, esimSupport: false },
  { brand: 'Tecno', model: 'Spark 30C', releaseYear: 2025, priceUsd: 149, operatingSystem: 'Android', chipset: 'MediaTek Helio G91', ram: 4, storage: 128, batteryMah: 5000, chargingWatt: 18, displaySize: 6.67, displayType: 'IPS LCD', refreshRate: 90, waterproofRating: null, esimSupport: false },
  { brand: 'Tecno', model: 'Camon 30 Premier', releaseYear: 2024, priceUsd: 349, operatingSystem: 'Android', chipset: 'MediaTek Dimensity 8200', ram: 12, storage: 256, batteryMah: 5000, chargingWatt: 45, displaySize: 6.77, displayType: 'AMOLED', refreshRate: 120, waterproofRating: null, esimSupport: false },

  // iQOO (3)
  { brand: 'iQOO', model: '13', releaseYear: 2025, priceUsd: 899, operatingSystem: 'Android', chipset: 'Snapdragon 8 Elite', ram: 12, storage: 256, batteryMah: 6150, chargingWatt: 120, displaySize: 6.82, displayType: 'LTPO AMOLED', refreshRate: 144, waterproofRating: 'IP68', esimSupport: false },
  { brand: 'iQOO', model: '12', releaseYear: 2024, priceUsd: 699, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 3', ram: 12, storage: 256, batteryMah: 5000, chargingWatt: 120, displaySize: 6.78, displayType: 'LTPO AMOLED', refreshRate: 144, waterproofRating: null, esimSupport: false },
  { brand: 'iQOO', model: 'Neo 9S Pro', releaseYear: 2024, priceUsd: 449, operatingSystem: 'Android', chipset: 'Snapdragon 8 Gen 3', ram: 12, storage: 256, batteryMah: 5160, chargingWatt: 120, displaySize: 6.78, displayType: 'AMOLED', refreshRate: 144, waterproofRating: null, esimSupport: false },
];

// ── Score data ────────────────────────────────────────────────────────────────
// Scores assigned by model index (same order as PHONES array)
const SCORE_DATA: Omit<NewPhoneScore, 'phoneId'>[] = [
  // Apple (15)
  { cameraScore: 98, batteryScore: 82, gamingScore: 88, performanceScore: 99, displayScore: 97, durabilityScore: 92, valueScore: 58 }, // iPhone 17 Pro Max
  { cameraScore: 97, batteryScore: 78, gamingScore: 87, performanceScore: 99, displayScore: 96, durabilityScore: 91, valueScore: 60 }, // iPhone 17 Pro
  { cameraScore: 85, batteryScore: 88, gamingScore: 75, performanceScore: 90, displayScore: 88, durabilityScore: 88, valueScore: 72 }, // iPhone 17 Plus
  { cameraScore: 84, batteryScore: 72, gamingScore: 74, performanceScore: 90, displayScore: 87, durabilityScore: 88, valueScore: 74 }, // iPhone 17
  { cameraScore: 96, batteryScore: 85, gamingScore: 87, performanceScore: 97, displayScore: 96, durabilityScore: 90, valueScore: 62 }, // iPhone 16 Pro Max
  { cameraScore: 95, batteryScore: 74, gamingScore: 86, performanceScore: 97, displayScore: 95, durabilityScore: 90, valueScore: 64 }, // iPhone 16 Pro
  { cameraScore: 82, batteryScore: 87, gamingScore: 73, performanceScore: 88, displayScore: 86, durabilityScore: 88, valueScore: 74 }, // iPhone 16 Plus
  { cameraScore: 81, batteryScore: 71, gamingScore: 72, performanceScore: 88, displayScore: 85, durabilityScore: 88, valueScore: 76 }, // iPhone 16
  { cameraScore: 78, batteryScore: 62, gamingScore: 68, performanceScore: 84, displayScore: 82, durabilityScore: 86, valueScore: 78 }, // iPhone 16e
  { cameraScore: 94, batteryScore: 84, gamingScore: 84, performanceScore: 94, displayScore: 94, durabilityScore: 88, valueScore: 68 }, // iPhone 15 Pro Max
  { cameraScore: 93, batteryScore: 72, gamingScore: 83, performanceScore: 94, displayScore: 93, durabilityScore: 88, valueScore: 70 }, // iPhone 15 Pro
  { cameraScore: 80, batteryScore: 86, gamingScore: 70, performanceScore: 84, displayScore: 84, durabilityScore: 86, valueScore: 76 }, // iPhone 15 Plus
  { cameraScore: 79, batteryScore: 69, gamingScore: 69, performanceScore: 84, displayScore: 83, durabilityScore: 86, valueScore: 78 }, // iPhone 15
  { cameraScore: 91, batteryScore: 82, gamingScore: 82, performanceScore: 92, displayScore: 92, durabilityScore: 87, valueScore: 72 }, // iPhone 14 Pro Max
  { cameraScore: 70, batteryScore: 48, gamingScore: 55, performanceScore: 80, displayScore: 62, durabilityScore: 78, valueScore: 82 }, // iPhone SE 3rd Gen

  // Samsung (15)
  { cameraScore: 97, batteryScore: 88, gamingScore: 94, performanceScore: 98, displayScore: 99, durabilityScore: 93, valueScore: 58 }, // Galaxy S25 Ultra
  { cameraScore: 93, batteryScore: 88, gamingScore: 92, performanceScore: 98, displayScore: 97, durabilityScore: 91, valueScore: 62 }, // Galaxy S25+
  { cameraScore: 88, batteryScore: 80, gamingScore: 90, performanceScore: 97, displayScore: 95, durabilityScore: 90, valueScore: 68 }, // Galaxy S25
  { cameraScore: 95, batteryScore: 87, gamingScore: 93, performanceScore: 96, displayScore: 98, durabilityScore: 92, valueScore: 60 }, // Galaxy S24 Ultra
  { cameraScore: 91, batteryScore: 87, gamingScore: 91, performanceScore: 96, displayScore: 96, durabilityScore: 90, valueScore: 64 }, // Galaxy S24+
  { cameraScore: 86, batteryScore: 79, gamingScore: 89, performanceScore: 95, displayScore: 94, durabilityScore: 89, valueScore: 70 }, // Galaxy S24
  { cameraScore: 93, batteryScore: 86, gamingScore: 91, performanceScore: 94, displayScore: 97, durabilityScore: 91, valueScore: 64 }, // Galaxy S23 Ultra
  { cameraScore: 82, batteryScore: 76, gamingScore: 85, performanceScore: 95, displayScore: 97, durabilityScore: 82, valueScore: 48 }, // Galaxy Z Fold 6
  { cameraScore: 80, batteryScore: 78, gamingScore: 83, performanceScore: 95, displayScore: 92, durabilityScore: 78, valueScore: 52 }, // Galaxy Z Flip 6
  { cameraScore: 76, batteryScore: 85, gamingScore: 68, performanceScore: 72, displayScore: 82, durabilityScore: 72, valueScore: 84 }, // Galaxy A55 5G
  { cameraScore: 72, batteryScore: 84, gamingScore: 62, performanceScore: 65, displayScore: 80, durabilityScore: 70, valueScore: 88 }, // Galaxy A35 5G
  { cameraScore: 65, batteryScore: 82, gamingScore: 55, performanceScore: 58, displayScore: 75, durabilityScore: 62, valueScore: 91 }, // Galaxy A25 5G
  { cameraScore: 72, batteryScore: 84, gamingScore: 68, performanceScore: 74, displayScore: 82, durabilityScore: 65, valueScore: 85 }, // Galaxy M55 5G
  { cameraScore: 70, batteryScore: 84, gamingScore: 66, performanceScore: 72, displayScore: 81, durabilityScore: 63, valueScore: 86 }, // Galaxy F55 5G
  { cameraScore: 82, batteryScore: 75, gamingScore: 82, performanceScore: 88, displayScore: 93, durabilityScore: 86, valueScore: 74 }, // Galaxy S23

  // Google (10)
  { cameraScore: 99, batteryScore: 86, gamingScore: 78, performanceScore: 95, displayScore: 95, durabilityScore: 86, valueScore: 62 }, // Pixel 9 Pro XL
  { cameraScore: 98, batteryScore: 84, gamingScore: 77, performanceScore: 95, displayScore: 94, durabilityScore: 85, valueScore: 64 }, // Pixel 9 Pro
  { cameraScore: 97, batteryScore: 82, gamingScore: 76, performanceScore: 94, displayScore: 96, durabilityScore: 84, valueScore: 50 }, // Pixel 9 Pro Fold
  { cameraScore: 93, batteryScore: 84, gamingScore: 72, performanceScore: 90, displayScore: 90, durabilityScore: 84, valueScore: 70 }, // Pixel 9
  { cameraScore: 90, batteryScore: 86, gamingScore: 68, performanceScore: 88, displayScore: 88, durabilityScore: 84, valueScore: 80 }, // Pixel 9a
  { cameraScore: 96, batteryScore: 86, gamingScore: 72, performanceScore: 90, displayScore: 93, durabilityScore: 84, valueScore: 68 }, // Pixel 8 Pro
  { cameraScore: 90, batteryScore: 82, gamingScore: 68, performanceScore: 87, displayScore: 88, durabilityScore: 83, valueScore: 74 }, // Pixel 8
  { cameraScore: 88, batteryScore: 82, gamingScore: 66, performanceScore: 85, displayScore: 86, durabilityScore: 78, valueScore: 78 }, // Pixel 8a
  { cameraScore: 91, batteryScore: 84, gamingScore: 68, performanceScore: 86, displayScore: 90, durabilityScore: 82, valueScore: 72 }, // Pixel 7 Pro
  { cameraScore: 84, batteryScore: 78, gamingScore: 60, performanceScore: 78, displayScore: 82, durabilityScore: 76, valueScore: 82 }, // Pixel 7a

  // OnePlus (7)
  { cameraScore: 88, batteryScore: 95, gamingScore: 90, performanceScore: 97, displayScore: 93, durabilityScore: 78, valueScore: 72 }, // OnePlus 13
  { cameraScore: 86, batteryScore: 92, gamingScore: 88, performanceScore: 95, displayScore: 92, durabilityScore: 76, valueScore: 74 }, // OnePlus 12
  { cameraScore: 78, batteryScore: 90, gamingScore: 78, performanceScore: 84, displayScore: 88, durabilityScore: 68, valueScore: 82 }, // OnePlus 12R
  { cameraScore: 80, batteryScore: 89, gamingScore: 78, performanceScore: 86, displayScore: 89, durabilityScore: 74, valueScore: 82 }, // Nord 4
  { cameraScore: 72, batteryScore: 88, gamingScore: 70, performanceScore: 78, displayScore: 85, durabilityScore: 65, valueScore: 86 }, // Nord CE 4
  { cameraScore: 82, batteryScore: 80, gamingScore: 82, performanceScore: 90, displayScore: 94, durabilityScore: 72, valueScore: 48 }, // OnePlus Open
  { cameraScore: 82, batteryScore: 87, gamingScore: 83, performanceScore: 91, displayScore: 91, durabilityScore: 68, valueScore: 76 }, // OnePlus 11

  // Xiaomi (10)
  { cameraScore: 96, batteryScore: 94, gamingScore: 94, performanceScore: 98, displayScore: 95, durabilityScore: 86, valueScore: 60 }, // Xiaomi 15 Ultra
  { cameraScore: 94, batteryScore: 94, gamingScore: 92, performanceScore: 97, displayScore: 94, durabilityScore: 85, valueScore: 64 }, // Xiaomi 15 Pro
  { cameraScore: 89, batteryScore: 88, gamingScore: 89, performanceScore: 97, displayScore: 92, durabilityScore: 84, valueScore: 70 }, // Xiaomi 15
  { cameraScore: 95, batteryScore: 92, gamingScore: 92, performanceScore: 96, displayScore: 94, durabilityScore: 85, valueScore: 62 }, // Xiaomi 14 Ultra
  { cameraScore: 88, batteryScore: 88, gamingScore: 88, performanceScore: 92, displayScore: 93, durabilityScore: 82, valueScore: 70 }, // Xiaomi 14T Pro
  { cameraScore: 84, batteryScore: 86, gamingScore: 84, performanceScore: 85, displayScore: 91, durabilityScore: 80, valueScore: 76 }, // Xiaomi 14T
  { cameraScore: 76, batteryScore: 92, gamingScore: 68, performanceScore: 72, displayScore: 84, durabilityScore: 74, valueScore: 94 }, // Redmi Note 14 Pro+
  { cameraScore: 72, batteryScore: 88, gamingScore: 62, performanceScore: 65, displayScore: 81, durabilityScore: 72, valueScore: 92 }, // Redmi Note 14 Pro
  { cameraScore: 80, batteryScore: 86, gamingScore: 84, performanceScore: 90, displayScore: 88, durabilityScore: 72, valueScore: 82 }, // POCO F6 Pro
  { cameraScore: 74, batteryScore: 84, gamingScore: 80, performanceScore: 84, displayScore: 86, durabilityScore: 70, valueScore: 88 }, // POCO X6 Pro

  // Nothing (5)
  { cameraScore: 80, batteryScore: 88, gamingScore: 68, performanceScore: 75, displayScore: 84, durabilityScore: 72, valueScore: 90 }, // Nothing Phone (3a) Pro
  { cameraScore: 78, batteryScore: 88, gamingScore: 65, performanceScore: 73, displayScore: 83, durabilityScore: 70, valueScore: 92 }, // Nothing Phone (3a)
  { cameraScore: 75, batteryScore: 86, gamingScore: 62, performanceScore: 72, displayScore: 82, durabilityScore: 66, valueScore: 88 }, // Nothing Phone (2a) Plus
  { cameraScore: 74, batteryScore: 82, gamingScore: 72, performanceScore: 84, displayScore: 84, durabilityScore: 68, valueScore: 80 }, // Nothing Phone (2)
  { cameraScore: 72, batteryScore: 86, gamingScore: 60, performanceScore: 68, displayScore: 82, durabilityScore: 64, valueScore: 90 }, // Nothing Phone (2a)

  // Motorola (7)
  { cameraScore: 84, batteryScore: 84, gamingScore: 78, performanceScore: 88, displayScore: 92, durabilityScore: 82, valueScore: 72 }, // Edge 50 Ultra
  { cameraScore: 80, batteryScore: 84, gamingScore: 74, performanceScore: 82, displayScore: 90, durabilityScore: 80, valueScore: 76 }, // Edge 50 Pro
  { cameraScore: 76, batteryScore: 86, gamingScore: 68, performanceScore: 75, displayScore: 88, durabilityScore: 78, valueScore: 84 }, // Edge 50 Fusion
  { cameraScore: 78, batteryScore: 76, gamingScore: 72, performanceScore: 86, displayScore: 90, durabilityScore: 72, valueScore: 58 }, // Razr 50 Ultra
  { cameraScore: 72, batteryScore: 78, gamingScore: 65, performanceScore: 74, displayScore: 86, durabilityScore: 68, valueScore: 66 }, // Razr 50
  { cameraScore: 70, batteryScore: 84, gamingScore: 60, performanceScore: 70, displayScore: 84, durabilityScore: 68, valueScore: 86 }, // Moto G85
  { cameraScore: 62, batteryScore: 95, gamingScore: 52, performanceScore: 58, displayScore: 68, durabilityScore: 60, valueScore: 90 }, // Moto G Power 5G

  // OPPO (5)
  { cameraScore: 95, batteryScore: 93, gamingScore: 86, performanceScore: 94, displayScore: 94, durabilityScore: 88, valueScore: 62 }, // Find X8 Pro
  { cameraScore: 91, batteryScore: 90, gamingScore: 84, performanceScore: 93, displayScore: 92, durabilityScore: 84, valueScore: 66 }, // Find X8
  { cameraScore: 80, batteryScore: 89, gamingScore: 70, performanceScore: 80, displayScore: 87, durabilityScore: 78, valueScore: 78 }, // Reno 13 Pro
  { cameraScore: 76, batteryScore: 86, gamingScore: 65, performanceScore: 72, displayScore: 84, durabilityScore: 74, valueScore: 82 }, // Reno 12 Pro
  { cameraScore: 70, batteryScore: 84, gamingScore: 58, performanceScore: 65, displayScore: 80, durabilityScore: 72, valueScore: 86 }, // A3 Pro

  // Vivo (5)
  { cameraScore: 96, batteryScore: 94, gamingScore: 90, performanceScore: 97, displayScore: 94, durabilityScore: 86, valueScore: 60 }, // X200 Ultra
  { cameraScore: 95, batteryScore: 93, gamingScore: 88, performanceScore: 94, displayScore: 94, durabilityScore: 85, valueScore: 62 }, // X200 Pro
  { cameraScore: 90, batteryScore: 91, gamingScore: 85, performanceScore: 93, displayScore: 91, durabilityScore: 84, valueScore: 68 }, // X200
  { cameraScore: 82, batteryScore: 90, gamingScore: 76, performanceScore: 82, displayScore: 88, durabilityScore: 80, valueScore: 76 }, // V40 Pro
  { cameraScore: 78, batteryScore: 89, gamingScore: 72, performanceScore: 78, displayScore: 86, durabilityScore: 72, valueScore: 82 }, // V40

  // Sony (3)
  { cameraScore: 90, batteryScore: 84, gamingScore: 78, performanceScore: 97, displayScore: 98, durabilityScore: 90, valueScore: 56 }, // Xperia 1 VII
  { cameraScore: 86, batteryScore: 76, gamingScore: 74, performanceScore: 96, displayScore: 94, durabilityScore: 89, valueScore: 62 }, // Xperia 5 VII
  { cameraScore: 72, batteryScore: 84, gamingScore: 55, performanceScore: 68, displayScore: 84, durabilityScore: 88, valueScore: 76 }, // Xperia 10 VII

  // ASUS (3)
  { cameraScore: 72, batteryScore: 90, gamingScore: 99, performanceScore: 99, displayScore: 97, durabilityScore: 78, valueScore: 56 }, // ROG Phone 9 Pro
  { cameraScore: 70, batteryScore: 90, gamingScore: 98, performanceScore: 99, displayScore: 96, durabilityScore: 77, valueScore: 60 }, // ROG Phone 9
  { cameraScore: 82, batteryScore: 88, gamingScore: 88, performanceScore: 94, displayScore: 93, durabilityScore: 84, valueScore: 68 }, // Zenfone 11 Ultra

  // Realme (5)
  { cameraScore: 86, batteryScore: 94, gamingScore: 90, performanceScore: 97, displayScore: 93, durabilityScore: 82, valueScore: 72 }, // GT 7 Pro
  { cameraScore: 78, batteryScore: 90, gamingScore: 80, performanceScore: 86, displayScore: 88, durabilityScore: 74, valueScore: 84 }, // GT 6T
  { cameraScore: 76, batteryScore: 87, gamingScore: 68, performanceScore: 76, displayScore: 86, durabilityScore: 72, valueScore: 86 }, // 13 Pro+
  { cameraScore: 72, batteryScore: 84, gamingScore: 64, performanceScore: 72, displayScore: 84, durabilityScore: 70, valueScore: 88 }, // 12 Pro+
  { cameraScore: 66, batteryScore: 82, gamingScore: 55, performanceScore: 62, displayScore: 80, durabilityScore: 62, valueScore: 90 }, // Narzo 70 Pro

  // Tecno (3)
  { cameraScore: 70, batteryScore: 80, gamingScore: 72, performanceScore: 78, displayScore: 88, durabilityScore: 65, valueScore: 72 }, // Phantom V Fold2
  { cameraScore: 52, batteryScore: 86, gamingScore: 40, performanceScore: 44, displayScore: 62, durabilityScore: 55, valueScore: 96 }, // Spark 30C
  { cameraScore: 72, batteryScore: 84, gamingScore: 65, performanceScore: 76, displayScore: 82, durabilityScore: 66, valueScore: 84 }, // Camon 30 Premier

  // iQOO (3)
  { cameraScore: 72, batteryScore: 92, gamingScore: 98, performanceScore: 98, displayScore: 94, durabilityScore: 78, valueScore: 70 }, // iQOO 13
  { cameraScore: 70, batteryScore: 86, gamingScore: 96, performanceScore: 96, displayScore: 92, durabilityScore: 72, valueScore: 74 }, // iQOO 12
  { cameraScore: 68, batteryScore: 88, gamingScore: 94, performanceScore: 95, displayScore: 92, durabilityScore: 70, valueScore: 78 }, // iQOO Neo 9S Pro
];

async function seed(): Promise<void> {
  console.log('🌱 Starting seed...');

  await db.transaction(async (tx) => {
    // Wipe existing data (FK order matters)
    await tx.delete(phoneScores);
    await tx.delete(phones);

    // Insert phones in batches of 20
    const BATCH_SIZE = 20;
    const insertedIds: number[] = [];

    for (let i = 0; i < PHONES.length; i += BATCH_SIZE) {
      const batch = PHONES.slice(i, i + BATCH_SIZE);
      const inserted = await tx.insert(phones).values(batch).returning({ id: phones.id });
      insertedIds.push(...inserted.map((r) => r.id));
    }

    console.log(`✅ Inserted ${insertedIds.length} phones`);

    // Build scores with real phone IDs
    const scoreRows: NewPhoneScore[] = SCORE_DATA.map((scores, index) => ({
      phoneId: insertedIds[index]!,
      ...scores,
    }));

    // Insert scores in batches
    for (let i = 0; i < scoreRows.length; i += BATCH_SIZE) {
      await tx.insert(phoneScores).values(scoreRows.slice(i, i + BATCH_SIZE));
    }

    console.log(`✅ Inserted ${scoreRows.length} score records`);
  });

  console.log('🎉 Seed complete!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
