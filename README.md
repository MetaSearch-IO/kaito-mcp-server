# kaito-mcp-server

MCP server for [Kaito AI](https://kaito.ai) crypto market intelligence API. Provides 13 tools, 2 resources, and 2 prompt templates for accessing Kaito's sentiment analysis, mindshare tracking, social intelligence, and more.

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```jsonc
{
  "mcpServers": {
    "kaito": {
      "command": "npx",
      "args": ["-y", "kaito-mcp-server"],
      "env": {
        "KAITO_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add kaito -- npx -y kaito-mcp-server
```

Set the environment variable `KAITO_API_KEY` before launching.

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
| `kaito_reciprocal_followers` | Mutual followers sorted by smart follower count |

### Rankings

| Tool | Description |
|------|-------------|
| `kaito_mindshare_arena` | Project rankings by mindshare |
| `kaito_pre_tge_arena` | Pre-TGE project rankings by mindshare |

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
| `analyze_token` | Comprehensive token analysis workflow (sentiment → mindshare → mentions → engagement → events → search) |
| `discover_trending` | Trending discovery workflow (mindshare arena → pre-TGE arena → search) |

## Development

```bash
git clone https://github.com/MetaSearch-IO/kaito-mcp-server.git
cd kaito-mcp-server
npm install
npm run build
```

Test with the MCP Inspector:

```bash
KAITO_API_KEY=your-key npx @modelcontextprotocol/inspector node build/index.js
```

## License

MIT
