import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PhoneService } from '../modules/phones/phone.service.js';
import { PhoneDetailsInputSchema } from '../schemas/recommendation.schema.js';
import { NotFoundError } from '../types/index.js';

export function registerDetailsTool(server: McpServer, service: PhoneService): void {
  server.tool(
    'phone_details',
    'Get complete specifications and scores for a specific smartphone. Supports partial name matching (e.g., "iPhone 17 Pro" or "Galaxy S25 Ultra").',
    PhoneDetailsInputSchema.shape,
    async ({ phone: phoneName }) => {
      try {
        const phone = await service.getByName(phoneName);

        const details = {
          name: `${phone.brand} ${phone.model}`,
          brand: phone.brand,
          model: phone.model,
          releaseYear: phone.releaseYear,
          price: `$${phone.priceUsd}`,
          operatingSystem: phone.operatingSystem,
          specifications: {
            chipset: phone.chipset,
            ram: `${phone.ram}GB`,
            storage: `${phone.storage}GB`,
            battery: {
              capacity: `${phone.batteryMah}mAh`,
              charging: `${phone.chargingWatt}W`,
            },
            display: {
              size: `${phone.displaySize}"`,
              type: phone.displayType,
              refreshRate: `${phone.refreshRate}Hz`,
            },
            waterproofRating: phone.waterproofRating ?? 'None',
            eSIM: phone.esimSupport,
          },
          scores: {
            camera: phone.scores.cameraScore,
            battery: phone.scores.batteryScore,
            gaming: phone.scores.gamingScore,
            performance: phone.scores.performanceScore,
            display: phone.scores.displayScore,
            durability: phone.scores.durabilityScore,
            value: phone.scores.valueScore,
            overall: Math.round(
              Object.values(phone.scores).reduce((a, b) => a + b, 0) / 7,
            ),
          },
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(details, null, 2) }],
        };
      } catch (err) {
        if (err instanceof NotFoundError) {
          return {
            content: [
              {
                type: 'text',
                text: `${err.message}\n\nTry: "iPhone 17 Pro Max", "Samsung Galaxy S25 Ultra", "Pixel 9 Pro", "OnePlus 13", "Nothing Phone 3a"`,
              },
            ],
            isError: true,
          };
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: [{ type: 'text', text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
