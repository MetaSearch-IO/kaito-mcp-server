import { ChildProcess, spawn } from "node:child_process";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const ENTRY = resolve(import.meta.dirname, "../../build/index.js");
const API_KEY = process.env.KAITO_API_KEY;
const MCP_URL =
  process.env.KAITO_MCP_URL ?? "https://bff.kaito.ai/api/mcp";

function shouldSkip(): boolean {
  return !API_KEY;
}

/** Send a JSON-RPC request over stdin and read the JSON-RPC response from stdout. */
function sendRequest(
  proc: ChildProcess,
  request: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Timed out waiting for response")),
      30_000,
    );

    let buffer = "";
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString();
      // JSON-RPC messages are newline-delimited
      const lines = buffer.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.id === request.id) {
            clearTimeout(timeout);
            proc.stdout!.off("data", onData);
            resolve(parsed);
            return;
          }
        } catch {
          // incomplete JSON, keep buffering
        }
      }
      // Keep the last incomplete line in the buffer
      buffer = lines[lines.length - 1];
    };
    proc.stdout!.on("data", onData);
    proc.stdin!.write(JSON.stringify(request) + "\n");
  });
}

describe.skipIf(shouldSkip())("proxy integration", () => {
  let proc: ChildProcess;

  beforeEach(() => {
    proc = spawn("node", [ENTRY], {
      env: {
        ...process.env,
        KAITO_API_KEY: API_KEY,
        KAITO_MCP_URL: MCP_URL,
      },
      stdio: ["pipe", "pipe", "pipe"],
    });
  });

  afterEach(() => {
    proc?.kill("SIGTERM");
  });

  it("initializes and lists tools", async () => {
    // Initialize
    const initRes = await sendRequest(proc, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test", version: "0.1.0" },
      },
    });
    expect(initRes.result).toBeDefined();
    expect((initRes.result as any).serverInfo?.name).toBe("kaito");

    // Send initialized notification (required before requests)
    proc.stdin!.write(
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) +
        "\n",
    );

    // Wait briefly for notification to be processed
    await new Promise((r) => setTimeout(r, 200));

    // List tools
    const toolsRes = await sendRequest(proc, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    });
    expect(toolsRes.result).toBeDefined();
    const tools = (toolsRes.result as any).tools;
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);

    // Verify known tools exist
    const toolNames = tools.map((t: any) => t.name);
    expect(toolNames).toContain("kaito_entities");
    expect(toolNames).toContain("kaito_advanced_search");
  });

  it("forwards tool calls to remote", async () => {
    // Initialize
    await sendRequest(proc, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test", version: "0.1.0" },
      },
    });
    proc.stdin!.write(
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) +
        "\n",
    );
    await new Promise((r) => setTimeout(r, 200));

    // Call kaito_entities (reference lookup)
    const entitiesRes = await sendRequest(proc, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "kaito_entities",
        arguments: {},
      },
    });
    expect(entitiesRes.result).toBeDefined();
    expect((entitiesRes.result as any).content).toBeDefined();

    // Call kaito_sentiment_entity (requires auth, exercises full proxy path)
    const sentimentRes = await sendRequest(proc, {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "kaito_sentiment_entity",
        arguments: { token: "BTC" },
      },
    });
    expect(sentimentRes.result).toBeDefined();
    expect((sentimentRes.result as any).content).toBeDefined();
  });
});
