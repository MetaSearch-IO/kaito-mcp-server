import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerSearchTools(server: McpServer, client: KaitoClient) {
  server.tool(
    "kaito_advanced_search",
    "Search ranked crypto feeds (Twitter & News) with AI summaries, sentiment scores, and extensive filters. Omit tokens/keyword/usernames for discovery mode (trending content).",
    {
      tokens: z
        .string()
        .optional()
        .describe("Comma-separated token tickers (e.g. BTC,ETH)"),
      keyword: z.string().optional().describe("Search keyword"),
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
        .describe("Results per page 1-20 (default: 20)"),
      languages: z
        .string()
        .optional()
        .describe("Comma-separated: en, zh, ko, others (default: en)"),
      sort_by: z
        .enum(["relevance", "created_at", "engagement", "smart_engagement", "author", "length", "bookmark", "sentiment", "views"])
        .optional()
        .describe("Sort field (default: relevance)"),
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
    {
      readOnlyHint: true,
      openWorldHint: true,
    },
    async (params) => {
      const queryParams: Record<string, string | undefined> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          queryParams[key] = value.toString();
        }
      }
      const data = await client.request("advanced_search", queryParams);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
