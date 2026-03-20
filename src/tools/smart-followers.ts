import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerSmartFollowersTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_smart_followers",
    {
      description: `Get smart follower data for a Twitter user. 'count' mode returns cumulative smart follower count; 'users' mode returns the list of smart followers gained on a specific date.

Smart follower count is the PRIMARY credibility signal for any Twitter account. Tier interpretation:
- 5,000+ = Elite (Vitalik-level is ~10,000+). Anything they say moves markets.
- 1,000–5,000 = Strong (top ~1% of CT). Established KOLs, fund managers, prominent builders.
- 300–1,000 = Solid (top 1–10%). Respected community members, mid-tier analysts.
- 50–300 = Emerging. Known in niches but not broadly established.
- <50 = Low profile. Could be new, anon, or outside the smart network.

'users' mode returns followers in recency order — top of list = newest followers. Flag any top-100 Kaito accounts as high-signal follows. Rank notable followers by their own SF count.`,
      inputSchema: {
        user_id: z
          .string()
          .optional()
          .describe("Twitter user ID. One of user_id or username is required."),
        username: z
          .string()
          .optional()
          .describe("Twitter username. One of user_id or username is required."),
        date: z
          .string()
          .optional()
          .describe("Date YYYY-MM-DD (default: yesterday, must be >= 2024-01-01)"),
        mode: z
          .enum(["count", "users"])
          .optional()
          .describe("'count' for cumulative count, 'users' for follower list (default: count)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ user_id, username, date, mode }) => {
      const data = await client.request("smart_followers", {
        user_id,
        username,
        date,
        mode,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
