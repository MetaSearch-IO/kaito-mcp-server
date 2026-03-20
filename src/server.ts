import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KaitoClient } from "./client.js";
import { registerMarketDataTools } from "./tools/market-data.js";
import { registerSearchTools } from "./tools/search.js";
import { registerSocialTools } from "./tools/social.js";
import { registerRankingsTools } from "./tools/rankings.js";
import { registerEventsTools } from "./tools/events.js";
import { registerResources } from "./resources/reference.js";
import { registerPrompts } from "./prompts/workflows.js";

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "kaito",
      version: "0.1.0",
    },
    {
      instructions:
        "When any tool requires a 'token' parameter, you MUST first read the kaito://tokens resource to obtain a valid token ticker before calling that tool. " +
        "When any tool requires a 'narrative' parameter, you MUST first read the kaito://narratives resource to obtain a valid narrative ID before calling that tool. " +
        "Never guess or assume token tickers or narrative IDs — always resolve them from the appropriate resource first.",
    },
  );

  const client = new KaitoClient();

  // 16 Tools
  registerMarketDataTools(server, client);
  registerSearchTools(server, client);
  registerSocialTools(server, client);
  registerRankingsTools(server, client);
  registerEventsTools(server, client);

  // 2 Resources
  registerResources(server, client);

  // 2 Prompts
  registerPrompts(server);

  return server;
}
