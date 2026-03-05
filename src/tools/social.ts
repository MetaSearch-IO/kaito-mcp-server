import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerSocialTools(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_smart_followers",
    {
      description:
        "Get smart follower data for a Twitter user. 'count' mode returns cumulative smart follower count; 'users' mode returns the list of smart followers gained on a specific date.",
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

  server.registerTool(
    "kaito_smart_following",
    {
      description:
        "Get the latest 100 smart accounts followed by a Twitter user, in reverse chronological order.",
      inputSchema: {
        user_id: z
          .string()
          .optional()
          .describe("Twitter user ID. One of user_id or username is required."),
        username: z
          .string()
          .optional()
          .describe("Twitter username. One of user_id or username is required."),
        category: z
          .enum(["ALL", "Organization", "Individual"])
          .optional()
          .describe("Filter by account type"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ user_id, username, category }) => {
      const data = await client.request("smart_following", {
        user_id,
        username,
        category,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.registerTool(
    "kaito_kol_token_mindshare",
    {
      description:
        "Get top KOLs ranked by mindshare for a given token. Shows which key opinion leaders are driving the conversation around a specific project.",
      inputSchema: {
        token: z.string().describe("Token ticker (e.g. BTC, ETH)"),
        duration: z
          .enum(["24h", "48h", "7d", "30d", "3m", "6m", "12m", "all"])
          .optional()
          .describe("Time window for mindshare calculation (default: 12m)"),
        top_n: z
          .number()
          .optional()
          .describe("Number of top KOLs to return (default: 100)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ token, duration, top_n }) => {
      const data = await client.request("kol_token_mindshare", {
        token,
        duration,
        top_n: top_n?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.registerTool(
    "kaito_market_smart_following",
    {
      description:
        "Get accounts that smart followers have recently followed — a market-level social signal showing where smart money attention is flowing.",
      inputSchema: {
        duration: z
          .enum(["24h", "48h", "7d", "30d", "all_dates"])
          .optional()
          .describe("Time window (default: 24h). all_dates starts from 2024-01-01"),
        from: z
          .number()
          .optional()
          .describe("Pagination offset"),
        sort_by: z
          .enum(["earliest_time", "smart_followers", "followers_change", "change_ratio"])
          .optional()
          .describe("Sort field"),
        sort_order: z
          .enum(["asc", "desc"])
          .optional()
          .describe("Sort direction"),
        filter_smart_followers_operator: z
          .enum(["gte", "lte"])
          .optional()
          .describe("Smart followers filter operator"),
        filter_smart_followers_value: z
          .number()
          .optional()
          .describe("Smart followers filter threshold"),
        user_status: z
          .enum(["new", "existing", "all"])
          .optional()
          .describe("Filter by user status"),
        user_tag_individual_or_organization: z
          .enum(["Individual", "Organization", "all"])
          .optional()
          .describe("Filter by account type (default: Organization)"),
        user_type: z
          .enum(["kkol", "non_kkol", "all"])
          .optional()
          .describe("Filter by KOL status"),
        user_web3_relevance: z
          .enum(["relevant", "irrelevant"])
          .optional()
          .describe("Filter by web3 relevance"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ duration, from, sort_by, sort_order, filter_smart_followers_operator, filter_smart_followers_value, user_status, user_tag_individual_or_organization, user_type, user_web3_relevance }) => {
      const data = await client.request("market_smart_following", {
        duration,
        from: from?.toString(),
        sort_by,
        sort_order,
        filter_smart_followers_operator,
        filter_smart_followers_value: filter_smart_followers_value?.toString(),
        user_status,
        user_tag_individual_or_organization,
        user_type,
        user_web3_relevance,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
