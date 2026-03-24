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
3. **Mindshare Movers**: Call kaito_mindshare_delta with duration="${window}" to find biggest gainers.
4. **Smart Account Signals (Organizations)**: Call kaito_market_smart_following with duration="${window}", user_tag_individual_or_organization="Organization", user_web3_relevance="relevant", sort_by="followers_change", sort_order="desc".
5. **Smart Account Signals (Individuals)**: Call kaito_market_smart_following with duration="${window}", user_tag_individual_or_organization="Individual", user_web3_relevance="relevant", sort_by="followers_change", sort_order="desc".
6. **Trending Content**: Call kaito_advanced_search with sort_by="smart_engagement", sources="Twitter", size=50, min_created_at set to ${window} ago in ISO 8601 (no tokens, no keyword — pure discovery mode).

## Batch 2 — Run after Batch 1 completes (depends on Batch 1 results). All steps can run in parallel with each other:

7. From Step 3, for the top 5 mindshare gainers: call kaito_advanced_search for each with tokens="{ticker_id}" (use the ticker_id value directly from the mindshare_delta response — no need to call kaito_tokens), sort_by="smart_engagement", sources="Twitter", size=20, min_created_at set to ${window} ago in ISO 8601 to understand what's driving the move. These CANNOT be combined because the tokens parameter uses AND logic — run all 5 in parallel.
8. From Step 4, pick the top 5 organization accounts by followers_change. Run TWO searches:
   a. kaito_advanced_search with keyword="@{handle1} OR @{handle2} OR @{handle3} OR @{handle4} OR @{handle5}", sources="Twitter", size=50, min_created_at set to ${window} ago — what others are saying about them.
   b. kaito_advanced_search with usernames="{handle1},{handle2},{handle3},{handle4},{handle5}" (comma-separated), sources="Twitter", size=50, min_created_at set to ${window} ago — what they're posting.
9. From Step 5, pick the top 5 individuals by followers_change. Run ONE search: kaito_advanced_search with usernames="{handle1},{handle2},{handle3},{handle4},{handle5}" (comma-separated), sources="Twitter", size=50, min_created_at set to ${window} ago — what they've been saying.

## Output Structure

Synthesize all data into the following structured output. Do NOT use "smart money" — always say "smart accounts" instead. Tables are optional supporting evidence — the primary format should be insight-driven paragraphs that explain what's happening and why. Every section should tell a story, not just display data.

### Answer
This is the PRIMARY output — a comprehensive 2–3 paragraph response that directly tells the reader what's happening in crypto right now and what they should pay attention to.

Paragraph 1: Lead with the single most important signal or theme emerging from the data. Name specific projects, catalysts, and why they matter. Write as if the reader will only read this section.

Paragraph 2: Identify 2–3 emerging themes that aren't yet consensus — smart account rotations, narrative shifts, or pre-TGE momentum that most people are missing. Reference specific data points.

Paragraph 3: Suggested follow-up actions (e.g. "run analyze_token on X for a deep dive" or "run social_listening on Y to monitor KOL sentiment").

---

*Everything below is supporting evidence for the answer above.*

### Mindshare Rankings
Top 10 projects from the Mindshare Arena. For each:
- Rank, project name, mindshare score
- One-line context: is this a steady leader or a recent mover? Cross-reference with Step 3 (mindshare delta) to note if it's gaining or losing.

### Biggest Movers
For the top 5 gainers from Step 3 (searched in Step 7), write a short paragraph each:
- The mindshare change (express as % change, not raw delta)
- What's driving it — synthesize from the Step 7 tweet search results. Attribute to specific tweets/accounts with URLs and SE counts.
- Is this a one-off spike or part of a sustained trend?
- Cross-reference with other sections: does this token also appear in smart following data, narrative shifts, or catalysts? Connect the dots — if a token is a top gainer, explain whether smart accounts are also rotating in and which narrative it belongs to.

### Smart Account Signals
Start with a synthesis paragraph: what is the collective signal from smart accounts this period? Are they risk-on or risk-off? Rotating into a specific sector (DeFi, L2, AI, stablecoins)? Reacting to macro events? This paragraph should tell the reader what smart accounts as a group are doing, not just list individuals.

**Organizations gaining smart followers (Step 4):**
For the top 5, describe what's driving the attention using Step 8 results. Include specific tweets with URLs and SE counts. Connect to broader themes — if 3 of 5 are DeFi protocols, that's the signal.

**Individuals gaining smart followers (Step 5):**
For the top 5, describe what they're talking about using Step 9 results. Are they signaling a theme, calling a trade, or building something? Include tweet URLs.

### Pre-TGE Momentum
Top 5–10 pre-TGE projects from Step 2. For each:
- Project name and mindshare score
- One-line context on what the project does and why it's gaining attention
- Flag any that also appear in the smart following data (strong conviction signal)

### Narrative Landscape
This section has NO dedicated data calls — instead, distill narrative themes entirely from the tweets and data already gathered in all previous steps. Group the tokens, tweets, and signals from Steps 1–9 into macro narrative themes (e.g. AI, DeFi, RWA, Meme, Stablecoins, Prediction Markets, L2s). Do NOT just list narratives with numbers — explain what's happening and why. Write a short paragraph per narrative:
- Name the narrative and estimate whether it's gaining or losing attention based on how many top-mindshare tokens, trending tweets, and smart account signals cluster under it.
- **What's driving it**: Name the specific events, launches, partnerships, or controversies from the gathered data. E.g. "DeFi is surging — Morpho (#10 mindshare), Uniswap (top 5 gainer), and Resolv Labs (#9) are all climbing, driven by the Coinbase-Morpho deal and Uniswap v4 prediction market primitives" — not just "DeFi is up."
- **Key tokens within the narrative**: Which projects from the mindshare arena and movers belong to this theme?
- **Outlook**: Is this narrative accelerating with fresh catalysts, or was it a short-term spike?

---

**Writing principles:**
- Attribute every claim to a specific source (tweet URL, author, article). No unattributed assertions. Every cited tweet must include the URL, not just the @handle.
- Include smart engagement (SE) and smart follower (SF) counts when citing specific tweets to signal credibility.
- Lead with what changed, not background. Assume the reader has baseline crypto literacy.
- Prioritize surprise and non-obvious signals over consensus takes.
- Cross-reference across sections: if a token appears in multiple datasets (mindshare gainers, smart following, narrative shifts, catalysts), explicitly connect those signals rather than treating each section as isolated. The value is in the connections.
- If data is thin for any section, say so explicitly rather than over-interpreting.

`,
            },
          },
        ],
      };
    },
  );
}
