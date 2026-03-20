import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KaitoClient } from "./client.js";
import { registerSentimentTool } from "./tools/sentiment.js";
import { registerMindshareTool } from "./tools/mindshare.js";
import { registerNarrativeMindshareTool } from "./tools/narrative-mindshare.js";
import { registerMentionsTool } from "./tools/mentions.js";
import { registerEngagementTool } from "./tools/engagement.js";
import { registerAdvancedSearchTool } from "./tools/advanced-search.js";
import { registerSmartFollowersTool } from "./tools/smart-followers.js";
import { registerSmartFollowingTool } from "./tools/smart-following.js";
import { registerGetTwitterUserTool } from "./tools/get-twitter-user.js";
import { registerKolTokenMindshareTool } from "./tools/kol-token-mindshare.js";
import { registerMarketSmartFollowingTool } from "./tools/market-smart-following.js";
import { registerMindshareArenaTool } from "./tools/mindshare-arena.js";
import { registerMindshareDeltaTool } from "./tools/mindshare-delta.js";
import { registerEventsTool } from "./tools/events.js";
import { registerTweetEngagementInfoTool } from "./tools/tweet-engagement-info.js";
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
        "When any tool requires a 'tokens' parameter, you MUST first read the kaito://tokens resource to obtain valid token tickers before calling that tool. " +
        "When any tool requires a 'narrative' parameter, you MUST first read the kaito://narratives resource to obtain a valid narrative ID before calling that tool. " +
        "Never guess or assume token tickers or narrative IDs; always resolve them from the appropriate resource first.",
    },
  );

  const client = new KaitoClient();

  // 15 Tools
  registerSentimentTool(server, client);
  registerMindshareTool(server, client);
  registerNarrativeMindshareTool(server, client);
  registerMentionsTool(server, client);
  registerEngagementTool(server, client);
  registerAdvancedSearchTool(server, client);
  registerSmartFollowersTool(server, client);
  registerSmartFollowingTool(server, client);
  registerGetTwitterUserTool(server, client);
  registerKolTokenMindshareTool(server, client);
  registerMarketSmartFollowingTool(server, client);
  registerMindshareArenaTool(server, client);
  registerMindshareDeltaTool(server, client);
  registerEventsTool(server, client);
  registerTweetEngagementInfoTool(server, client);

  // 2 Resources
  registerResources(server, client);

  // 2 Prompts
  registerPrompts(server);

  return server;
}
