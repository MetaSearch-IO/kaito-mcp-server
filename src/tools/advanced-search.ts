import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerAdvancedSearchTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_advanced_search",
    {
      description: `Search ranked crypto feeds (Twitter & News) with AI summaries, sentiment scores, and extensive filters.

DISCOVERY MODE: Omit all tokens/keyword/usernames for unfiltered trending content — pure discovery feed ranked by relevance.

TIME RANGE: When the user specifies a time range (e.g. 'today', 'past week'), you MUST convert it to ISO 8601 timestamps and pass min_created_at / max_created_at accordingly.

SEARCH BEHAVIOR — AND LOGIC:
- Kaito ANDs all top-level fields together. More fields = fewer results. Adding parameters narrows, never broadens.
- Default to ONE entity field per call. Avoid piling on tokens + keyword + topics unless you intentionally want a very narrow result set.
- Prefer keyword over tokens as primary search — keyword has ~3.5x higher recall. Run a parallel tokens call as supplementary and merge results.
- If tokens returns empty, the token may not be indexed — fall back to keyword immediately.
- Do NOT use tokens alone for major tickers (BTC, ETH, SOL) — result set is too broad. Always pair with a keyword strategy.

KEYWORD SYNTAX:
- Plain unquoted keywords (e.g. "liquid staking") use analyzed AND matching — both terms must match but need not be adjacent. Phrase/proximity only boosts ranking.
- "quoted phrase" = exact adjacent phrase match (hard constraint).
- OR between variants of the SAME concept: "memecoin" OR "memecoins" OR "meme coin". OR must only broaden variants — never mix different concepts.
- Spaces between OR-groups act as AND: "EntityA" OR "@handle" "topic" OR "topics" = (A OR handle) AND (topic OR topics).
- #keyword# = case-sensitive match (useful for ambiguous tickers: #SOL# avoids "solution", #AI# avoids "said").
- [keyword] = English-stemmed match ([staking] matches "staked", "stakes").
- Precedence: AND binds tighter than OR.

SEARCH STRATEGY:
- Start with plain unquoted keyword, then tighten with explicit syntax only if needed.
- OR-expand aggressively within each AND-group: include plurals, abbreviations, handles, ticker variants.
- Common-word project names (Lighter, Drift, Pump): prefer tokens param for disambiguation via Kaito's entity linking.
- For comparison queries: use dual-quoted terms like "Hyperliquid" "Lighter" to AND both names.
- sentiment_type filters on overall tweet sentiment, NOT about a specific token — always pair with tokens param to scope sentiment to an entity.
- Default to sort_by: relevance unless explicitly asked otherwise.

PAGINATION:
- Scale to query specificity: broad single-entity = 10 pages (200 results), moderate/themed = 5-7 pages, narrow comparison = 2-3 pages.
- News: always 1 page (20 results) — high efficiency.
- Make Twitter + News calls in parallel when both sources needed.

OUTPUT NOTES:
- smart_engagement is an integer (count of smart accounts that engaged) — NOT sentiment_score.
- Always show smart_engagement (SE) and kaito_smart_followers (SF) for cited tweets.
- author_user_id from results can be used with kaito_get_twitter_user for profile enrichment.
- NEVER fabricate details beyond what the API returns. Attribute every claim to a specific result with URL.`,
      inputSchema: {
        tokens: z
          .string()
          .optional()
          .describe("Comma-separated token tickers (e.g. BTC,ETH)"),
        keyword: z.string().optional().describe("Search keyword"),
        query: z
          .string()
          .optional()
          .describe(
            "Natural language search query for semantic search (e.g. 'latest news about Bitcoin ETF'). Automatically used as fallback when keyword search returns no results.",
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
