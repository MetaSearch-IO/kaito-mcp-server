import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";
import {
  lookupNarratives,
  lookupTokens,
  narrativeReferenceListSchema,
  tokenReferenceListSchema,
} from "../reference-search.js";

const tokenLookupOutputSchema = z.object({
  query: z.string().nullable(),
  total_available: z.number(),
  returned: z.number(),
  usage_note: z.string(),
  browse_note: z.string().optional(),
  matches: tokenReferenceListSchema,
});

const narrativeLookupOutputSchema = z.object({
  query: z.string().nullable(),
  total_available: z.number(),
  returned: z.number(),
  usage_note: z.string(),
  browse_note: z.string().optional(),
  matches: narrativeReferenceListSchema,
});

export function registerReferenceLookupTools(
  server: McpServer,
  client: KaitoClient,
) {
  server.registerTool(
    "kaito_tokens",
    {
      description: `List or search supported Kaito token identifiers by project name, token value, symbol, or CoinGecko slug. Use this before any tool that accepts token or tokens, especially in MCP clients that do not expose resources/read.

No auth required. Prefer the returned token value when filling Kaito tool parameters; the symbol field is included for reference.`,
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe("Optional project name, token value, symbol, or CoinGecko slug to search for (e.g. Hyperliquid, HYPE, hyperliquid)."),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Maximum matches to return (default: 20 for search, 50 for browse)."),
      },
      outputSchema: tokenLookupOutputSchema,
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ query, limit }) => {
      const rawData = await client.request("tokens", {}, { requireAuth: false });
      const tokens = tokenReferenceListSchema.parse(rawData);
      const result = lookupTokens(tokens, query, limit);

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    },
  );

  server.registerTool(
    "kaito_narratives",
    {
      description: `List or search supported Kaito narrative IDs by narrative code or display name. Use this before any tool that accepts narrative, especially in MCP clients that do not expose resources/read.

No auth required. Use the returned narrative value exactly as shown because Kaito narrative IDs are case-sensitive.`,
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe("Optional narrative ID or display name to search for (e.g. AI, Layer 2, BTCFi)."),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Maximum matches to return (default: 20 for search, 50 for browse)."),
      },
      outputSchema: narrativeLookupOutputSchema,
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ query, limit }) => {
      const rawData = await client.request(
        "narratives",
        {},
        { requireAuth: false },
      );
      const narratives = narrativeReferenceListSchema.parse(rawData);
      const result = lookupNarratives(narratives, query, limit);

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    },
  );
}
