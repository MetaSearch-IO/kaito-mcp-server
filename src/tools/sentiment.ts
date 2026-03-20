import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerSentimentTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_sentiment",
    {
      description: `TOOL CALLING: Before calling this tool, you MUST first read kaito://tokens and use a valid token ticker from that resource for the token parameter. Never guess token values.

Get daily sentiment time series for a crypto token. Returns volume-weighted bullish/bearish scores and notable events. Use the tokens resource to find valid tickers.

INTERPRETATION GUIDE:
- Sentiment is absolute (volume-weighted, not averaged by default). A project with 10x more volume will have a higher absolute score even at similar tone.
- Always compare against the entity's own historical range rather than fixed thresholds. Each entity's baseline is different — an entity with baseline 0.3 at 0.5 is bullish; one with baseline 0.7 at 0.5 is bearish.
- Use the 30-day default for recent trend checks. For questions requiring historical context (baseline comparison, high/low/average, trend reversals), use a 12-month lookback.
- Do NOT confuse sentiment_score (volume-weighted float for tone × volume) with smart_engagement (integer count of smart accounts that engaged). They measure completely different things.
- Do NOT include price data in analysis unless explicitly asked.`,
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
}
