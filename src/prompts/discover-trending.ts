import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDiscoverTrendingPrompt(server: McpServer) {
  server.registerPrompt(
    "discover_trending",
    {
      description:
        "Discover trending crypto projects and narratives: mindshare rankings, biggest movers, smart account signals, pre-TGE momentum, and narrative shifts.",
      argsSchema: {
        duration: z
          .enum(["24h", "7d", "30d"])
          .optional()
          .describe(
            "Time window for rankings: 24h, 7d, 30d (default: 24h)",
          ),
      },
    },
    ({ duration }) => {
      const window = duration || "24h";

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Discover what's trending in crypto right now using a ${window} time window. Follow these steps exactly — do not skip or shortcut any step.

## Batch 1 — Run these six calls in parallel (no dependencies):

1. **Mindshare Arena**: Call kaito_mindshare_arena with duration="${window}" to get top projects by mindshare.
2. **Pre-TGE Arena**: Call kaito_mindshare_arena with duration="${window}", pre_tge=true to find trending pre-token projects.
3. **Mindshare Movers**: Call kaito_mindshare_delta with duration="${window}" to find biggest gainers and losers.
4. **Smart Account Signals (Organizations)**: Call kaito_market_smart_following with duration="${window}", user_tag_individual_or_organization="Organization", user_web3_relevance="relevant", sort_by="followers_change", sort_order="desc".
5. **Smart Account Signals (Individuals)**: Call kaito_market_smart_following with duration="${window}", user_tag_individual_or_organization="Individual", user_web3_relevance="relevant", sort_by="followers_change", sort_order="desc".
6. **Trending Content**: Call kaito_advanced_search with sort_by="smart_engagement", sources="Twitter", size=50, min_created_at set to ${window} ago in ISO 8601 (no tokens, no keyword — pure discovery mode).

## Batch 2 — Run after Batch 1 completes (depends on Batch 1 results). All steps can run in parallel with each other:

7. From Step 3, for the top 5 mindshare gainers: call kaito_advanced_search for each with tokens="{ticker_id}" (use the ticker_id value directly from the mindshare_delta response — no need to call kaito_tokens), sort_by="smart_engagement", sources="Twitter", size=20, min_created_at set to ${window} ago in ISO 8601 to understand what's driving the move. These CANNOT be combined because the tokens parameter uses AND logic — run all 5 in parallel.
8. From Step 4, pick the top 5 organization accounts by followers_change. Run TWO searches:
   a. kaito_advanced_search with keyword="@{handle1} OR @{handle2} OR @{handle3} OR @{handle4} OR @{handle5}", sources="Twitter", size=50, min_created_at set to ${window} ago — what others are saying about them.
   b. kaito_advanced_search with usernames="{handle1},{handle2},{handle3},{handle4},{handle5}" (comma-separated), sources="Twitter", size=50, min_created_at set to ${window} ago — what they're posting.
9. From Step 5, pick the top 5 individuals by followers_change. Run ONE search: kaito_advanced_search with usernames="{handle1},{handle2},{handle3},{handle4},{handle5}" (comma-separated), sources="Twitter", size=50, min_created_at set to ${window} ago — what they've been saying.
10. **Narrative landscape**: Call kaito_narratives then call kaito_narrative_mindshare for the top 5 narratives by relevance to identify which macro themes are gaining or losing share.

## Output Structure

Synthesize all data into the following structured output. Do NOT use "smart money" — always say "smart accounts" instead.

### Answer
This is the PRIMARY output — a comprehensive 2–3 paragraph response that directly tells the reader what's happening in crypto right now and what they should pay attention to.

Paragraph 1: Lead with the single most important signal or theme emerging from the data. Name specific projects, catalysts, and why they matter. Write as if the reader will only read this section.

Paragraph 2: Identify 2–3 emerging themes that aren't yet consensus — smart account rotations, narrative shifts, or pre-TGE momentum that most people are missing. Reference specific data points.

Paragraph 3: Suggested follow-up actions (e.g. "run analyze_token on X for a deep dive" or "run social_listening on Y to monitor KOL sentiment").

### TL;DR
One line per key finding, fact-first, no fluff. 5–7 lines max. Format each line as: "N. What's trending — why it matters (source)." Keep each line under 120 characters. This section should be scannable in under 10 seconds.

---

*Everything below is supporting evidence for the answer above.*

### Mindshare Rankings
Top 10 projects from the Mindshare Arena. For each:
- Rank, project name, mindshare score
- One-line context: is this a steady leader or a recent mover? Cross-reference with Step 3 (mindshare delta) to note if it's gaining or losing.

### Biggest Movers
For the top 5 gainers from Step 3, write a short paragraph each:
- The mindshare change (express as % change, not raw delta)
- What's driving it — synthesize from the Step 7 tweet search results. Attribute to specific tweets/accounts with SE counts.
- Is this a one-off spike or part of a sustained trend?

For the top 3 losers, one bullet each: what they lost and any visible reason from the broader data.

### Smart Account Signals
**Organizations gaining smart followers (Step 4):**
For the top 5, describe what's driving the attention using Step 8 results. Include specific tweets and SE counts. Note any pattern — are smart accounts rotating into a sector (DeFi, L2, AI)?

**Individuals gaining smart followers (Step 5):**
For the top 5, describe what they're talking about using Step 9 results. Are they signaling a theme, calling a trade, or building something?

### Pre-TGE Momentum
Top 5–10 pre-TGE projects from Step 2. For each:
- Project name and mindshare score
- One-line context on what the project does and why it's gaining attention
- Flag any that also appear in the smart following data (strong conviction signal)

### Narrative Landscape
Using Step 10 results, identify which macro narratives are leading or shifting. For each top narrative:
- Name and current mindshare
- Key tokens driving it
- Whether it's accelerating or fading vs the prior period

`,
            },
          },
        ],
      };
    },
  );
}
