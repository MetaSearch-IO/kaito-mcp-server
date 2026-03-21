import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerSocialListeningPrompt(server: McpServer) {
  server.registerPrompt(
    "social_listening",
    {
      description:
        "Social listening workflow: surface key insights, identify tweets to respond to, and analyze key voices around a token with optional competitor comparison.",
      argsSchema: {
        token: z
          .string()
          .describe(
            "Project name, ticker, or resolved token value to monitor (e.g. Bitcoin, BTC, HYPERLIQUID)",
          ),
        competitors: z
          .string()
          .optional()
          .describe(
            "Comma-separated competitor project names or tickers for comparative analysis (e.g. ETH,SOL)",
          ),
        duration: z
          .enum(["24h", "7d", "30d"])
          .optional()
          .describe("Time horizon for analysis: 24h, 7d, 30d (default: 7d). If the chosen horizon yields insufficient data, expand to the next tier."),
      },
    },
    ({ token, competitors, duration }) => {
      const horizon = duration || "7d";

      // 2x lookback mapping for mindshare/sentiment comparison
      const lookbackDays: Record<string, number> = { "24h": 2, "7d": 14, "30d": 60 };
      const kolDuration: Record<string, string> = { "24h": "48h", "7d": "30d", "30d": "3m" };
      const days = lookbackDays[horizon];
      const kolDur = kolDuration[horizon];

      const hasCompetitors = competitors && competitors.trim().length > 0;
      const competitorList = hasCompetitors
        ? competitors.split(",").map((c) => c.trim()).filter(Boolean)
        : [];

      const competitorBlock = hasCompetitors
        ? `
**Competitor tokens to analyze:** ${competitorList.join(", ")}
Resolve each competitor via kaito_tokens using the same logic as the primary token — if a competitor cannot be resolved, ask the user in a single message: "Did you mean A, B, ... or none of the above? If none, please provide the project's common name and X handle." Unindexed competitors follow the same fallback: keyword search only, no mindshare/sentiment/mentions/engagement/KOL data.
Save resolved competitors as COMPETITOR_TOKEN_1, COMPETITOR_TOKEN_2, etc.
Run all Phase 2 data calls for each resolved competitor token in parallel with the primary token. For unindexed competitors, run only the keyword-based tweet search.`
        : "";

      const competitorOutputBlock = hasCompetitors
        ? `
- **Competitor Comparison**: For each competitor, show side-by-side: mindshare trajectory, sentiment trend, and how their KOL overlap compares to the primary token. Highlight where the primary token is winning or losing attention relative to competitors.`
        : "";

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Perform a social listening analysis for "${token}" over a ${horizon} time horizon. Follow these steps exactly.

## Phase 1 — Token Resolution

1. **Resolve primary token**: Call kaito_tokens with query="${token}".
   - If a match is found, save the first returned token value as RESOLVED_TOKEN.
   - **If no match or wrong match**: Ask the user in a single message: "Did you mean A, B, ... or none of the above? If none, please provide the project's common name and X handle (e.g. Rain AI, @rain_xyz)."
   - If the user provides a name and handle instead of picking a match, this becomes an **unindexed token**. In Phase 2, only Steps 3 and 10 apply (using keyword="{project_name} OR @{x_handle}" instead of tokens=). Steps 4–9 (mindshare, sentiment, mentions, engagement, KOL mindshare, smart followers) are skipped. Phase 2b is also skipped. In Phase 3, clearly note that structured metrics are unavailable and the analysis is based on tweet content only.
2. **Resolve official Twitter handle**: For resolved tokens, call kaito_advanced_search with tokens=RESOLVED_TOKEN, sources="Twitter", author_type="Organization", sort_by="relevance", size=5, min_created_at set to 30 days ago in ISO 8601. From the results, identify the project's official account (the Organization account that is the project itself, not a partner or exchange). Save the author_username as OFFICIAL_HANDLE and author_user_id as OFFICIAL_USER_ID. If no Organization results are found, fall back to searching the project name + "official" and pick the most likely match. For unindexed tokens, the user-provided X handle IS the OFFICIAL_HANDLE.${competitorBlock}

## Phase 2 — Data Gathering

Run the following calls in parallel for RESOLVED_TOKEN${hasCompetitors ? " and each COMPETITOR_TOKEN" : ""}. Compute dates relative to today.

3. **Top tweets**: Call kaito_advanced_search with tokens=RESOLVED_TOKEN, sources="Twitter", sort_by="smart_engagement", size=50, min_created_at set to ${horizon} ago in ISO 8601.
4. **Mindshare trend (2x lookback)**: Call kaito_mindshare for RESOLVED_TOKEN with start_date=${days} days ago, end_date=tomorrow.
5. **Sentiment trend (2x lookback)**: Call kaito_sentiment for RESOLVED_TOKEN with start_date=${days} days ago, end_date=tomorrow.
6. **Mention volume (2x lookback)**: Call kaito_mentions for RESOLVED_TOKEN with start_date=${days} days ago, end_date=tomorrow. This gives absolute discussion volume broken down by source (Twitter, Discord, News, etc.).
7. **Engagement trend (2x lookback)**: Call kaito_engagement for RESOLVED_TOKEN with start_date=${days} days ago, end_date=tomorrow. This gives total + smart/KOL engagement over time.
8. **KOL token mindshare**: Call kaito_kol_token_mindshare for RESOLVED_TOKEN with duration="${kolDur}", top_n=20.
9. **New smart followers**: Call kaito_smart_followers for OFFICIAL_HANDLE with mode="users", date=yesterday's date in YYYY-MM-DD format.
10. **Official account tweets**: Call kaito_advanced_search with tokens=RESOLVED_TOKEN, sources="Twitter", usernames=OFFICIAL_HANDLE, sort_by="created_at", size=20, min_created_at set to ${horizon} ago in ISO 8601. These are the project's own tweets — we will analyze their reach and engagement.

If Step 3 returns fewer than 10 results for the ${horizon} horizon, expand to the next tier (24h → 7d → 30d) and re-run Step 3 only.

## Phase 2b — KOL Credibility Enrichment

Once Step 8 returns, call kaito_smart_followers with mode="count" for each of the top 20 KOLs in parallel (use the username field from the kol_token_mindshare results). This provides the smart follower count needed to assess credibility tier for each KOL in Phase 3.

## Phase 3 — Analysis & Output

Synthesize all data into the following structured output. Do NOT use "smart money" — always say "smart accounts" instead:

### Answer
This is the PRIMARY output — a comprehensive 2–3 paragraph response that directly tells the reader the social listening story for this token. Do NOT list categories or jump to bullet points here. Write in flowing prose as if briefing someone who will only read this section and skip everything below.

Paragraph 1: Lead with the most important social signal — what is the dominant narrative, who is driving it, and what does it mean? Name specific voices, events, or shifts that matter most.

Paragraph 2: Sentiment direction (bullish/bearish/neutral with trend), mindshare trajectory (growing/stable/declining), and audience quality (smart-to-total engagement ratio). Always express metrics as % change vs prior period. Cross-reference mention volume with mindshare to distinguish genuine attention from noise.

Paragraph 3: Actionable takeaways — what should the reader do with this information? Key voices to watch, tweets worth responding to, emerging risks or opportunities. If the data is thin (few tweets, flat metrics), explicitly say so rather than over-interpreting noise.

---

*Everything below is supporting evidence for the answer above.*

### Key Insights
- 3–5 bullet points of the most important findings. Lead with what changed or is surprising. Cross-reference mindshare/sentiment trends with tweet content to explain WHY metrics moved.
- **Always express metrics as % change** when comparing across time. Raw values (e.g. sentiment score 73 vs 118) are meaningless to the reader without context. Write "sentiment up +62% from 73 to 118 over 10 days" instead of just stating the numbers.
- Compare the current ${horizon} window against the prior ${horizon} (available from the 2x lookback data) to identify acceleration, deceleration, or reversals.
- Cross-reference mentions (absolute volume) with mindshare (relative share): mentions up + mindshare down = more discussion but losing share to the broader market; both declining = genuine loss of attention. Flag any mention spikes exceeding 2x the period average.
- Analyze smart engagement from Step 7 on two dimensions: (1) **absolute smart engagement** — the raw count of smart account interactions, which measures how much high-quality attention the token is receiving; (2) **smart-to-total ratio** — which measures audience quality. Both matter: a token can have a high ratio but low absolute SE (niche), or high absolute SE but low ratio (mainstream with some smart interest). Note any engagement spikes and correlate with tweet content from Step 3.

### Tweets to Respond To
Select 5–10 high-value tweets from the advanced_search results that represent response opportunities.

**Response priority framework** — a tweet is worth responding to when it meets one or more of these criteria:
1. **High-SF question or discussion starter** (SF >= 300): A credible account is asking a question or opening a discussion about the token. Your reply reaches their smart audience. This is the highest-value opportunity.
2. **FUD or misconception with smart traction** (SE >= 3): Smart accounts are watching incorrect or misleading claims. Correcting the record here has outsized influence.
3. **Ecosystem builder showcasing integration**: Someone is building on or using the protocol publicly. Amplifying this validates the ecosystem and attracts more builders.
4. **Mainstream media or institutional voice**: Journalists, analysts, or fund managers mentioning the token. A thoughtful reply can shape the institutional narrative.
5. **Community champion with consistent presence**: Loyal accounts that regularly post about the token. Engaging reinforces the grassroots base.

**Exclude**: pure retweets, low-effort posts ("gm", price callouts with no thesis), and bot-like engagement farming.

For each selected tweet, write a short paragraph covering: the tweet text (truncated to 280 chars if needed) with URL, the author (@username, SF count, credibility tier), smart engagement count, and why it is worth responding to based on the criteria above.

### Key Voices & Analysis
For the top 10 KOLs from kol_token_mindshare, provide:
- Name, username, mindshare rank, and mindshare proportion
- Smart follower count from Phase 2b and credibility tier (5000+ Elite, 1000–5000 Strong, 300–1000 Solid, 50–300 Emerging, <50 Low profile)
- Their dominant narrative or stance on the token (derived from advanced_search content)
- Social propagation signal: are they being quoted/replied to by other high-SF accounts?
- Flag any KOLs who are new to the conversation (high recent mindshare but not in the longer-term top 20)

For new smart followers from Step 9:
- List the top 5 by their own SF count
- Note what these follows signal about institutional or smart account attention

### Official Account Performance
Using data from Step 10, analyze the project's own Twitter output:
- Total tweets posted in the ${horizon} window and posting cadence
- For each official tweet: text (truncated), views, likes, retweets, replies, smart engagement (SE), and SE/total engagement ratio
- Rank official tweets by SE — highlight which content resonated most with smart accounts
- Flag any official tweets with unusually low engagement relative to their follower count (potential reach issues)
- Overall assessment: is the official account's content generating smart attention, or mostly retail noise?
${competitorOutputBlock}`,
            },
          },
        ],
      };
    },
  );
}
