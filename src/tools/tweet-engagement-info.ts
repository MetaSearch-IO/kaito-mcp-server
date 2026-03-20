import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerTweetEngagementInfoTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_tweet_engagement_info",
    {
      description: `Get detailed engagement metrics for a specific tweet including likes, retweets, replies, views, and smart engagement count.

INTERPRETATION GUIDE:
- Tweet engagement info returns granular metrics for a single tweet: likes, retweets, replies, quotes, views, and smart engagement count.
- Smart engagement (interactions from Kaito-classified smart accounts) is the key signal — a tweet with low total engagement but high smart engagement is institutional-grade content.
- Compare smart engagement to total engagement to gauge audience quality. A high ratio indicates the tweet resonated with informed participants, not just retail.`,
      inputSchema: {
        tweet_id: z.string().describe("Twitter tweet ID (numeric string)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ tweet_id }) => {
      const data = await client.request("tweet_engagement_info", {
        tweet_id,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
