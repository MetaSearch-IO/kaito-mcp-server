#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CURRENT_VERSION } from "./package-metadata.js";
import { createServer } from "./server.js";

async function checkForUpdates() {
  try {
    const res = await fetch(
      "https://registry.npmjs.org/kaito-mcp-server/latest",
    );
    if (!res.ok) return;
    const { version: latest } = (await res.json()) as { version: string };
    if (latest && latest !== CURRENT_VERSION) {
      console.error(
        `\n  kaito-mcp-server update available: ${CURRENT_VERSION} → ${latest}\n  Run: npx kaito-mcp-server@latest\n`,
      );
    }
  } catch {
    // silently ignore — network issues should never block the server
  }
}

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  checkForUpdates();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
