import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerEventsTools(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_events",
    {
      description:
        "Get upcoming catalyst events for a token, with filtering by event type, source, and date range. Use the tokens resource to find valid tickers.",
      inputSchema: {
        token: z.string().describe("Token ticker (e.g. BTC, ETH)"),
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

  server.registerTool(
    "kaito_tweet_engagement_info",
    {
      description:
        "Get detailed engagement metrics for a specific tweet including likes, retweets, replies, views, and smart engagement count.",
      inputSchema: {
        tweet_id: z.string().describe("Twitter tweet ID (numeric string)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ tweet_id }) => {
      const data = await client.request("tweet_engagement_info", {
        tweet_id,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
