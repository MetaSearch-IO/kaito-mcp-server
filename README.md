# kaito-mcp-server

MCP server for [Kaito AI](https://kaito.ai) crypto market intelligence API. Provides 13 tools, 2 resources, and 2 prompt templates for accessing Kaito's sentiment analysis, mindshare tracking, social intelligence, and more.

## Getting Started

All configurations require a [Kaito API key](https://kaito.ai). Set it as the `KAITO_API_KEY` environment variable.

### Standard configuration

The following config works across most MCP clients (Claude Desktop, Cursor, Windsurf, etc.):

```json
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

### Claude Desktop (one-click)

Download the latest [kaito-mcp-server.mcpb](https://github.com/MetaSearch-IO/kaito-mcp-server/releases/latest/download/kaito-mcp-server.mcpb) and open it — Claude Desktop will handle the rest.

### Claude Desktop (manual)

Add the [standard config](#standard-configuration) to your `claude_desktop_config.json`:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Claude Code

```bash
claude mcp add kaito -e KAITO_API_KEY=your-api-key -- npx -y kaito-mcp-server
```

### VS Code

Add the following to your User Settings (JSON) or `.vscode/settings.json`:

```json
{
  "mcp": {
    "servers": {
      "kaito": {
        "command": "npx",
        "args": ["-y", "kaito-mcp-server"],
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
KAITO_API_KEY=your-api-key npx -y kaito-mcp-server
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
