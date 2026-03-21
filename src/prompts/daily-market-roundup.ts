import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDailyMarketRoundupPrompt(server: McpServer) {
  server.registerPrompt(
    "daily_market_roundup",
    {
      description:
        "Daily market roundup: priority-ranked briefing of top stories with smart account signals, mindshare movers, and catalysts.",
      argsSchema: {},
    },
    () => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate a daily market roundup by gathering data from multiple sources. Follow these steps exactly — do not skip or shortcut any step.

**Batch 1 — Run these four calls in parallel (no dependencies):**

1. kaito_advanced_search with sort_by="smart_engagement", sources="Twitter", size=50, min_created_at set to 24 hours ago in ISO 8601 (no tokens, no keyword — pure discovery mode).
2. kaito_market_smart_following with duration="24h", user_tag_individual_or_organization="Organization", user_web3_relevance="relevant", filter_smart_followers_operator="lte", filter_smart_followers_value=100, sort_by="followers_change", sort_order="desc".
3. kaito_mindshare_delta with duration="24h" for biggest mindshare gainers.
4. kaito_market_smart_following with duration="24h", user_tag_individual_or_organization="Individual", user_web3_relevance="relevant", sort_by="followers_change", sort_order="desc".

**Batch 2 — Run after Batch 1 completes (depends on Batch 1 results). Steps 5, 6, and 7 can run in parallel with each other:**

5. From Step 2 results, pick the top 5 accounts by followers_change. Run TWO searches (2 calls total, not 10):
   a. kaito_advanced_search with keyword="@{handle1} OR @{handle2} OR @{handle3} OR @{handle4} OR @{handle5}", sources="Twitter", size=50 — what others say about them, combined into one OR query.
   b. kaito_advanced_search with usernames="{handle1},{handle2},{handle3},{handle4},{handle5}" (comma-separated), sources="Twitter", size=50 — what they're posting, combined into one call.
6. From Step 3 results, for the top 5 gainers: call kaito_advanced_search with tokens="{ticker_id}" (use the ticker_id value directly from the mindshare_delta response — no need to call kaito_tokens), sort_by="smart_engagement", sources="Twitter", size=20 to understand catalysts. These CANNOT be combined because the tokens parameter uses AND logic, so run all 5 searches in parallel.
7. From Step 4 results, pick the top 5 individuals by followers_change. Run ONE search: kaito_advanced_search with usernames="{handle1},{handle2},{handle3},{handle4},{handle5}" (comma-separated), sources="Twitter", size=50, min_created_at set to 24 hours ago — what they've been saying that's driving new smart followers.

**Output Structure**

Produce a priority-ranked briefing. Identify the 5–7 most important stories from the gathered data, rank them by market impact, and present each as a self-contained brief. Do NOT use "smart money" — always say "smart accounts" instead.

Start with an **Answer** section: 2–3 paragraphs that directly tell the reader what happened today and what matters most. This is the PRIMARY output — write as if the reader will only read this section. Lead with the single biggest story and its implications, then cover 2–3 secondary themes, weaving in smart account signals and data as supporting evidence. End with what to watch tomorrow.

Then a **TL;DR** section: one line per ranked story, fact-first, no fluff. Format each line as: "N. What changed — why it matters (source)." Keep each line under 120 characters. This section should be scannable in under 10 seconds.

---

*Everything below is supporting evidence for the answer above.*

Then the full briefs. Each numbered story should follow this format:
- **Headline** — one-line summary of the story
- **Body** — 2–3 paragraphs combining facts, context, notable takes (with attribution), sentiment split, and builder implications. Weave all relevant data sources into the story — do not separate "what happened" from "what people think" or "what it means." Use paragraph form, not tables.
- **Watch:** — 1–3 forward-looking items specific to this story

After the ranked stories, include a final section:

**Everything else** — Bullet list of 5–10 notable items that didn't warrant a full brief but are worth knowing. One line each, fact-first.

Writing principles:
- Each story is self-contained. A reader should be able to read any single story and get the full picture without needing context from other stories.
- No repetition across stories. If a fact is relevant to multiple stories, place it in the highest-priority one and don't repeat it.
- Lead with what changed, not background. Assume the reader has baseline crypto literacy.
- Include smart account engagement (SE) and smart follower (SF) counts when citing specific tweets to signal credibility.
- Attribute every claim to a specific source. No unattributed assertions.
- Prioritize surprise and non-obvious signals over consensus takes.`,
            },
          },
        ],
      };
    },
  );
}
