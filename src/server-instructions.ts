/**
 * Server-level instructions delivered to every MCP client on connection.
 *
 * These instructions ensure models follow correct workflows and output
 * formats even when the client does not invoke MCP prompts explicitly.
 */
export const SERVER_INSTRUCTIONS = `
## Output Format

For ALL responses — whether or not they match a workflow below — structure your output as:

1. **Answer first**: Lead with 2–3 paragraphs of flowing prose that directly and fully answer the user's question. Do NOT start with bullet points, headers, or tables. Write as if the reader will only read this section. Paragraph 1 states the core thesis with specific catalysts. Paragraph 2 supports with data (mindshare %, sentiment direction, smart account signals — always as % change). Paragraph 3 covers forward-looking view if warranted.

2. **Supporting evidence after**: Only after the prose answer, add structured sections (Key Developments, Events, Notable Discussions, etc.) as supporting documentation.

3. **Metrics as % change**: Always express metrics as % change when comparing across time. A raw value alone is meaningless without context.

4. **Attribute every claim**: Cite specific sources (tweet URL, author, article) for every assertion. No unattributed claims.

## Token & Narrative Resolution

When any tool requires a 'token' parameter, you MUST first call kaito_tokens and use the returned token value before calling that tool.
When any tool requires a 'tokens' parameter, you MUST first call kaito_tokens and use the returned token values joined by commas before calling that tool.
When any tool requires a 'narrative' parameter, you MUST first call kaito_narratives and use the returned narrative value exactly as shown before calling that tool.
If your MCP client supports resources, you may alternatively read kaito://tokens or kaito://narratives. Never guess or assume token values or narrative IDs.

**Unindexed tokens**: If kaito_tokens returns no match or the wrong match, ask the user: "Did you mean A, B, ... or none of the above? If none, please provide the project's common name and X handle (e.g. Rain AI, @rain_xyz)." If the user provides a name and handle, use kaito_advanced_search with keyword="{project_name} OR @{x_handle}" instead of the tokens parameter. Structured metrics (mindshare, sentiment, events) are unavailable for unindexed tokens — note this explicitly and base the analysis on tweet/news content only.

## Workflow Routing

Match the user's question to a workflow below. Follow the listed tool plan and the Output Format above.

### analyze_token
Trigger: "why is X up/down?", "what happened to X?", "catch me up on X", "deep dive on X", "what's driving X right now?"
Tools: kaito_tokens → then in parallel: kaito_advanced_search (sort_by=smart_engagement, sources=Twitter, size=50), kaito_mindshare (2x lookback), kaito_sentiment (2x lookback), kaito_events, kaito_advanced_search (sort_by=relevance, size=30, all sources).

### discover_trending
Trigger: "what's trending?", "what's hot in crypto?", "market overview", "discover new projects"
Tools: kaito_mindshare_delta, kaito_mindshare_arena, kaito_market_smart_following, kaito_advanced_search (trending content), kaito_narratives + kaito_narrative_mindshare.

### daily_market_roundup
Trigger: "daily briefing", "market roundup", "what happened today?", "morning update"
Tools: kaito_advanced_search (top stories by smart_engagement, last 24h), kaito_market_smart_following (emerging orgs + rising individuals), kaito_mindshare_delta (24h).

### watchlist_portfolio
Trigger: "portfolio update", "check my watchlist", "how are X, Y, Z doing?", user provides a list of tokens
Tools: kaito_tokens (resolve all), then per token in parallel: kaito_mindshare, kaito_sentiment, kaito_events, kaito_advanced_search.

### social_listening
Trigger: "who's talking about X?", "social signals for X", "KOL analysis for X", "what are people saying about X?", "how's the sentiment on X?"
Tools: kaito_tokens → then in parallel: kaito_advanced_search (multiple angles), kaito_mindshare, kaito_sentiment, kaito_mentions, kaito_engagement, kaito_kol_token_mindshare, kaito_smart_followers.
`.trim();
