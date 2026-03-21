import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerAnalyzeTokenPrompt(server: McpServer) {
  server.registerPrompt(
    "analyze_token",
    {
      description:
        "Deep-dive analysis of a crypto token: top discussions, sentiment, mindshare, and events with trend comparison. Use when: 'what happened to X?', 'why is X up/down?', 'catch me up on X', 'deep dive on X', 'what's driving X right now?'",
      argsSchema: {
        token: z
          .string()
          .describe(
            "Project name, ticker, or resolved token value (e.g. Bitcoin, BTC, HYPERLIQUID)",
          ),
        duration: z
          .enum(["24h", "7d", "30d"])
          .optional()
          .describe(
            "Time horizon for analysis: 24h, 7d, 30d (default: 30d). If the chosen horizon yields insufficient data, expand to the next tier.",
          ),
      },
    },
    ({ token, duration }) => {
      const horizon = duration || "30d";

      // 2x lookback mapping for trend comparison
      const lookbackDays: Record<string, number> = { "24h": 2, "7d": 14, "30d": 60 };
      const days = lookbackDays[horizon];

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Perform a comprehensive analysis of the crypto token "${token}" over a ${horizon} time horizon. Follow these steps exactly — do not skip or shortcut any step.

## Phase 1 — Token Resolution

1. **Resolve token**: Call kaito_tokens with query="${token}".
   - If a match is found, save the first returned token value as RESOLVED_TOKEN.
   - **If no match or wrong match**: Ask the user in a single message: "Did you mean A, B, ... or none of the above? If none, please provide the project's common name and X handle (e.g. Rain AI, @rain_xyz)."
   - If the user provides a name and handle instead of picking a match, this becomes an **unindexed token**. In Phase 2, only Steps 2 and 6 apply (using keyword="{project_name} OR @{x_handle}" instead of tokens=). Steps 3–5 are skipped. In Phase 3, clearly note that structured metrics are unavailable and the analysis is based on tweet content only.

## Phase 2 — Data Gathering

Run ALL of the following calls in parallel. Compute dates relative to today.

2. **Top tweets**: Call kaito_advanced_search with tokens=RESOLVED_TOKEN, sources="Twitter", sort_by="smart_engagement", size=50, min_created_at set to ${horizon} ago in ISO 8601.
3. **Mindshare trend (2x lookback)**: Call kaito_mindshare for RESOLVED_TOKEN with start_date=${days} days ago, end_date=tomorrow.
4. **Sentiment trend (2x lookback)**: Call kaito_sentiment for RESOLVED_TOKEN with start_date=${days} days ago, end_date=tomorrow.
5. **Upcoming events**: Call kaito_events for RESOLVED_TOKEN with start_date=today, end_date=3 months from today, sort_by="event_date", sort_order="asc".
6. **News & cross-platform discussion**: Call kaito_advanced_search with tokens=RESOLVED_TOKEN, sort_by="relevance", size=30, min_created_at set to ${horizon} ago in ISO 8601 (no sources filter — captures News, Podcast, Research, etc.).

If Step 2 returns fewer than 10 results for the ${horizon} horizon, expand to the next tier (24h → 7d → 30d) and re-run Step 2 only.

## Phase 3 — Analysis & Output

Synthesize all data into the following structured output.

### Answer
This is the PRIMARY output — a comprehensive 2–3 paragraph response that directly and fully answers the user's question. Do NOT list categories or jump to bullet points here. Write in flowing prose as if briefing someone who will only read this section and skip everything below.

Paragraph 1: State the core thesis — why is this token up/down/notable? Name the specific catalysts (partnerships, launches, macro events, regulatory shifts) and explain how they connect. This should read like a concise investment memo, not a table of contents.

Paragraph 2: Support with data — weave in mindshare trajectory (% change vs prior period), sentiment direction, and smart account conviction. Always express metrics as % change. Reference specific voices or events that validate the thesis.

Paragraph 3 (if warranted): Forward-looking view — upcoming catalysts, risks, or open questions. End with suggested follow-up actions (e.g. "run social_listening for deeper engagement analysis" or "run watchlist_portfolio to compare against competitors").

If data is thin, say so explicitly rather than over-interpreting.

---

*Everything below is supporting evidence for the answer above.*

### Key Developments
5–7 bullet points of the most important findings. **Lead with what happened or changed, not metrics.** Each bullet should start with a development (partnership, launch, upgrade, narrative shift, controversy), then cite mindshare/sentiment data as supporting evidence.
- **Always express metrics as % change** when comparing across time. Raw values alone are meaningless to the reader. Write "mindshare up +35% from 2.1% to 2.8% over 7 days" instead of just stating numbers.
- Compare the current ${horizon} window against the prior ${horizon} (available from the 2x lookback data) to identify acceleration, deceleration, or reversals.
- Attribute every claim to a specific source (tweet, article, account). No unattributed assertions.

### Events & Catalysts

Compile all events from Step 5 into a date-sorted view:

| Date | Event | Source | Credibility & Impact |
|------|-------|--------|----------------------|

For each event:
- **Source**: Include the author and link from the event data. For token unlocks sourced from Tokenomist or DefiLlama, these are on-chain data sources and inherently high credibility. For tweet-sourced events, assess credibility based on the author identity.
- **Credibility**: Rate as High (official account or on-chain data), Medium (credible analyst), or Low (speculation/unverifiable).
- **Impact**: Categorize as supply-side (unlocks, vesting), product (mainnet, feature launch), governance (votes, proposals), or visibility (conferences, AMAs). Flag events within the next 7 days as **imminent**.
- If no events are found, explicitly state "No scheduled events."

### Notable Discussions
Highlight 5–10 of the most impactful tweets and articles from Steps 2 and 6. For each:
- Content summary (truncated to 280 chars if needed) with URL
- Author (@username, SF count), smart engagement count
- Why it matters — what signal does this piece of content carry?

Prioritize surprise and non-obvious signals over consensus takes. Include cross-platform content (News, Podcast, Research) alongside Twitter when available.`,
            },
          },
        ],
      };
    },
  );
}
