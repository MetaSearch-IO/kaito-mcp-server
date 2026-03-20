import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";
import { MULTI_TOKEN_GUIDANCE } from "../tool-guidance.js";

export function registerAdvancedSearchTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_advanced_search",
    {
      description: `${MULTI_TOKEN_GUIDANCE}

Search ranked crypto feeds (Twitter & News) with AI summaries, sentiment scores, and extensive filters.

DISCOVERY MODE: Omit all tokens/query/keyword/usernames for unfiltered trending content - pure discovery feed ranked by relevance.

TIME RANGE: When the user specifies a time range (e.g. 'today', 'past week'), you MUST convert it to ISO 8601 timestamps and pass min_created_at / max_created_at accordingly.

PRIMARY TEXT INPUT:
- Use ONE main text field per call: either query or keyword.
- query is the main user-facing field. Write it as a compact bag of 2-6 high-signal words or a short phrase cluster that should co-occur in relevant results.
- keyword is kept for backward compatibility and can be used the same way as query.
- The backend handles query and keyword on the same search path, so do NOT split intent across them. If both are present, keep them aligned.
- Good style: entity + topic + event/action, e.g. "hyperliquid validator hack", "solana meme coin launch", "btc etf inflow".
- Remove filler words, generic words like "crypto" or "news", and temporal phrases from query/keyword. Pass time with min_created_at / max_created_at instead.

SEARCH BEHAVIOR — AND LOGIC:
- Kaito ANDs all top-level fields together. More fields = fewer results. Adding parameters narrows, never broadens.
- Use structured fields for tokens, usernames, sources, time, language, sentiment, and engagement thresholds instead of burying them in query/keyword.
- Default to ONE main question, topic, or comparison frame per call.
- It is OK to include multiple entities when they belong to the same frame, such as "Hyperliquid vs Lighter", "ETH vs SOL fees", or "BTC gold correlation".
- Split into multiple searches only when the user is combining unrelated topics, time windows, or objectives in one request.
- If a project name is ambiguous or a ticker exists, use tokens for disambiguation.
- Do NOT rely on tokens alone for major tickers (BTC, ETH, SOL) when the user wants a specific topic. Pair tokens with query/keyword.

QUERY CONSTRUCTION:
- Start with the smallest high-signal query/keyword that captures the user intent.
- Do NOT manually add long OR chains, synonym lists, plural variants, ticker variants, or handle variants by default. The backend already broadens recall through a secondary retrieval path.
- Use quotes or explicit AND/OR/NOT only when the user explicitly wants exact phrase matching or literal boolean logic.
- If results are sparse, relax the weakest qualifier or widen the time range instead of adding more terms.
- Default to sort_by: relevance unless the user explicitly asks for recency or another ranking.
- sentiment_type filters overall tweet sentiment, NOT sentiment about a specific token. Pair it with tokens when you need entity-scoped sentiment.

OUTPUT NOTES:
- smart_engagement is an integer (count of smart accounts that engaged) — NOT sentiment_score.
- Always show smart_engagement (SE) and kaito_smart_followers (SF) for cited tweets.
- author_user_id from results can be used with kaito_get_twitter_user for profile enrichment.
- NEVER fabricate details beyond what the API returns. Attribute every claim to a specific result with URL.`,
      inputSchema: {
        tokens: z
          .string()
          .optional()
          .describe(
            "Comma-separated resolved token values from kaito_tokens for entity disambiguation or entity-scoped filtering (e.g. BTC,ETH,HYPERLIQUID)"
          ),
        keyword: z
          .string()
          .optional()
          .describe(
            "Legacy-compatible primary text query. Use the same style as query: 2-6 high-signal words or a short phrase cluster."
          ),
        query: z
          .string()
          .optional()
          .describe(
            "Primary user-facing text query. Use 2-6 high-signal words or a short phrase cluster (e.g. 'hyperliquid validator hack', 'btc etf inflow'). Avoid filler words and time expressions."
          ),
        usernames: z
          .string()
          .optional()
          .describe("Comma-separated Twitter usernames (Twitter source only)"),
        sources: z
          .string()
          .optional()
          .describe("Comma-separated: Twitter, News (default: Twitter,News)"),
        min_created_at: z
          .string()
          .optional()
          .describe("Min creation date ISO 8601 (default: 90 days ago)"),
        max_created_at: z
          .string()
          .optional()
          .describe("Max creation date ISO 8601"),
        from: z
          .number()
          .optional()
          .describe("Pagination offset 0-500 (default: 0)"),
        size: z
          .number()
          .optional()
          .describe("Results per page 50-100 (default: 100)"),
        languages: z
          .string()
          .optional()
          .describe("Comma-separated: en, zh, ko, others (default: en)"),
        sort_by: z
          .enum(["relevance", "created_at", "engagement", "smart_engagement", "author", "length", "bookmark", "sentiment", "views"])
          .optional()
          .describe("Sort field (default: relevance). NOTE: [smart_engagement, engagement, sentiment, bookmark, views, author (ict follower count ranking)] are only supported when sources=Twitter (not compatible with News)"),
        sort_order: z
          .enum(["asc", "desc"])
          .optional()
          .describe("Sort order (default: desc). asc only works with created_at and sentiment"),
        tweet_length_type: z
          .enum(["short", "long", "thread", "article"])
          .optional()
          .describe("Twitter only: tweet length type"),
        tweet_type: z
          .enum(["tweet", "quote", "reply"])
          .optional()
          .describe("Twitter only: tweet type"),
        sentiment_type: z
          .enum(["bullish", "bearish", "neutral"])
          .optional()
          .describe("Twitter only: sentiment filter. Filters on overall tweet sentiment, NOT sentiment about a specific token — pair with tokens param to scope."),
        author_type: z
          .enum(["Organization", "Individual"])
          .optional()
          .describe("Twitter only: author type"),
        min_bookmark_count: z
          .number()
          .optional()
          .describe("Twitter only: min bookmarks"),
        max_bookmark_count: z
          .number()
          .optional()
          .describe("Twitter only: max bookmarks"),
        min_view_count: z
          .number()
          .optional()
          .describe("Twitter only: min views"),
        max_view_count: z
          .number()
          .optional()
          .describe("Twitter only: max views"),
        min_smart_engagement_count: z
          .number()
          .optional()
          .describe("Twitter only: min smart engagements"),
        max_smart_engagement_count: z
          .number()
          .optional()
          .describe("Twitter only: max smart engagements"),
        min_like_count: z
          .number()
          .optional()
          .describe("Twitter only: min likes"),
        max_like_count: z
          .number()
          .optional()
          .describe("Twitter only: max likes"),
        min_reply_count: z
          .number()
          .optional()
          .describe("Twitter only: min replies"),
        max_reply_count: z
          .number()
          .optional()
          .describe("Twitter only: max replies"),
        min_retweet_count: z
          .number()
          .optional()
          .describe("Twitter only: min retweets"),
        max_retweet_count: z
          .number()
          .optional()
          .describe("Twitter only: max retweets"),
        min_quote_count: z
          .number()
          .optional()
          .describe("Twitter only: min quotes"),
        max_quote_count: z
          .number()
          .optional()
          .describe("Twitter only: max quotes"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (params) => {
      const { query, size, ...rest } = params;

      const baseParams: Record<string, string | undefined> = {};
      for (const [key, value] of Object.entries(rest)) {
        if (value !== undefined) {
          baseParams[key] = value.toString();
        }
      }
      baseParams.size = Math.max(size ?? 100, 100).toString();
      baseParams.raw_text = "true";
      if (query !== undefined) baseParams.query = query;

      const data = await client.request("advanced_search", baseParams);

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
