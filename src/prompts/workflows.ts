import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAnalyzeTokenPrompt } from "./analyze-token.js";
import { registerDailyMarketRoundupPrompt } from "./daily-market-roundup.js";
import { registerDiscoverTrendingPrompt } from "./discover-trending.js";
import { registerSocialListeningPrompt } from "./social-listening.js";
import { registerWatchlistPortfolioPrompt } from "./watchlist-portfolio.js";

export function registerPrompts(server: McpServer) {
  registerAnalyzeTokenPrompt(server);
  registerDailyMarketRoundupPrompt(server);
  registerDiscoverTrendingPrompt(server);
  registerSocialListeningPrompt(server);
  registerWatchlistPortfolioPrompt(server);
}
