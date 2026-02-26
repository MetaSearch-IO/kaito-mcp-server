import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerMarketDataTools(
  server: McpServer,
  client: KaitoClient,
) {
  server.registerTool(
    "kaito_sentiment",
    {
      description:
        "Get daily sentiment time series for a crypto token. Returns volume-weighted bullish/bearish scores and notable events. Use the tokens resource to find valid tickers.",
      inputSchema: {
        token: z.string().describe("Token ticker (e.g. BTC, ETH)"),
        start_date: z
          .string()
          .optional()
          .describe("Start date YYYY-MM-DD (default: 30 days ago, earliest: 2020-01-01)"),
        end_date: z
          .string()
          .optional()
          .describe("End date YYYY-MM-DD (default: tomorrow)"),
        adjusted: z
          .boolean()
          .optional()
          .describe("Include replies/quotes, exclude org accounts, weight by smart engagement (default: true)"),
        average: z
          .boolean()
          .optional()
          .describe("Return average sentiment -1 to +1 instead of absolute volume-weighted (default: false)"),
        gaussian: z
          .boolean()
          .optional()
          .describe("Apply Gaussian smoothing (default: true)"),
        language: z
          .enum(["all", "en", "zh", "ko", "others"])
          .optional()
          .describe("Language filter (default: all)"),
        version: z
          .enum(["2", "3"])
          .optional()
          .describe("Sentiment model version (default: 3)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ token, start_date, end_date, adjusted, average, gaussian, language, version }) => {
      const data = await client.request("sentiment", {
        token,
        start_date,
        end_date,
        adjusted: adjusted?.toString(),
        average: average?.toString(),
        gaussian: gaussian?.toString(),
        language,
        version,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.registerTool(
    "kaito_mindshare",
    {
      description:
        "Get daily mindshare time series for a crypto token. Mindshare = proportion of crypto Twitter conversation about this token. Use the tokens resource to find valid tickers.",
      inputSchema: {
        token: z.string().describe("Token ticker (e.g. BTC, ETH)"),
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

  server.registerTool(
    "kaito_narrative_mindshare",
    {
      description:
        "Get daily mindshare time series for a crypto narrative (e.g. AI, DeFi, L2). Use the narratives resource to find valid narrative IDs.",
      inputSchema: {
        narrative: z.string().describe("Narrative ID (e.g. AI, DeFi). See narratives resource."),
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
    async ({ narrative, start_date, end_date }) => {
      const data = await client.request("narrative_mindshare", {
        narrative,
        start_date,
        end_date,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.registerTool(
    "kaito_mentions",
    {
      description:
        "Get daily mention counts for a token or keyword, broken down by source (Twitter, Discord, News, etc.).",
      inputSchema: {
        token: z.string().optional().describe("Token ticker (e.g. BTC, ETH)"),
        keyword: z.string().optional().describe("Search keyword"),
        start_date: z
          .string()
          .optional()
          .describe("Start date YYYY-MM-DD (earliest: 2023-01-01)"),
        end_date: z
          .string()
          .optional()
          .describe("End date YYYY-MM-DD (default: today)"),
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

  server.registerTool(
    "kaito_engagement",
    {
      description:
        "Get daily engagement metrics (total + smart/KOL engagement) for a token or keyword.",
      inputSchema: {
        token: z.string().optional().describe("Token ticker (e.g. BTC, ETH)"),
        keyword: z.string().optional().describe("Search keyword"),
        start_date: z
          .string()
          .optional()
          .describe("Start date YYYY-MM-DD (earliest: 2023-01-01)"),
        end_date: z
          .string()
          .optional()
          .describe("End date YYYY-MM-DD (default: today)"),
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
