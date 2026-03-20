import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerEngagementTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_engagement",
    {
      description: `Get daily engagement metrics (total + smart/KOL engagement) for a token or keyword.

INTERPRETATION GUIDE:
- Engagement measures total interactions (likes, retweets, replies, quotes) plus a breakdown of smart/KOL engagement. Smart engagement specifically counts interactions from Kaito-classified smart accounts — a high smart-to-total ratio signals institutional interest.
- Use the 30-day default for recent trend checks. For questions requiring historical context (baseline comparison, high/low/average, trend reversals), use a 12-month lookback.
- Always compare current engagement to the period average — a single value alone is meaningless without context.
- Spike detection: flag any day exceeding >2x the period average as a significant engagement spike. Note spike timing for cross-referencing with events or price moves.
- Cross-reference spikes with kaito_events to identify potential catalysts behind engagement surges.`,
      inputSchema: {
        token: z.string().optional().describe("Token ticker (e.g. BTC, ETH)"),
        keyword: z.string().optional().describe("Search keyword"),
        start_date: z
          .string()
          .optional()
          .describe("Start date YYYY-MM-DD (default: 30 days ago, earliest: 2023-01-01)"),
        end_date: z
          .string()
          .optional()
          .describe("End date YYYY-MM-DD (default: tomorrow)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ token, keyword, start_date, end_date }) => {
      const data = await client.request("engagement", {
        token,
        keyword,
        start_date,
        end_date,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
