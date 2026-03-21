import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerWatchlistPortfolioPrompt(server: McpServer) {
  server.registerPrompt(
    "watchlist_portfolio",
    {
      description:
        "Watchlist & portfolio management: surface major developments, upcoming catalysts, and key narratives across a set of tokens with supporting mindshare and sentiment data.",
      argsSchema: {
        tokens: z
          .string()
          .describe(
            "Comma-separated list of project names or tickers to monitor (e.g. BTC,ETH,SOL,HYPE)",
          ),
        duration: z
          .enum(["24h", "7d", "30d"])
          .optional()
          .describe(
            "Time horizon for analysis: 24h, 7d, 30d (default: 7d)",
          ),
      },
    },
    ({ tokens, duration }) => {
      const horizon = duration || "7d";

      // 2x lookback mapping for mindshare/sentiment comparison
      const lookbackDays: Record<string, number> = { "24h": 2, "7d": 14, "30d": 60 };
      const days = lookbackDays[horizon];

      const tokenList = tokens
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Perform a watchlist & portfolio analysis for the following tokens over a ${horizon} time horizon. Follow these steps exactly.

## Phase 0 — Token Confirmation

The user has requested analysis for: **${tokenList.join(", ")}**

1. Call kaito_tokens for each token to resolve them. Present the resolved list to the user and ask for confirmation before proceeding.
2. **If a token cannot be resolved** (no match or wrong match):
   Ask the user in a single message: "Did you mean A, B, ... or none of the above? If none, please provide the project's common name and X handle (e.g. Rain AI, @rain_xyz)."
   If the user provides a name and handle instead of picking a match, this token becomes an **unindexed token**. It will be included in the analysis via keyword search only (Step 6b below). Mindshare, sentiment, and events data will NOT be available — clearly note this in the output.
3. Once confirmed, save each resolved token value as RESOLVED_TOKEN_1, RESOLVED_TOKEN_2, etc. For unindexed tokens, save the project name and X handle instead.

## Phase 1 — Data Gathering

Run ALL of the following calls in parallel across all confirmed tokens. Compute dates relative to today.

**Per-token calls (run for each RESOLVED_TOKEN in parallel):**

3. **Mindshare trend (2x lookback)**: Call kaito_mindshare for each RESOLVED_TOKEN with start_date=${days} days ago, end_date=tomorrow.
4. **Sentiment trend (2x lookback)**: Call kaito_sentiment for each RESOLVED_TOKEN with start_date=${days} days ago, end_date=tomorrow.
5. **Upcoming events**: Call kaito_events for each RESOLVED_TOKEN with start_date=today, end_date=3 months from today, sort_by="event_date", sort_order="asc".
6. **Top tweets per token**:
   a. For resolved tokens: Call kaito_advanced_search for each RESOLVED_TOKEN with tokens=RESOLVED_TOKEN, sources="Twitter", sort_by="smart_engagement", size=50, min_created_at set to ${horizon} ago in ISO 8601.
   b. For unindexed tokens: Call kaito_advanced_search with keyword="{project_name} OR @{x_handle}" (no tokens param), sources="Twitter", sort_by="smart_engagement", size=50, min_created_at set to ${horizon} ago in ISO 8601. This is the only data source for unindexed tokens — mindshare, sentiment, and events calls are skipped.

## Phase 2 — Analysis & Output

When synthesizing, use the per-token tweets from Step 6 as the primary source. To identify the most important conversations across the entire portfolio, rank all tweets from all tokens by smart_engagement and surface the top ones in the Portfolio Insights section.

Synthesize all data into the following structured output.

### Answer
This is the PRIMARY output — a comprehensive 2–3 paragraph response that directly answers the user's question about their portfolio. Do NOT list categories or jump to bullet points here. Write in flowing prose as if briefing someone who will only read this section and skip everything below.

Paragraph 1: Lead with the single most important development across all holdings and its implications. Name specific tokens, catalysts, and why they matter. State overall portfolio posture (risk-on/off, concentrated risk, sector rotation).

Paragraph 2: Which holdings look strongest and weakest — explain why with specific developments (not just metrics). Weave in mindshare/sentiment data as supporting evidence, always as % change vs prior period.

Paragraph 3: Imminent catalysts, risks, or open questions. End with suggested follow-up actions (e.g. "run social_listening on X for deeper KOL analysis"). If data is thin for any token, say so explicitly rather than over-interpreting.

---

*Everything below is supporting evidence for the answer above.*

### Portfolio Insights (Top-Level)
- 5–7 bullet points of the most important cross-portfolio findings.
- **Lead with developments and narratives, not metrics.** Each bullet should start with what happened (partnership, launch, upgrade, narrative shift), then cite mindshare/sentiment data as supporting evidence. E.g. "Monad joined Mastercard's Crypto Partner Program and hit TVL ATH — sentiment surged +64% as a result" rather than "Sentiment surged +64%, driven by Mastercard partnership."
- When citing metrics, always express as % change vs prior period. Raw values alone are meaningless.
- Compare the current ${horizon} window against the prior ${horizon} (available from the 2x lookback data) to identify acceleration, deceleration, or reversals.
- Flag any tokens whose mindshare and sentiment are diverging (e.g. sentiment rising but mindshare falling — could signal conviction among a shrinking audience).
- Highlight any standout tweets (ranked by smart_engagement across all Step 6 results) that signal broader thematic shifts.

### Per-Token Summaries

For each token, write a narrative brief (not a bullet-point metrics dump). Structure:

**{TOKEN_NAME}**

Start with the most important developments of the period — what happened, who said what, what shipped. Attribute claims to specific tweets/accounts with URLs and SE/SF counts. Build the narrative from the tweet content in Step 6.

After the narrative, include a compact metrics line:
> Mindshare: X% avg (±Y% w/w) | Sentiment: X avg (±Y% w/w) | Trajectory: rising/stable/declining

For unindexed tokens (resolved via keyword search only), replace the metrics line with:
> ⚠️ Unindexed token — mindshare, sentiment, and events data unavailable. Analysis based on keyword search only.

End with a one-line **Signal** — the bottom line on whether this token's position is strengthening or weakening and why.

### Upcoming Events & Catalysts

Compile all events from Step 5 into a unified, date-sorted calendar:

| Date | Token | Event | Source | Credibility & Impact |
|------|-------|-------|--------|----------------------|

For each event:
- **Source**: Include the author and link from the event data. For token unlocks sourced from Tokenomist or DefiLlama, these are on-chain data sources and inherently high credibility. For tweet-sourced events, assess credibility based on the author identity and tweet content returned by the API (e.g. official project account = high, community speculation = low).
- **Credibility**: Rate as High (official account or on-chain data), Medium (credible community member or analyst), or Low (speculation, misattributed, or unverifiable).
- **Impact**: Categorize as supply-side (unlocks, vesting), product (mainnet, testnet, feature launch), governance (votes, proposals), or visibility (conferences, AMAs). Flag events within the next 7 days as **imminent**.
- If no events are found for a token, explicitly state "No scheduled events."

`,
            },
          },
        ],
      };
    },
  );
}
