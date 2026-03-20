# Kaito MCP Server

MCP server for [Kaito AI](https://kaito.ai) crypto market intelligence API.

## Tech Stack

- **TypeScript** (strict mode, ES2022, Node16 modules)
- **@modelcontextprotocol/sdk** + **zod** — only two runtime dependencies
- **Node.js >= 18**, ES modules (`"type": "module"`)

## Project Layout

```
src/
├── index.ts          # Entry point — stdio transport
├── server.ts         # MCP server creation, registers all tools/resources/prompts
├── client.ts         # KaitoClient — centralized HTTP client (base: api.kaito.ai/api/v1)
├── tools/               # One file per tool
│   ├── sentiment.ts
│   ├── mindshare.ts
│   ├── narrative-mindshare.ts
│   ├── mentions.ts
│   ├── engagement.ts
│   ├── advanced-search.ts
│   ├── smart-followers.ts
│   ├── smart-following.ts
│   ├── get-twitter-user.ts
│   ├── kol-token-mindshare.ts
│   ├── market-smart-following.ts
│   ├── mindshare-arena.ts
│   ├── mindshare-delta.ts
│   ├── events.ts
│   └── tweet-engagement-info.ts
├── resources/
│   └── reference.ts     # kaito://tokens, kaito://narratives (no auth)
└── prompts/
    └── workflows.ts     # analyze_token, discover_trending
```

## Commands

```bash
npm run build        # tsc — compile to build/
npm run dev          # tsc --watch
npm start            # node build/index.js
```

## Versioning

**Both `package.json` and `manifest.json` must have the same version.**

Bump via npm — the lifecycle hooks handle everything automatically:

```bash
npm version patch    # e.g. 0.1.5 → 0.1.6
npm version minor    # e.g. 0.1.5 → 0.2.0
npm version major    # e.g. 0.1.5 → 1.0.0
```

What happens under the hood:
1. `preversion` — runs `npm run build` to verify compilation
2. `npm version` — updates `package.json`, creates commit & tag
3. `postversion` — syncs version to `manifest.json`, amends commit, pushes (tags stay local)

**Never edit version numbers manually.** Always use `npm version`.

## CI/CD (`.github/workflows/release.yml`)

- **Trigger**: push to `main` that changes `manifest.json`
- **Steps**: verify version sync → build → pack MCPB bundle → publish to npm → publish to GitHub Packages (`@metasearch-io/kaito-mcp-server`) → create GitHub Release with tag
- **Guard**: CI fails if `package.json` and `manifest.json` versions don't match
- **Secrets**: `NPM_TOKEN` for npm registry

## Conventions

- All tools are read-only (`readOnlyHint: true`, `openWorldHint: true`)
- Tool inputs validated with Zod schemas
- API auth via `KAITO_API_KEY` env var, passed as `x-api-key` header
- Rate limit: 5 req/s
- One tool per file in `src/tools/`
- Adding a new tool: create a new `src/tools/<tool-name>.ts` file, register in `server.ts`, and add to `manifest.json` tools array
