import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerMindshareDeltaTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_mindshare_delta",
    {
      description: `Get top gainers and losers by mindshare change over a time window. Use sort_type='desc' for biggest gainers, 'asc' for biggest losers.

INTERPRETATION GUIDE:
- Mindshare delta measures the absolute change in mindshare proportion over the selected time window. Each result includes current mindshare and the change value (positive = gaining attention, negative = losing).
- Use alongside kaito_mindshare for a quick snapshot of recent change direction. kaito_mindshare provides the full time-series trend; this tool shows who's moving fastest right now.
- A large positive delta on a low-mindshare project is a stronger signal than the same delta on a top-10 project — context matters.
- Default 24h captures intraday momentum. Use 7d/30d for trend confirmation, 3m/6m/12m for structural shifts.

WORKFLOW PATTERN: Results include a ticker_id field. Use it directly as the tokens= value in follow-up kaito_advanced_search calls — no need to call kaito_tokens again.

WORKFLOWS: Commonly used in discover_trending, market_roundup, among others. If a matching prompt template exists for your current workflow, call it for the full tool plan.`,
      inputSchema: {
        duration: z
          .enum(["24h", "48h", "7d", "30d", "3m", "6m", "12m", "all"])
          .optional()
          .describe("Time window (default: 24h)"),
        sort_type: z
          .enum(["desc", "asc"])
          .optional()
          .describe("'desc' for gainers, 'asc' for losers (default: desc)"),
        limit: z
          .number()
          .optional()
          .describe("Number of results to return"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ duration, sort_type, limit }) => {
      const data = await client.request("mindshare_delta", {
        duration,
        sort_type,
        limit: limit?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
