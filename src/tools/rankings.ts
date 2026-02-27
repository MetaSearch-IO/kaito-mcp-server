import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerRankingsTools(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_mindshare_arena",
    {
      description:
        "Get project rankings by mindshare score, with optional category and time window filters. Returns up to 100 projects sorted by mindshare. TIP: Set pre_tge=true to discover trending new projects that haven't launched a token yet.",
      inputSchema: {
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
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
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

  server.registerTool(
    "kaito_pre_tge_arena",
    {
      description:
        "Get Pre-TGE (pre-token generation event) project rankings by mindshare. Returns up to 100 projects. Use this to discover trending new projects that haven't launched a token yet.",
      inputSchema: {
        window: z
          .enum(["all", "24h", "48h", "7d", "30d", "3m", "6m", "12m"])
          .optional()
          .describe("Time window (default: 24h)"),
        language: z
          .enum(["all", "en", "zh", "others"])
          .optional()
          .describe("Language filter (default: all)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ window, language }) => {
      const data = await client.request("pre_tge_arena", {
        window,
        language,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
