# kaito-mcp-server

[![npm](https://img.shields.io/npm/v/kaito-mcp-server)](https://www.npmjs.com/package/kaito-mcp-server)
[![CI](https://github.com/MetaSearch-IO/kaito-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/MetaSearch-IO/kaito-mcp-server/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/kaito-mcp-server)](./LICENSE)

MCP proxy for [Kaito AI](https://kaito.ai) crypto market intelligence API. Provides crypto market intelligence tools, reference resources, and prompt templates for sentiment analysis, mindshare tracking, social intelligence, and more.

## Getting Started

A Kaito API key is required. Contact us via [Telegram](https://t.me/kaitoai2022) or email support@kaito.ai to request one, discuss enterprise/external use cases, or get access to additional APIs beyond what this server exposes.

### Option A: Direct HTTP

For MCP clients that support remote HTTP servers and let you set a static `Authorization` header (e.g., Claude Code):

```json
{
  "mcpServers": {
    "kaito": {
      "type": "http",
      "url": "https://bff.kaito.ai/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

No local installation required.

> **Note:** Clients whose remote-MCP UI is OAuth-only — including Claude Desktop's Custom Connectors and Claude.ai (web) — are **not compatible** with Kaito's static Bearer-token auth. Use Option B on those clients.

### Option B: npx (stdio proxy)

For MCP clients that only support local stdio servers:

```json
{
  "mcpServers": {
    "kaito": {
      "command": "npx",
      "args": ["-y", "kaito-mcp-server@latest"],
      "env": {
        "KAITO_API_KEY": "your-api-key"
      }
    }
  }
}
```

This runs a thin local proxy that forwards all requests to the Kaito API over HTTP.

### Client-specific setup

#### Claude.ai (web)

Not currently supported — Claude.ai web's Custom Connectors UI requires OAuth, but the Kaito API uses static Bearer tokens. Use [Claude Code](#claude-code) or Claude Desktop with [Option B](#option-b-npx-stdio-proxy) instead.

#### Claude Desktop (one-click)

Download the latest [kaito-mcp-server.mcpb](https://github.com/MetaSearch-IO/kaito-mcp-server/releases/latest/download/kaito-mcp-server.mcpb) and open it — Claude Desktop will handle the rest.

> **Note:** MCPB installs a pinned version and does not auto-update. To get the latest version, re-download the `.mcpb` from the latest release — or switch to the [standard configuration](#option-b-npx-stdio-proxy) which uses `@latest` to always pull the newest version.

#### Claude Desktop (manual)

Add [Option B](#option-b-npx-stdio-proxy) to your `claude_desktop_config.json`:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

> **Note:** Option A (HTTP) is not supported here — `claude_desktop_config.json` only accepts stdio entries, and Claude Desktop's Settings → Connectors UI requires OAuth.

#### Claude Code

**HTTP (recommended):**

```bash
# If you previously used the npx setup, remove it first:
claude mcp remove kaito

# Then add the HTTP server:
claude mcp add kaito --transport http https://bff.kaito.ai/api/mcp --header "Authorization: Bearer YOUR_API_KEY"
```

**stdio (alternative):**

```bash
claude mcp add kaito -e KAITO_API_KEY=your-api-key -- npx -y kaito-mcp-server@latest
```

#### VS Code

Add the following to `.vscode/mcp.json` (workspace) or your user-profile `mcp.json` (open via the **MCP: Open User Configuration** command).

**HTTP (recommended):**

```json
{
  "servers": {
    "kaito": {
      "type": "http",
      "url": "https://bff.kaito.ai/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

**stdio (alternative):**

```json
{
  "servers": {
    "kaito": {
      "command": "npx",
      "args": ["-y", "kaito-mcp-server@latest"],
      "env": {
        "KAITO_API_KEY": "your-api-key"
      }
    }
  }
}
```

#### Cursor

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global).

**HTTP (recommended):**

```json
{
  "mcpServers": {
    "kaito": {
      "url": "https://bff.kaito.ai/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

**stdio (alternative):** paste [Option B](#option-b-npx-stdio-proxy).

#### Other MCP Clients

For any MCP-compatible client, the server can be started with:

```bash
KAITO_API_KEY=your-api-key npx -y kaito-mcp-server@latest
```

The transport is **stdio**. Use this command in your client's MCP server configuration.

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `KAITO_API_KEY` | Yes | — | Your Kaito API key |
| `KAITO_MCP_URL` | No | `https://bff.kaito.ai/api/mcp` | Override the remote MCP endpoint (e.g., for staging) |

## Recommended Skills

Pair this MCP server with [kaito-skills](https://github.com/MetaSearch-IO/kaito-skills) — curated Agent Skills (social listening, mindshare pulse, etc.) that use the tools below. Works in Claude Code, Cursor, VS Code + Copilot, and 40+ other agents.

```bash
npx skills add MetaSearch-IO/kaito-skills
```

See the [kaito-skills README](https://github.com/MetaSearch-IO/kaito-skills#getting-started) for client-specific install commands.

## Tools

### Reference

| Tool | Description |
|------|-------------|
| `kaito_entities` | List or search supported Kaito token identifiers by project name, token value, symbol, or CoinGecko slug |
| `kaito_narratives` | List or search supported Kaito narrative IDs by narrative code or display name |

### Search & Discovery

| Tool | Description |
|------|-------------|
| `kaito_search` | Default natural-language Kaito search for most user requests across Twitter, News, Research, and Podcast content |
| `kaito_feeds` | Use this when you want the top ranked content feed for the whole market or scoped to a single resolved token, optionally within a time window. |
| `kaito_advanced_search` | Power-user structured Kaito search with explicit control over tokens, usernames, sources, time filters, sorting, language, and thresholds |

### Sentiment, Mindshare & Engagement

| Tool | Description |
|------|-------------|
| `kaito_tweet_engagement_info` | Detailed engagement metrics for a specific tweet, including likes, retweets, replies, views, and smart engagement count |
| `kaito_sentiment_entity` | Daily sentiment time series for a token, including volume-weighted bullish and bearish scores plus notable events |
| `kaito_engagement` | Daily engagement metrics for a token or keyword, including total and smart/KOL engagement |
| `kaito_mentions` | Daily mention counts for a token or keyword across Twitter, News, Podcast, and Research |
| `kaito_mindshare_entity` | Daily mindshare time series for a token, showing its share of crypto Twitter conversation |
| `kaito_mindshare_entity_arena` | Project rankings by mindshare score, with optional category and time window filters |
| `kaito_mindshare_entity_delta` | Top gainers and losers by mindshare change over a selected time window |
| `kaito_mindshare_narrative` | Daily mindshare time series for a crypto narrative |

### Account & KOL Analytics

| Tool | Description |
|------|-------------|
| `kaito_smart_following_market` | Market-level signal showing which accounts smart followers have recently followed |
| `kaito_smart_followers` | Smart follower data for a Twitter user, including total smart follower count or gained followers for a specific date |
| `kaito_smart_following` | Latest smart accounts followed by a Twitter user in reverse chronological order |
| `kaito_mindshare_entity_by_account` | Top KOLs ranked by mindshare for a given token |
| `kaito_twitter_user_metadata` | Twitter user profile metadata by user ID, including name, username, bio, follower stats, and account classification |

### Events & Catalysts

| Tool | Description |
|------|-------------|
| `kaito_events` | Upcoming catalyst events for a token, with filtering by event type, source, and date range |

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Tokens | `kaito://tokens` | All supported token values, symbols, and project names (no auth required) |
| Narratives | `kaito://narratives` | All supported narrative IDs (no auth required) |

## Prompt Templates

| Prompt | Description |
|--------|-------------|
| `analyze_token` | Deep-dive on a single token: top discussions via search, sentiment, mindshare trends, and upcoming events |
| `market_roundup` | Priority-ranked briefing of top stories with smart account signals, mindshare movers, and catalysts |
| `discover_trending` | Trending discovery: mindshare arena rankings, delta movers, smart account signals, narrative shifts, and deep-dive search per top gainer |
| `social_listening` | Full social analysis: key discussions, sentiment, mentions, engagement, KOL mindshare, smart followers, and optional competitor comparison |
| `watchlist_portfolio` | Monitor developments, upcoming catalysts, and key narratives across a set of tokens with mindshare, sentiment, and events |

## Development

```bash
git clone https://github.com/MetaSearch-IO/kaito-mcp-server.git
cd kaito-mcp-server
npm install
npm run build
```

### Testing

Integration tests hit the real Kaito API via the proxy:

```bash
KAITO_API_KEY=your-key npm test
```

Tests are skipped if `KAITO_API_KEY` is not set.

### MCP Inspector

```bash
KAITO_API_KEY=your-key npx @modelcontextprotocol/inspector node build/index.js
```

## License

MIT
