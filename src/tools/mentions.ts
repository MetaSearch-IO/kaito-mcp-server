import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerMentionsTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_mentions",
    {
      description: `TOOL CALLING: If you provide the token parameter, you MUST first read kaito://tokens and use a valid token ticker from that resource. Never guess token values.

Get daily mention counts for a token or keyword, broken down by source (Twitter, Discord, News, etc.).

INTERPRETATION GUIDE:
- Mentions are raw counts of how many times a token or keyword appeared across sources (Twitter, Discord, News, etc.). Unlike sentiment or mindshare, mentions measure volume of discussion without weighting for tone or relative share.
- Use the 30-day default for recent trend checks. For questions requiring historical context (baseline comparison, high/low/average, trend reversals), use a 12-month lookback.
- Always compare current volume to the period average — a single value alone is meaningless without context.
- Spike detection: flag any day exceeding >2x the period average as a significant volume spike. Note spike timing for cross-referencing with events or price moves.
- If no spikes found, say so explicitly — "No significant volume spikes detected" is valid output.
- Cross-reference spikes with kaito_events to identify potential catalysts behind volume surges.`,
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
      const data = await client.request("mentions", {
        token,
        keyword,
        start_date,
        end_date,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
