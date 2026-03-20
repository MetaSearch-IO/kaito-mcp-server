import { createRequire } from "node:module";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CURRENT_VERSION, SERVER_NAME } from "../package-metadata.js";
import { createServer } from "../server.js";

const require = createRequire(import.meta.url);
const manifest = require("../../manifest.json") as {
  version: string;
  tools: Array<{ name: string }>;
};
const pkg = require("../../package.json") as { version: string };

type TestConnection = {
  client: Client;
  server: ReturnType<typeof createServer>;
};

type TextToolResultItem = {
  type: "text";
  text: string;
};

const openConnections: TestConnection[] = [];

async function connectTestClient() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({
    name: "kaito-test-client",
    version: "1.0.0",
  });
  const server = createServer();

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  const connection = { client, server };
  openConnections.push(connection);
  return connection;
}

afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();

  while (openConnections.length > 0) {
    const connection = openConnections.pop();
    if (!connection) continue;

    await Promise.all([connection.client.close(), connection.server.close()]);
  }
});

describe("server consistency", () => {
  it("reports the package version during MCP initialization", async () => {
    const { client } = await connectTestClient();

    expect(pkg.version).toBe(manifest.version);
    expect(CURRENT_VERSION).toBe(pkg.version);
    expect(client.getServerVersion()).toEqual({
      name: SERVER_NAME,
      version: CURRENT_VERSION,
    });
  });

  it("exposes the same tool names as manifest.json", async () => {
    const { client } = await connectTestClient();

    const result = await client.listTools();
    const toolNames = result.tools.map((tool) => tool.name).sort();
    const manifestToolNames = manifest.tools.map((tool) => tool.name).sort();

    expect(toolNames).toEqual(manifestToolNames);
  });

  it("exposes the expected resources and prompts", async () => {
    const { client } = await connectTestClient();

    const resources = await client.listResources();
    const prompts = await client.listPrompts();

    expect(resources.resources.map((resource) => resource.uri).sort()).toEqual([
      "kaito://narratives",
      "kaito://tokens",
    ]);
    expect(prompts.prompts.map((prompt) => prompt.name).sort()).toEqual([
      "analyze_token",
      "discover_trending",
    ]);
  });
});

describe("reference lookup tools", () => {
  it("lists and resolves canonical token values through MCP tool calls", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = new URL(
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url,
        );

        if (url.pathname.endsWith("/tokens")) {
          return new Response(
            JSON.stringify([
              {
                token: "BTC",
                symbol: "BTC",
                fullname: "Bitcoin",
                coingecko_id: "bitcoin",
              },
              {
                token: "HYPERLIQUID",
                symbol: "HYPE",
                fullname: "Hyperliquid",
                coingecko_id: "hyperliquid",
              },
            ]),
            {
              status: 200,
              headers: { "content-type": "application/json" },
            },
          );
        }

        return new Response("unexpected endpoint", { status: 404 });
      }),
    );

    const { client } = await connectTestClient();

    const tools = await client.listTools();
    expect(tools.tools.some((tool) => tool.name === "kaito_tokens")).toBe(true);

    const result = await client.callTool({
      name: "kaito_tokens",
      arguments: { query: "Hyperliquid" },
    });

    const content = result.content as TextToolResultItem[];
    const text = content.find((item) => item.type === "text");
    expect(text?.type).toBe("text");

    const payload = JSON.parse(text?.type === "text" ? text.text : "{}") as {
      matches: Array<{ token: string; symbol?: string }>;
    };
    const structured = result.structuredContent as {
      matches: Array<{ token: string; symbol?: string }>;
    };

    expect(payload.matches[0]).toMatchObject({
      token: "HYPERLIQUID",
      symbol: "HYPE",
    });
    expect(structured.matches[0]).toMatchObject({
      token: "HYPERLIQUID",
      symbol: "HYPE",
    });
  });

  it("resolves narrative IDs through MCP tool calls", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = new URL(
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url,
        );

        if (url.pathname.endsWith("/narratives")) {
          return new Response(
            JSON.stringify([
              {
                narrative: "AI",
                fullname: "Artificial Intelligence",
              },
              {
                narrative: "L2",
                fullname: "Layer 2",
              },
            ]),
            {
              status: 200,
              headers: { "content-type": "application/json" },
            },
          );
        }

        return new Response("unexpected endpoint", { status: 404 });
      }),
    );

    const { client } = await connectTestClient();

    const result = await client.callTool({
      name: "kaito_narratives",
      arguments: { query: "Layer 2" },
    });

    const content = result.content as TextToolResultItem[];
    const text = content.find((item) => item.type === "text");
    expect(text?.type).toBe("text");

    const payload = JSON.parse(text?.type === "text" ? text.text : "{}") as {
      matches: Array<{ narrative: string }>;
    };
    const structured = result.structuredContent as {
      matches: Array<{ narrative: string }>;
    };

    expect(payload.matches[0]).toMatchObject({
      narrative: "L2",
    });
    expect(structured.matches[0]).toMatchObject({
      narrative: "L2",
    });
  });
});
