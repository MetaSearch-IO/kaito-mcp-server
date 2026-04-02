#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CURRENT_VERSION, SERVER_NAME } from "./package-metadata.js";

const DEFAULT_MCP_URL = "https://bff.kaito.ai/api/mcp";

function checkForUpdates() {
  fetch("https://registry.npmjs.org/kaito-mcp-server/latest")
    .then((res) => {
      if (!res.ok) return;
      return res.json() as Promise<{ version: string }>;
    })
    .then((data) => {
      if (data?.version && data.version !== CURRENT_VERSION) {
        console.error(
          `\n  kaito-mcp-server update available: ${CURRENT_VERSION} → ${data.version}\n  Run: npx kaito-mcp-server@latest\n`,
        );
      }
    })
    .catch(() => {
      // silently ignore — network issues should never block the server
    });
}

async function main() {
  // 1. Validate env
  const apiKey = process.env.KAITO_API_KEY;
  if (!apiKey) {
    console.error(
      "Error: KAITO_API_KEY environment variable is required.\n" +
        "Get your API key at https://kaito.ai and set it in your MCP config.",
    );
    process.exit(1);
  }

  const mcpUrl = process.env.KAITO_MCP_URL ?? DEFAULT_MCP_URL;

  // 2. Connect to remote MCP server
  const remoteTransport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  });

  const remoteClient = new Client(
    { name: `${SERVER_NAME}-proxy`, version: CURRENT_VERSION },
    { capabilities: {} },
  );

  try {
    await remoteClient.connect(remoteTransport, { timeout: 30_000 });
  } catch (err) {
    console.error(
      `Failed to connect to Kaito MCP server at ${mcpUrl}: ${err instanceof Error ? err.message : err}`,
    );
    process.exit(1);
  }

  // 3. Create local server with forwarding handlers
  const localServer = new Server(
    { name: SERVER_NAME, version: CURRENT_VERSION },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    },
  );

  // Forward tools
  localServer.setRequestHandler(ListToolsRequestSchema, (req) =>
    remoteClient.listTools(req.params),
  );
  localServer.setRequestHandler(CallToolRequestSchema, (req) =>
    remoteClient.callTool(req.params),
  );

  // Forward resources
  localServer.setRequestHandler(ListResourcesRequestSchema, (req) =>
    remoteClient.listResources(req.params),
  );
  localServer.setRequestHandler(ReadResourceRequestSchema, (req) =>
    remoteClient.readResource(req.params),
  );
  localServer.setRequestHandler(ListResourceTemplatesRequestSchema, (req) =>
    remoteClient.listResourceTemplates(req.params),
  );

  // Forward prompts
  localServer.setRequestHandler(ListPromptsRequestSchema, (req) =>
    remoteClient.listPrompts(req.params),
  );
  localServer.setRequestHandler(GetPromptRequestSchema, (req) =>
    remoteClient.getPrompt(req.params),
  );

  // 4. Serve locally via stdio
  const stdioTransport = new StdioServerTransport();
  await localServer.connect(stdioTransport);

  // 5. Graceful shutdown
  const cleanup = async () => {
    try {
      await localServer.close();
      await remoteClient.close();
    } catch {
      // best-effort cleanup
    }
    process.exit(0);
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // 6. Background update check
  checkForUpdates();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
