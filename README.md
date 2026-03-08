# kaito-mcp-server

[![npm](https://img.shields.io/npm/v/kaito-mcp-server)](https://www.npmjs.com/package/kaito-mcp-server)
[![CI](https://github.com/MetaSearch-IO/kaito-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/MetaSearch-IO/kaito-mcp-server/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/kaito-mcp-server)](./LICENSE)

MCP server for [Kaito AI](https://kaito.ai) crypto market intelligence API. Provides 15 tools, 2 resources, and 2 prompt templates for accessing Kaito's sentiment analysis, mindshare tracking, social intelligence, and more.

## Getting Started

All configurations require a [Kaito API key](https://kaito.ai). Set it as the `KAITO_API_KEY` environment variable.

### Standard configuration

The following config works across most MCP clients (Claude Desktop, Cursor, Windsurf, etc.):

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

### Claude Desktop (one-click)

Download the latest [kaito-mcp-server.mcpb](https://github.com/MetaSearch-IO/kaito-mcp-server/releases/latest/download/kaito-mcp-server.mcpb) and open it — Claude Desktop will handle the rest.

> **Note:** MCPB installs a pinned version and does not auto-update. To get the latest version, re-download the `.mcpb` from the latest release — or switch to the [standard configuration](#standard-configuration) which uses `@latest` to always pull the newest version.

### Claude Desktop (manual)

Add the [standard config](#standard-configuration) to your `claude_desktop_config.json`:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Claude Code

```bash
claude mcp add kaito -e KAITO_API_KEY=your-api-key -- npx -y kaito-mcp-server@latest
```

### VS Code

Add the following to your User Settings (JSON) or `.vscode/settings.json`:

```json
{
  "mcp": {
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
}
```

### Cursor

Go to **Cursor Settings → MCP → Add new MCP Server**, and paste the [standard config](#standard-configuration).

### Other MCP Clients

For any MCP-compatible client, the server can be started with:

```bash
KAITO_API_KEY=your-api-key npx -y kaito-mcp-server@latest
```

The transport is **stdio**. Use this command in your client's MCP server configuration.

## Tools

### Market Data

| Tool | Description |
|------|-------------|
| `kaito_sentiment` | Daily sentiment time series for a token |
| `kaito_mindshare` | Daily mindshare time series for a token |
| `kaito_narrative_mindshare` | Daily mindshare for a crypto narrative |
| `kaito_mentions` | Daily mention counts by source |
| `kaito_engagement` | Daily engagement metrics (total + smart) |

### Search

| Tool | Description |
|------|-------------|
| `kaito_advanced_search` | Ranked crypto feeds with AI summaries and filters |

### Social

| Tool | Description |
|------|-------------|
| `kaito_smart_followers` | Smart follower count or list for a user |
| `kaito_smart_following` | Latest 100 smart accounts followed by a user |
| `kaito_get_twitter_user` | Twitter user profile metadata by user ID |
| `kaito_kol_token_mindshare` | Top KOLs ranked by mindshare for a token |
| `kaito_market_smart_following` | Accounts that smart followers have recently followed |

### Rankings

| Tool | Description |
|------|-------------|
| `kaito_mindshare_arena` | Project rankings by mindshare (use `pre_tge=true` for Pre-TGE rankings) |
| `kaito_mindshare_delta` | Top gainers and losers by mindshare change |

### Events

| Tool | Description |
|------|-------------|
| `kaito_events` | Upcoming catalyst events for a token |
| `kaito_tweet_engagement_info` | Engagement details for a specific tweet |

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Tokens | `kaito://tokens` | All supported token tickers (no auth required) |
| Narratives | `kaito://narratives` | All supported narrative IDs (no auth required) |

## Prompt Templates

| Prompt | Description |
|--------|-------------|
| `analyze_token` | Comprehensive token analysis workflow (sentiment → mindshare → mentions → engagement → events → KOL mindshare → search) |
| `discover_trending` | Trending discovery workflow (mindshare arena → delta movers → smart money signals → search) |

## Development

```bash
git clone https://github.com/MetaSearch-IO/kaito-mcp-server.git
cd kaito-mcp-server
npm install
npm run build
```

### Testing

Smoke tests hit the real Kaito API to verify all endpoints are reachable:

```bash
KAITO_API_KEY=your-key npm test        # run all 17 smoke tests
KAITO_API_KEY=your-key npm test -- -t "sentiment"  # run a single test
KAITO_API_KEY=your-key npm test -- -t "Social"     # run a describe group
```

Resource tests (`tokens`, `narratives`) run without an API key; all others are skipped if `KAITO_API_KEY` is not set.

### MCP Inspector

```bash
KAITO_API_KEY=your-key npx @modelcontextprotocol/inspector node build/index.js
```

## License

MIT
