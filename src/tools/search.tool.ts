import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SearchService } from '../modules/search/search.service.js';
import { SearchMcpInputSchema } from '../schemas/recommendation.schema.js';

export function registerSearchTool(server: McpServer, service: SearchService): void {
  server.tool(
    'search_phone',
    'Search and filter smartphones by brand, model, price range, operating system, RAM, and storage. Returns matching devices with key specs.',
    SearchMcpInputSchema.shape,
    async (filters) => {
      try {
        const results = await service.search({
          brand: filters.brand,
          model: filters.model,
          maxPrice: filters.maxPrice,
          minPrice: filters.minPrice,
          os: filters.os,
          minRam: filters.minRam,
          minStorage: filters.minStorage,
        });

        if (results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No phones found matching the specified filters. Try broader criteria.',
              },
            ],
          };
        }

        const formatted = results.map((p) => ({
          name: `${p.brand} ${p.model}`,
          price: `$${p.priceUsd}`,
          os: p.operatingSystem,
          chipset: p.chipset,
          ram: `${p.ram}GB`,
          storage: `${p.storage}GB`,
          battery: `${p.batteryMah}mAh`,
          display: `${p.displaySize}" ${p.displayType} ${p.refreshRate}Hz`,
          waterproof: p.waterproofRating ?? 'N/A',
          scores: p.scores,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ count: results.length, phones: formatted }, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: [{ type: 'text', text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
