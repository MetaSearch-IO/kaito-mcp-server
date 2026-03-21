import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerMarketSmartFollowingTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_market_smart_following",
    {
      description: `Get accounts that smart followers have recently followed — a market-level social signal showing where smart money attention is flowing.

RECOMMENDED DEFAULTS for early-stage signal discovery:
- user_tag_individual_or_organization: Organization
- user_web3_relevance: relevant
- filter_smart_followers_operator: lte, filter_smart_followers_value: 100 (low SF = early-stage)
- sort_by: followers_change, sort_order: desc (biggest gainers = freshest signal)
This combination filters for emerging projects gaining institutional attention, not established players.

Limit analysis to top 15 results for signal-to-noise. If 401 error (requires higher API tier), suggest using top smart_engagement authors from kaito_advanced_search as a proxy.

WORKFLOWS: Commonly used in discover_trending, market_roundup, among others. If a matching prompt template exists for your current workflow, call it for the full tool plan.`,
      inputSchema: {
        duration: z
          .enum(["24h", "48h", "7d", "30d", "all_dates"])
          .optional()
          .describe("Time range (default: 24h). all_dates covers from 2024-01-01."),
        from: z
          .number()
          .optional()
          .describe("Pagination offset (default: 0)."),
        sort_by: z
          .enum(["earliest_time", "smart_followers", "followers_change", "change_ratio"])
          .optional()
          .describe("Field to sort by (default sort direction is desc when sort_by is set)."),
        sort_order: z
          .enum(["asc", "desc"])
          .optional()
          .describe("Sort direction (default: desc)."),
        filter_smart_followers_operator: z
          .enum(["gte", "lte"])
          .optional()
          .describe("Filter operator for smart follower count: gte (≥) or lte (≤). Must be paired with filter_smart_followers_value."),
        filter_smart_followers_value: z
          .number()
          .optional()
          .describe("Integer threshold for smart follower count. Must be paired with filter_smart_followers_operator."),
        user_status: z
          .enum(["new", "existing", "all"])
          .optional()
          .describe("Filter by user status: new = first followed within selected duration (default: all)."),
        user_tag_individual_or_organization: z
          .enum(["Individual", "Organization", "all"])
          .optional()
          .describe("Filter by account type (default: Organization)."),
        user_type: z
          .enum(["kkol", "non_kkol", "all"])
          .optional()
          .describe("Filter by KOL classification: kkol = Kaito-classified KOLs only (default: all)."),
        user_web3_relevance: z
          .enum(["relevant", "irrelevant"])
          .optional()
          .describe("Filter by Web3 relevance (omit to include all)."),
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
