import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";
import { REQUIRED_TOKEN_GUIDANCE } from "../tool-guidance.js";

export function registerKolTokenMindshareTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_kol_token_mindshare",
    {
      description: `${REQUIRED_TOKEN_GUIDANCE}

Get top KOLs ranked by mindshare for a given token. Shows which key opinion leaders are driving the conversation around a specific project.

INTERPRETATION GUIDE:
- KOL token mindshare ranks individual key opinion leaders by their share of conversation about a specific token. Each result includes name, username, mindshare proportion, and rank.
- Top KOLs are the primary narrative drivers for a token — their posts disproportionately shape market perception.
- Cross-reference top KOLs with kaito_smart_followers to assess their credibility. A high-mindshare KOL with low smart followers may be high-volume but low-signal.
- Default 12m shows long-term narrative drivers. Use 7d/30d to see who is driving the current conversation.
- If all-zero data is returned for a ticker, retry with the full project name (e.g. HYPE → HYPERLIQUID). Some entities are indexed by name, not ticker.

WORKFLOWS: Commonly used in social_listening, among others. If a matching prompt template exists for your current workflow, call it for the full tool plan.`,
      inputSchema: {
        token: z.string().describe("Resolved token value from kaito_tokens (e.g. BTC, ETH, HYPERLIQUID)"),
        duration: z
          .enum(["24h", "48h", "7d", "30d", "3m", "6m", "12m", "all"])
          .optional()
          .describe("Time window for mindshare calculation (default: 12m)."),
        top_n: z
          .number()
          .optional()
          .describe("Number of top KOLs to return (default: 100)."),
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
}
