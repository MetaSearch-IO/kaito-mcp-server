import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";
import { OPTIONAL_TOKEN_GUIDANCE } from "../tool-guidance.js";

export function registerMentionsTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_mentions",
    {
      description: `${OPTIONAL_TOKEN_GUIDANCE}

Get daily mention counts for a token or keyword, aggregated across key sources (Twitter, News, Podcast, Research).

INTERPRETATION GUIDE:
- Mentions are raw counts of how many times a token or keyword appeared across key sources (Twitter, News, Podcast, Research). Unlike sentiment or mindshare, mentions measure volume of discussion without weighting for tone or relative share.
- Use the 30-day default for recent trend checks. For questions requiring historical context (baseline comparison, high/low/average, trend reversals), use a 12-month lookback.
- Always compare current volume to the period average — a single value alone is meaningless without context.
- Spike detection: flag any day exceeding >2x the period average as a significant volume spike. Note spike timing for cross-referencing with events or price moves.
- If no spikes found, say so explicitly — "No significant volume spikes detected" is valid output.
- Cross-reference spikes with kaito_events to identify potential catalysts behind volume surges.`,
      inputSchema: {
        token: z.string().optional().describe("Resolved token value from kaito_tokens (e.g. BTC, ETH, HYPERLIQUID)"),
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

      // Aggregate only the sources that matter: twitter, news, podcast, research.
      // The API returns per-source daily breakdowns in document_mentions.
      const KEEP_SOURCES = ["twitter", "news", "podcast", "research"] as const;

      if (
        data &&
        typeof data === "object" &&
        "document_mentions" in data &&
        typeof (data as Record<string, unknown>).document_mentions === "object"
      ) {
        const perSource = (data as Record<string, Record<string, Record<string, number>>>)
          .document_mentions;
        // Aggregate daily totals across kept sources only
        const aggregated: Record<string, number> = {};
        for (const source of KEEP_SOURCES) {
          const daily = perSource[source];
          if (!daily) continue;
          for (const [date, count] of Object.entries(daily)) {
            aggregated[date] = (aggregated[date] ?? 0) + count;
          }
        }
        // Sort by date
        const sorted = Object.fromEntries(
          Object.entries(aggregated).sort(([a], [b]) => a.localeCompare(b)),
        );
        return { content: [{ type: "text", text: JSON.stringify(sorted) }] };
      }

      // Fallback: return total_document_mentions if structure is unexpected
      const mentions =
        data && typeof data === "object" && "total_document_mentions" in data
          ? (data as Record<string, unknown>).total_document_mentions
          : data;
      return { content: [{ type: "text", text: JSON.stringify(mentions) }] };
    },
  );
}
