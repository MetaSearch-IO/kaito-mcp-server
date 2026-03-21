import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAnalyzeTokenPrompt } from "./analyze-token.js";
import { registerMarketRoundupPrompt } from "./market-roundup.js";
import { registerDiscoverTrendingPrompt } from "./discover-trending.js";
import { registerSocialListeningPrompt } from "./social-listening.js";
import { registerWatchlistPortfolioPrompt } from "./watchlist-portfolio.js";

export function registerPrompts(server: McpServer) {
  registerAnalyzeTokenPrompt(server);
  registerMarketRoundupPrompt(server);
  registerDiscoverTrendingPrompt(server);
  registerSocialListeningPrompt(server);
  registerWatchlistPortfolioPrompt(server);
}
