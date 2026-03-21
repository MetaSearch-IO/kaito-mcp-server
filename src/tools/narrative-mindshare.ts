import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";
import { NARRATIVE_GUIDANCE } from "../tool-guidance.js";

export function registerNarrativeMindshareTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_narrative_mindshare",
    {
      description: `${NARRATIVE_GUIDANCE}

Get daily mindshare time series for a crypto narrative (e.g. AI, DeFi, L2). Use kaito_narratives to find valid narrative IDs.

IMPORTANT: Narrative IDs are case-sensitive and must match exactly. Mismatched casing (e.g. "ai" instead of "AI") returns a 400 error. Use kaito_narratives for the authoritative list.

Common narrative IDs: AI, DeFi, L2, RWA, ZK, Meme, DePIN, SocialFi, Stablecoin, ETF, Halving, DA, LSD, LRT, GameFi, DeSci, Metaverse, Oracle, Rollups, BRC20, BTCL2, SVM, EVM, Pectra.
Prefixed narrative IDs (use "Topic" prefix): TopicPerpDEX, TopicPrivacy, TopicRobotics, TopicBTCFi, TopicDeFAI, TopicFHE, TopicTEE, TopicInterops, TopicRune, TopicZKTLS, TopicPayFi, TopicDAT, Topicx402.
Other IDs: ParallelEVM, AppChain, DeSoc, GambleFi, PredictionMarkets, GeneralCryptoAI, GeneralNFT, GeneralCrypto, Preconfs, Omnichain, Modularity, L3, EIP1559, EIP4844, "Account Abstraction", "Chain Abstraction", "Telegram Bot".

INTERPRETATION GUIDE:
- Narrative mindshare is the percentage of total crypto Twitter conversation attributed to a narrative theme (e.g. AI, DeFi). It measures how much attention an entire category is receiving relative to the broader market.
- Calculate % change (last day vs first day) to classify movement — Surging: >=+10%, Fading: <=-10%, Stable: within ±10%.
- Use the 30-day default for recent trend checks. For questions requiring historical context (baseline comparison, high/low/average, trend reversals), use a 12-month lookback.
- Always compare current value to the period average — a single value alone is meaningless without context.

WORKFLOWS: Commonly used in discover_trending, among others. If a matching prompt template exists for your current workflow, call it for the full tool plan.`,
      inputSchema: {
        narrative: z.string().describe("Narrative ID (e.g. AI, DeFi). See kaito_narratives."),
        start_date: z
          .string()
          .optional()
          .describe("Start date YYYY-MM-DD (default: 30 days ago, earliest: 2023-01-01)"),
        end_date: z
          .string()
          .optional()
          .describe("End date YYYY-MM-DD (default: tomorrow)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ narrative, start_date, end_date }) => {
      const data = await client.request("narrative_mindshare", {
        narrative,
        start_date,
        end_date,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
