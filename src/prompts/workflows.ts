import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  server.registerPrompt(
    "analyze_token",
    {
      description:
        "Comprehensive analysis of a crypto token: sentiment, mindshare, mentions, engagement, events, and recent news.",
      argsSchema: {
        token: z
          .string()
          .describe(
            "Project name, ticker, or resolved token value (e.g. Bitcoin, BTC, HYPERLIQUID)",
          ),
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

1. **Resolve Token**: Call kaito_tokens with query="${token}". Save the first returned token value as 'RESOLVED_TOKEN', and use 'RESOLVED_TOKEN' for all remaining token/tokens parameters.
2. **Sentiment**: Call kaito_sentiment for 'RESOLVED_TOKEN' to understand market sentiment trends.
3. **Mindshare**: Call kaito_mindshare for 'RESOLVED_TOKEN' to see its share of crypto Twitter conversation.
4. **Mentions**: Call kaito_mentions for 'RESOLVED_TOKEN' to track mention volume across sources.
5. **Engagement**: Call kaito_engagement for 'RESOLVED_TOKEN' to measure total and smart engagement.
6. **Events**: Call kaito_events for 'RESOLVED_TOKEN' to find upcoming catalysts.
7. **KOL Mindshare**: Call kaito_kol_token_mindshare for 'RESOLVED_TOKEN' to see which KOLs are driving the conversation.
8. **News & Discussion**: Call kaito_advanced_search with tokens=RESOLVED_TOKEN to find the most relevant recent content.

After gathering all data, provide a structured analysis covering:
- Overall sentiment trend (bullish/bearish/neutral)
- Mindshare trajectory (growing/declining/stable)
- Top KOLs and their influence on the token's narrative
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
        "Discover trending crypto projects and narratives using mindshare rankings, delta movers, smart money signals, and recent content.",
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
2. **Pre-TGE Arena**: Call kaito_mindshare_arena with duration=${window}, pre_tge=true to find trending pre-token projects.
3. **Mindshare Movers**: Call kaito_mindshare_delta with duration=${window} to find biggest gainers and losers.
4. **Smart Money Signal**: Call kaito_market_smart_following with duration=${window} to see who smart followers are newly following.
5. **Trending Content**: Call kaito_advanced_search in discovery mode (no tokens/keyword) to see what's trending.

After gathering all data, provide:
- Top 10 projects by mindshare with their scores
- Biggest mindshare gainers and losers
- Accounts attracting smart follower attention
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
