import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";
import { REQUIRED_TOKEN_GUIDANCE } from "../tool-guidance.js";

export function registerTwitterOfficialAccountTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_twitter_official_account",
    {
      description: `${REQUIRED_TOKEN_GUIDANCE}

Get the official and affiliate Twitter accounts associated with a cryptocurrency token. Use kaito_tokens to find valid token values.

RESPONSE FIELDS:
- accounts: Official project Twitter accounts (with image_url, name, username, user_id, verified).
- affiliates: Key affiliated accounts such as founders, team members, support (same fields as accounts).

USE CASES:
- Identify official Twitter accounts for a token project.
- Find key people (founders, team members) affiliated with a token.
- Verify which accounts are official vs affiliate.

WORKFLOWS: Useful as a starting point before calling kaito_smart_followers or kaito_smart_following on the returned accounts.`,
      inputSchema: {
        token: z.string().describe("Resolved token value from kaito_tokens (e.g. BTC, ETH, BNB)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ token }) => {
      const data = await client.request(
        "twitter_official_account",
        { token },
        { internal: true },
      );
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
