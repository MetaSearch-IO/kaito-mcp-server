import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerRankingsTools(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_mindshare_arena",
    {
      description:
        "Get project rankings by mindshare score, with optional category and time window filters. Returns up to 100 projects sorted by mindshare. To get Pre-TGE (pre-token generation event) rankings, set pre_tge=true without categories — this returns the same results as a dedicated pre-TGE arena view.",
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

}
