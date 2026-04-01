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
import { registerTwitterOfficialAccountTool } from "./tools/twitter-official-account.js";
import { registerTwitterAccountTypeTool } from "./tools/twitter-account-type.js";
import { registerReferenceLookupTools } from "./tools/reference-lookup.js";
import { registerResources } from "./resources/reference.js";
import { registerPrompts } from "./prompts/workflows.js";
import { CURRENT_VERSION, SERVER_NAME } from "./package-metadata.js";
import { SERVER_INSTRUCTIONS } from "./server-instructions.js";

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: SERVER_NAME,
      version: CURRENT_VERSION,
    },
    {
      instructions: SERVER_INSTRUCTIONS,
    },
  );

  const client = new KaitoClient();

  // Tools
  registerReferenceLookupTools(server, client);
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
  registerTwitterOfficialAccountTool(server, client);
  registerTwitterAccountTypeTool(server, client);

  // Resources
  registerResources(server, client);

  // Prompts
  registerPrompts(server);

  return server;
}
