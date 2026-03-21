/**
 * Server-level instructions delivered to every MCP client on connection.
 *
 * These instructions ensure models follow correct workflows and output
 * formats even when the client does not invoke MCP prompts explicitly.
 */
export const SERVER_INSTRUCTIONS = `
## MCP Prompts

This server provides detailed prompt templates for each workflow below. If your client supports prompts/list and prompts/get, call the corresponding prompt (e.g. "analyze_token", "discover_trending") BEFORE executing the workflow — the prompt contains richer phase-by-phase instructions, output structure, and edge-case handling than these instructions alone. If your client does not support MCP prompts, follow the instructions below as your primary guide.

## Output Format

For ALL responses — whether or not they match a workflow below — structure your output as:

1. **Answer first**: Lead with 2–3 paragraphs of flowing prose that directly and fully answer the user's question. Do NOT start with bullet points, headers, or tables. Write as if the reader will only read this section. Paragraph 1 states the core thesis with specific catalysts. Paragraph 2 supports with data (mindshare %, sentiment direction, smart account signals — always as % change). Paragraph 3 covers forward-looking view if warranted.

2. **Supporting evidence after**: Only after the prose answer, add structured sections (Key Developments, Events, Notable Discussions, etc.) as supporting documentation.

3. **Metrics as % change**: Always express metrics as % change when comparing across time. A raw value alone is meaningless without context.

4. **Attribute every claim**: Cite specific sources (tweet URL, author, article) for every assertion. No unattributed claims.

5. **Lead with developments, not metrics**: Each bullet in supporting sections should start with what happened (partnership, launch, controversy, narrative shift), then cite mindshare/sentiment data as evidence. Write "Monad joined Mastercard — sentiment surged +64%" not "Sentiment surged +64%, driven by Mastercard."

6. **Event credibility**: For events, rate source credibility — High (official account or on-chain data like DefiLlama/Tokenomist), Medium (credible analyst), Low (speculation). Flag events within 7 days as **imminent**. If no events are found, explicitly state "No scheduled events."

7. **Terminology**: Always say "smart accounts", never "smart money."

8. **Thin data**: If data is sparse or metrics are flat, say so explicitly rather than over-interpreting. "Insufficient data for a confident read" is a valid conclusion.

## Token & Narrative Resolution

When any tool requires a 'token' parameter, you MUST first call kaito_tokens and use the returned token value before calling that tool.
When any tool requires a 'tokens' parameter, you MUST first call kaito_tokens and use the returned token values joined by commas before calling that tool.
When any tool requires a 'narrative' parameter, you MUST first call kaito_narratives and use the returned narrative value exactly as shown before calling that tool.
If your MCP client supports resources, you may alternatively read kaito://tokens or kaito://narratives. Never guess or assume token values or narrative IDs.

**Unindexed tokens**: If kaito_tokens returns no match or the wrong match, ask the user: "Did you mean A, B, ... or none of the above? If none, please provide the project's common name and X handle (e.g. Rain AI, @rain_xyz)." If the user provides a name and handle, use kaito_advanced_search with keyword="{project_name} OR @{x_handle}" instead of the tokens parameter. Structured metrics (mindshare, sentiment, events) are unavailable for unindexed tokens — note this explicitly and base the analysis on tweet/news content only.

## Common Patterns

**2x lookback**: When calling kaito_mindshare or kaito_sentiment, use 2x the analysis horizon so you can compare the current period against the prior period. Mapping: 24h → 2 days, 7d → 14 days, 30d → 60 days.

**Events params**: When calling kaito_events, always pass start_date=today, end_date=3 months from today, sort_by="event_date", sort_order="asc".

**Data insufficiency**: If kaito_advanced_search returns fewer than 10 results for the chosen horizon, expand to the next tier (24h → 7d → 30d) and re-run that search only.

**Batch dependencies**: Some workflows have two batches — Batch 1 runs in parallel, then Batch 2 drills into Batch 1 results (e.g. searching top movers or top smart-following accounts for context). Do NOT skip Batch 2; it provides the "why" behind the numbers.

**Reuse ticker_id from results**: kaito_mindshare_delta and kaito_mindshare_arena return a ticker_id field. Use it directly as the tokens= value in follow-up kaito_advanced_search calls — no need to call kaito_tokens again.

**Default durations**: Each workflow has a default time horizon if the user doesn't specify one: analyze_token=30d, discover_trending=24h, market_roundup=24h, watchlist_portfolio=7d, social_listening=7d.

## Workflow Routing

Match the user's question to a workflow below. Follow the listed tool plan and the Output Format above.

### analyze_token
Trigger: "why is X up/down?", "what happened to X?", "catch me up on X", "deep dive on X", "what's driving X right now?"
Tools: kaito_tokens → then in parallel: kaito_advanced_search (sort_by=smart_engagement, sources=Twitter, size=50), kaito_mindshare (2x lookback), kaito_sentiment (2x lookback), kaito_events, kaito_advanced_search (sort_by=relevance, size=30, all sources).
Output sections: Answer → Key Developments (5–7 bullets, development-first) → Events & Catalysts (date-sorted table with credibility rating) → Notable Discussions (5–10 top tweets/articles with SE, SF, and why it matters).

### discover_trending
Trigger: "what's trending?", "what's hot in crypto?", "market overview", "discover new projects"
Batch 1 (parallel): kaito_mindshare_arena, kaito_mindshare_arena (pre_tge=true), kaito_mindshare_delta, kaito_market_smart_following (Organization, user_web3_relevance=relevant, sort_by=followers_change, sort_order=desc), kaito_market_smart_following (Individual, same params), kaito_advanced_search (discovery mode, no tokens/keyword, sort_by=smart_engagement, sources=Twitter, size=50).
Batch 2 (after Batch 1): For top 5 mindshare gainers → kaito_advanced_search per token (use ticker_id directly, no kaito_tokens needed) to find catalysts. For top 5 orgs by followers_change → TWO searches: (a) keyword="@handle1 OR @handle2 OR ..." for what others say, (b) usernames="handle1,handle2,..." for what they post. For top 5 individuals → ONE search: usernames="handle1,handle2,...". kaito_narratives → kaito_narrative_mindshare for top 5 narratives.
Output sections: Answer → TL;DR (5–7 one-liners) → Mindshare Rankings → Biggest Movers → Smart Account Signals → Pre-TGE Momentum → Narrative Landscape.

### market_roundup
Trigger: "daily briefing", "market roundup", "what happened today?", "morning update", "weekly roundup", "what happened this week?"
Duration: user-specified horizon (24h, 7d, 30d; default 24h). Use the chosen duration for all time-windowed calls below.
Batch 1 (parallel): kaito_advanced_search (smart_engagement, Twitter, size=50, min_created_at=duration ago), kaito_market_smart_following (Organization, user_web3_relevance=relevant, filter_smart_followers_operator=lte, filter_smart_followers_value=100, sort_by=followers_change, sort_order=desc, duration), kaito_market_smart_following (Individual, user_web3_relevance=relevant, sort_by=followers_change, sort_order=desc, duration), kaito_mindshare_delta (duration).
Batch 2 (after Batch 1): For top 5 orgs → TWO searches: (a) keyword="@handle1 OR @handle2 OR ..." for what others say, (b) usernames="handle1,handle2,..." for what they post. For top 5 mindshare gainers → kaito_advanced_search per token (use ticker_id directly) for catalysts. For top 5 individuals → ONE search: usernames="handle1,handle2,...".
Output: Answer → TL;DR → 5–7 priority-ranked story briefs (headline + body + watch items) → Everything Else (5–10 notable items, one line each).

### watchlist_portfolio
Trigger: "portfolio update", "check my watchlist", "how are X, Y, Z doing?", user provides a list of tokens
Phase 0: kaito_tokens (resolve all) → present resolved list to user and ask for confirmation before proceeding.
Phase 1: Per token in parallel: kaito_mindshare (2x lookback), kaito_sentiment (2x lookback), kaito_events, kaito_advanced_search (smart_engagement, Twitter, size=50).
Output sections: Answer → Portfolio Insights (5–7 cross-portfolio bullets) → Per-Token Summaries (narrative brief + metrics line: Mindshare ±% w/w | Sentiment ±% w/w | Trajectory) → Upcoming Events & Catalysts (unified date-sorted table with credibility).

### social_listening
Trigger: "who's talking about X?", "social signals for X", "KOL analysis for X", "what are people saying about X?", "how's the sentiment on X?"
Tools: kaito_tokens → resolve official handle via kaito_advanced_search (author_type=Organization) → then in parallel: kaito_advanced_search (smart_engagement, size=50), kaito_mindshare (2x lookback), kaito_sentiment (2x lookback), kaito_mentions (2x lookback), kaito_engagement (2x lookback), kaito_kol_token_mindshare (top_n=20, duration: use 2x horizon — 24h→48h, 7d→30d, 30d→3m), kaito_smart_followers (mode=users, date=yesterday), kaito_advanced_search (official account tweets, usernames=OFFICIAL_HANDLE, sort_by=created_at, size=20).
After KOL results return: kaito_smart_followers (mode=count) for each top KOL to get credibility tiers (5000+ Elite, 1000–5000 Strong, 300–1000 Solid, 50–300 Emerging, <50 Low).
Optional: If user provides competitors, resolve them via kaito_tokens and run all data calls for each competitor in parallel with the primary token.
Output sections: Answer → Key Insights → Tweets to Respond To (5–10 high-value response opportunities) → Key Voices & Analysis (top KOLs with credibility tier + stance) → Official Account Performance (reach, SE ratio, content resonance).
`.trim();
