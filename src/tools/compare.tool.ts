import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ComparisonService } from '../modules/comparisons/comparison.service.js';
import { CompareInputSchema } from '../schemas/recommendation.schema.js';
import { NotFoundError } from '../types/index.js';
import type { PhoneWithScores, ScoreKey } from '../types/index.js';

const SCORE_LABELS: [ScoreKey, string][] = [
  ['cameraScore', 'Camera'],
  ['batteryScore', 'Battery'],
  ['gamingScore', 'Gaming'],
  ['performanceScore', 'Performance'],
  ['displayScore', 'Display'],
  ['durabilityScore', 'Durability'],
  ['valueScore', 'Value'],
];

function formatScoreTable(phones: PhoneWithScores[]): string {
  const names = phones.map((p) => `${p.brand} ${p.model}`);
  const header = ['Category', ...names].join(' | ');
  const separator = Array(names.length + 1)
    .fill('---')
    .join(' | ');

  const rows = SCORE_LABELS.map(([key, label]) => {
    const scores = phones.map((p) => String(p.scores[key]).padStart(3));
    return [label, ...scores].join(' | ');
  });

  return [header, separator, ...rows].join('\n');
}

export function registerCompareTool(server: McpServer, service: ComparisonService): void {
  server.tool(
    'compare_phones',
    'Compare two or more smartphones side by side across all performance dimensions (camera, battery, gaming, performance, display, durability, value). Returns a score table and recommendation.',
    CompareInputSchema.shape,
    async ({ phones }) => {
      try {
        const result = await service.compare(phones);

        const scoreTable = formatScoreTable(result.phones);
        const winnerName = `${result.winner.brand} ${result.winner.model}`;

        const output = {
          comparison: {
            phones: result.phones.map((p) => ({
              name: `${p.brand} ${p.model}`,
              price: `$${p.priceUsd}`,
              os: p.operatingSystem,
              chipset: p.chipset,
              scores: p.scores,
            })),
            scoreTable,
            analysis: result.analysis,
            recommendation: {
              winner: winnerName,
              reason: `${winnerName} leads in overall balanced performance across all 7 dimensions.`,
            },
          },
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
      } catch (err) {
        const message =
          err instanceof NotFoundError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Unknown error';
        return {
          content: [{ type: 'text', text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
