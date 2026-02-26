import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

const TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  openWorldHint: true,
} as const;

export function registerRankingsTools(server: McpServer, client: KaitoClient) {
  server.tool(
    "kaito_mindshare_arena",
    "Get project rankings by mindshare score, with optional category and time window filters. Returns up to 100 projects sorted by mindshare.",
    {
      duration: z
        .enum(["all", "24h", "48h", "7d", "30d", "3m", "6m", "12m"])
        .optional()
        .describe("Time window (default: 24h)"),
      language: z
        .enum(["all", "en", "zh", "ko", "others"])
        .optional()
        .describe("Language filter (default: all)"),
      categories: z
        .enum(["EXCHANGE", "INFOMKT"])
        .optional()
        .describe("Category filter: EXCHANGE or INFOMKT"),
      pre_tge: z
        .boolean()
        .optional()
        .describe("Set true to filter Pre-TGE projects"),
      ex_official: z
        .boolean()
        .optional()
        .describe("Exclude official project accounts (default: false)"),
      weighted: z
        .boolean()
        .optional()
        .describe("Weight by smart engagement (default: true)"),
      nft: z
        .boolean()
        .optional()
        .describe("Include NFT projects (default: false)"),
    },
    TOOL_ANNOTATIONS,
    async ({ duration, language, categories, pre_tge, ex_official, weighted, nft }) => {
      const data = await client.request("mindshare_arena", {
        duration,
        language,
        categories,
        pre_tge: pre_tge?.toString(),
        ex_official: ex_official?.toString(),
        weighted: weighted?.toString(),
        nft: nft?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "kaito_pre_tge_arena",
    "Get Pre-TGE (pre-token generation event) project rankings by mindshare. Returns up to 100 projects.",
    {
      window: z
        .enum(["all", "24h", "48h", "7d", "30d", "3m", "6m", "12m"])
        .optional()
        .describe("Time window (default: 24h)"),
      language: z
        .enum(["all", "en", "zh", "others"])
        .optional()
        .describe("Language filter (default: all)"),
    },
    TOOL_ANNOTATIONS,
    async ({ window, language }) => {
      const data = await client.request("pre_tge_arena", {
        window,
        language,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
