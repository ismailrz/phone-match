import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RecommendationService } from '../modules/recommendations/recommendation.service.js';
import { RecommendInputSchema } from '../schemas/recommendation.schema.js';

export function registerRecommendTool(server: McpServer, service: RecommendationService): void {
  server.tool(
    'recommend_phone',
    'Find the best smartphones matching your natural language requirements. Supports queries like "best camera phone under $800", "gaming phone with long battery", "phone for my parents".',
    RecommendInputSchema.shape,
    async ({ query }) => {
      try {
        const results = await service.recommend(query);

        if (results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No phones found matching your requirements. Try relaxing your constraints (e.g., increase the budget or remove brand preferences).',
              },
            ],
          };
        }

        const formatted = results.map((r) => ({
          rank: r.rank,
          phone: `${r.phone.brand} ${r.phone.model}`,
          score: r.finalScore,
          price: `$${r.phone.priceUsd}`,
          os: r.phone.operatingSystem,
          explanation: r.explanation,
          keySpecs: {
            chipset: r.phone.chipset,
            ram: `${r.phone.ram}GB`,
            storage: `${r.phone.storage}GB`,
            battery: `${r.phone.batteryMah}mAh`,
            charging: `${r.phone.chargingWatt}W`,
            display: `${r.phone.displaySize}" ${r.phone.displayType} ${r.phone.refreshRate}Hz`,
            waterproof: r.phone.waterproofRating ?? 'N/A',
            eSIM: r.phone.esimSupport,
          },
          scores: r.phone.scores,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ query, recommendations: formatted }, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: [{ type: 'text', text: `Error processing recommendation: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
