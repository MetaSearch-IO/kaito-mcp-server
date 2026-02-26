import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  server.registerPrompt(
    "analyze_token",
    {
      description:
        "Comprehensive analysis of a crypto token: sentiment, mindshare, mentions, engagement, events, and recent news.",
      argsSchema: {
        token: z.string().describe("Token ticker (e.g. BTC, ETH)"),
        days: z
          .string()
          .optional()
          .describe("Number of days to look back (default: 30)"),
      },
    },
    ({ token, days }) => {
      const lookback = days || "30";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Perform a comprehensive analysis of the crypto token "${token}" over the last ${lookback} days. Follow these steps in order:

1. **Sentiment**: Call kaito_sentiment for ${token} to understand market sentiment trends.
2. **Mindshare**: Call kaito_mindshare for ${token} to see its share of crypto Twitter conversation.
3. **Mentions**: Call kaito_mentions for ${token} to track mention volume across sources.
4. **Engagement**: Call kaito_engagement for ${token} to measure total and smart engagement.
5. **Events**: Call kaito_events for ${token} to find upcoming catalysts.
6. **News & Discussion**: Call kaito_advanced_search with tokens=${token} to find the most relevant recent content.

After gathering all data, provide a structured analysis covering:
- Overall sentiment trend (bullish/bearish/neutral)
- Mindshare trajectory (growing/declining/stable)
- Key events and catalysts ahead
- Notable discussions and news
- Summary assessment with key takeaways`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "discover_trending",
    {
      description:
        "Discover trending crypto projects and narratives using mindshare rankings and recent content.",
      argsSchema: {
        duration: z
          .string()
          .optional()
          .describe("Time window for rankings: 24h, 7d, 30d (default: 24h)"),
      },
    },
    ({ duration }) => {
      const window = duration || "24h";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Discover what's trending in crypto right now using a ${window} time window. Follow these steps:

1. **Mindshare Arena**: Call kaito_mindshare_arena with duration=${window} to see top projects by mindshare.
2. **Pre-TGE Arena**: Call kaito_pre_tge_arena with window=${window} to find trending pre-token projects.
3. **Trending Content**: Call kaito_advanced_search in discovery mode (no tokens/keyword) to see what's trending.

After gathering all data, provide:
- Top 10 projects by mindshare with their scores
- Notable Pre-TGE projects gaining attention
- Key trending topics and discussions
- Any emerging narratives or themes
- Summary of the current market mood`,
            },
          },
        ],
      };
    },
  );
}
