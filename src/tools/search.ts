import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerSearchTools(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_advanced_search",
    {
      description:
        "Search ranked crypto feeds (Twitter & News) with AI summaries, sentiment scores, and extensive filters. Omit tokens/keyword/usernames for discovery mode (trending content). IMPORTANT: When the user specifies a time range (e.g. 'today', 'past week'), you MUST convert it to ISO 8601 timestamps and pass min_created_at / max_created_at accordingly. TIP: Leaving sort_by unset (defaults to relevance) usually gives the best results. NOTE: raw_text defaults to true (returns original tweet text). If a keyword search returns no results, nl_query (natural language semantic search) is automatically used as fallback. PAGINATION REQUIREMENT: Always fetch a minimum of 100 results for the same query by calling this tool multiple times with the same parameters, incrementing `from` by `size` each time (e.g. from=0, from=20, from=40, from=60, from=80) until at least 100 results are collected.",
      inputSchema: {
        tokens: z
          .string()
          .optional()
          .describe("Comma-separated token tickers (e.g. BTC,ETH)"),
        keyword: z.string().optional().describe("Search keyword"),
        nl_query: z
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
          .describe("Pagination offset 0-500 (default: 0). Increment by size each call to paginate (e.g. 0 → 20 → 40 → 60 → 80) until 100+ results are collected."),
        size: z
          .number()
          .optional()
          .describe("Results per page 1-20 (default: 20). Use with `from` to paginate and collect at least 100 results total."),
        languages: z
          .string()
          .optional()
          .describe("Comma-separated: en, zh, ko, others (default: en)"),
        sort_by: z
          .enum(["relevance", "created_at", "engagement", "smart_engagement", "author", "length", "bookmark", "sentiment", "views"])
          .optional()
          .describe("Sort field (default: relevance). NOTE: smart_engagement is only supported when sources=Twitter (not compatible with News)"),
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
          .describe("Twitter only: sentiment filter"),
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
      const { keyword, nl_query, size, ...rest } = params;

      const baseParams: Record<string, string | undefined> = {};
      for (const [key, value] of Object.entries(rest)) {
        if (value !== undefined) {
          baseParams[key] = value.toString();
        }
      }
      if (size !== undefined) baseParams.size = Math.min(20, Math.max(1, size)).toString();
      baseParams.raw_text = "true";

      type SearchResult = { url?: string };
      type SearchData = { results?: SearchResult[] };

      const results: SearchResult[] = [];
      const seenUrls = new Set<string>();

      const merge = (data: SearchData) => {
        for (const item of data.results ?? []) {
          if (item && item.url && !seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            results.push(item);
          }
        }
      };

      // Validate: smart_engagement sort is not supported when News source is included (default sources includes News)
      const sourcesIncludesNews = !baseParams.sources || baseParams.sources.toLowerCase().includes("news");
      if (baseParams.sort_by === "smart_engagement" && sourcesIncludesNews) {
        return { content: [{ type: "text", text: "Error: sort_by=smart_engagement is not supported when sources includes News. Set sources=Twitter to use smart_engagement sorting." }] };
      }

      const pageSize = size !== undefined ? Math.min(20, Math.max(1, size)) : 20;
      const TARGET = 100;

      const fetchPages = async (extraParams: Record<string, string | undefined>) => {
        let from = 0;
        while (results.length < TARGET) {
          const data = await client.request("advanced_search", {
            ...baseParams,
            ...extraParams,
            size: pageSize.toString(),
            from: from.toString(),
          }) as SearchData;
          const before = results.length;
          merge(data);
          // Stop if API returned no results or fewer than a full page (no more data)
          if (!data.results?.length || data.results.length < pageSize) break;
          // Stop if we added nothing new (all duplicates)
          if (results.length === before) break;
          from += pageSize;
        }
      };

      // 1. keyword search (priority)
      if (keyword) {
        await fetchPages({ keyword });
      }

      // 2. nl_query search — always run after keyword (no keyword passed here)
      const effectiveNlQuery = nl_query ?? keyword;
      if (effectiveNlQuery) {
        await fetchPages({ nl_query: effectiveNlQuery });
      }

      // If neither keyword nor nl_query provided, run a plain search
      if (!keyword && !nl_query) {
        await fetchPages({});
      }

      return { content: [{ type: "text", text: JSON.stringify({ results }, null, 2) }] };
    },
  );
}
