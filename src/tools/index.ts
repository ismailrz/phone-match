import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RecommendationService } from '../modules/recommendations/recommendation.service.js';
import type { ComparisonService } from '../modules/comparisons/comparison.service.js';
import type { PhoneService } from '../modules/phones/phone.service.js';
import type { SearchService } from '../modules/search/search.service.js';
import { registerRecommendTool } from './recommend.tool.js';
import { registerCompareTool } from './compare.tool.js';
import { registerDetailsTool } from './details.tool.js';
import { registerSearchTool } from './search.tool.js';

export interface ToolDependencies {
  recommendationService: RecommendationService;
  comparisonService: ComparisonService;
  phoneService: PhoneService;
  searchService: SearchService;
}

export function registerAllTools(server: McpServer, deps: ToolDependencies): void {
  registerRecommendTool(server, deps.recommendationService);
  registerCompareTool(server, deps.comparisonService);
  registerDetailsTool(server, deps.phoneService);
  registerSearchTool(server, deps.searchService);
}
