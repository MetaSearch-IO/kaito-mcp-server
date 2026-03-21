import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";
import { REQUIRED_TOKEN_GUIDANCE } from "../tool-guidance.js";

export function registerEventsTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_events",
    {
      description: `${REQUIRED_TOKEN_GUIDANCE}

Get upcoming catalyst events for a token, with filtering by event type, source, and date range. Use kaito_tokens to find valid token values.

INTERPRETATION GUIDE:
- Events are upcoming catalysts (token unlocks, launches, governance votes, conferences) sourced from multiple platforms. They represent scheduled, forward-looking information — not historical data.

CATEGORIZE returned events by type:
- Token unlocks = supply-side catalysts (dilution risk)
- Mainnet/testnet releases = product milestones
- Governance votes = protocol-level decisions (may be contentious)
- Conference appearances = visibility events
- Tokenomics updates = structural changes

If no events found, say so explicitly — "No scheduled events found" is valid output. When investigating a specific time window, flag events that fall within or near it as potential catalysts.

WORKFLOW PATTERN: Default call — start_date=today, end_date=3 months from today, sort_by="event_date", sort_order="asc". Flag events within 7 days as imminent.

WORKFLOWS: Commonly used in analyze_token, watchlist_portfolio, among others. If a matching prompt template exists for your current workflow, call it for the full tool plan.`,
      inputSchema: {
        token: z.string().describe("Resolved token value from kaito_tokens (e.g. BTC, ETH, HYPERLIQUID)"),
        start_date: z
          .string()
          .optional()
          .describe("Filter events starting on or after this date YYYY-MM-DD"),
        end_date: z
          .string()
          .optional()
          .describe("Filter events starting on or before this date YYYY-MM-DD"),
        min_announcement_date: z
          .string()
          .optional()
          .describe("Announcement date lower bound YYYY-MM-DD"),
        max_announcement_date: z
          .string()
          .optional()
          .describe("Announcement date upper bound YYYY-MM-DD"),
        event_types: z
          .string()
          .optional()
          .describe(
            "Comma-separated event types: Mainnet Release, Testnet Release, Roadmap Update, Token Generation Event, Conference Attendance, Proposal and Voting, Tokenomics Update, Token Unlock, Others",
          ),
        sources: z
          .string()
          .optional()
          .describe(
            "Comma-separated sources: Twitter Space, Twitter, Podcast, Conference, Vote, Governance, DefiLlama, Token Unlocks",
          ),
        sort_by: z
          .enum(["event_date", "project_name", "market_cap", "announcement_date"])
          .optional()
          .describe("Sort field"),
        sort_order: z
          .enum(["asc", "desc"])
          .optional()
          .describe("Sort order"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({
      token,
      start_date,
      end_date,
      min_announcement_date,
      max_announcement_date,
      event_types,
      sources,
      sort_by,
      sort_order,
    }) => {
      const data = await client.request("events", {
        token,
        start_date,
        end_date,
        min_announcement_date,
        max_announcement_date,
        event_types,
        sources,
        sort_by,
        sort_order,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
