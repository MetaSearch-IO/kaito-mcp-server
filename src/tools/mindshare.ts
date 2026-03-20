import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";
import { REQUIRED_TOKEN_GUIDANCE } from "../tool-guidance.js";

export function registerMindshareTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_mindshare",
    {
      description: `${REQUIRED_TOKEN_GUIDANCE}

Get daily mindshare time series for a crypto token. Mindshare = proportion of crypto Twitter conversation about this token. Use kaito_tokens to find valid token values.

INTERPRETATION GUIDE:
- Mindshare is the percentage of total crypto Twitter conversation attributed to this token. Higher mindshare = more attention relative to the entire market. A token at 2% mindshare captures 2% of all crypto discussion.
- If all-zero data is returned for a ticker, retry with the full project name (e.g. HYPE → HYPERLIQUID). Some entities are indexed by name, not ticker.
- Rank interpretation: Top 10 = dominant, Top 20 = strong, Top 50 = moderate, >50 = weak.
- Use the 30-day default for recent trend checks. For questions requiring historical context (baseline comparison, high/low/average, structural shifts), use a 12-month lookback.
- Always compare current value to the period average — a single value alone is meaningless without context.
- Use kaito_mindshare_delta alongside this tool for a quick snapshot of recent change direction.`,
      inputSchema: {
        token: z.string().describe("Resolved token value from kaito_tokens (e.g. BTC, ETH, HYPERLIQUID)"),
        start_date: z
          .string()
          .optional()
          .describe("Start date YYYY-MM-DD (default: 30 days ago, earliest: 2020-01-01)"),
        end_date: z
          .string()
          .optional()
          .describe("End date YYYY-MM-DD (default: tomorrow)"),
        scope: z
          .string()
          .optional()
          .describe("Set to 'pretge' to filter for Pre-TGE projects only"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ token, start_date, end_date, scope }) => {
      const data = await client.request("mindshare", {
        token,
        start_date,
        end_date,
        scope,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
