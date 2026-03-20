import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerGetTwitterUserTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_get_twitter_user",
    {
      description: `Get Twitter user profile metadata by user ID, including display name, username, bio, profile image, follower stats, and account classification.

IMPORTANT: Requires numeric user_id (available from search results as author_user_id). Cannot look up by username.
- Bio is self-reported — frame as "describes themselves as", not verified fact.
- Run in parallel with kaito_smart_followers (by username) for the same account to avoid extra latency.
- Profile metadata enriches but does not replace smart follower count as the primary credibility signal. A high-follower account with low smart followers is retail-popular, not credible among smart accounts.
- Never assume roles (founder, investor, insider) unless bio or verified sources explicitly state it.`,
      inputSchema: {
        user_id: z
          .string()
          .describe("Twitter user ID to look up (for example: 950486928784228352)."),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ user_id }) => {
      const data = await client.request("get_twitter_user", {
        user_id,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
