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
  const server = new McpServer({
    name: "kaito",
    version: "0.1.0",
  });

  const client = new KaitoClient();

  // 13 Tools
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
