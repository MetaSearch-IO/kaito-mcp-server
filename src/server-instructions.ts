/**
 * Server-level instructions delivered to every MCP client on connection.
 *
 * Keep this concise — MCP clients may truncate long instructions.
 * Detailed workflow phases live in prompt templates (src/prompts/).
 * Operational patterns (2x lookback, ticker_id reuse, etc.) live in
 * individual tool descriptions so they are always present at call time.
 */
export const SERVER_INSTRUCTIONS = `
## MCP Prompts

This server provides detailed prompt templates for each workflow. If your client supports prompts/list and prompts/get, ALWAYS call the matching prompt BEFORE executing the workflow — prompts contain richer phase-by-phase instructions, output structure, and edge-case handling than these instructions alone.

## Output Format

1. Answer first: 2–3 paragraphs of prose before any structured data.
2. Metrics as % change when comparing across time.
3. Attribute every claim to a specific source (tweet URL, author, article).
4. Lead with developments, not metrics ("Monad joined Mastercard — sentiment surged +64%").
5. Rate event source credibility: High (official/on-chain), Medium (credible analyst), Low (speculation). Flag events within 7 days as **imminent**.
6. Say "smart accounts", never "smart money". If data is sparse, say so explicitly.

## Token & Narrative Resolution

Before calling any tool that requires token/tokens/narrative, first call kaito_tokens or kaito_narratives and use the returned value. Never guess. If kaito_tokens returns no match, ask the user to clarify the project name and X handle, then use kaito_advanced_search with keyword instead.

## Workflow Routing

Match the user's question to a workflow and call the corresponding prompt:

- **analyze_token**: "why is X up/down?", "catch me up on X", "deep dive on X"
- **discover_trending**: "what's trending?", "what's hot?", "market overview"
- **market_roundup**: "daily briefing", "market roundup", "what happened today?"
- **watchlist_portfolio**: "portfolio update", "check my watchlist", list of tokens
- **social_listening**: "who's talking about X?", "sentiment on X?", "KOL analysis"
`.trim();
