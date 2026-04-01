import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerTwitterAccountTypeTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_twitter_account_type",
    {
      description: `Get Twitter account type classification, smart follower tier, and crypto primary role.

RESPONSE FIELDS:
- id, name, username, bio, icon: Basic profile metadata.
- smart_followers: Number of smart followers.
- tier: micro (<100), small (100–299), medium (300–999), large (1000–1999), mega (2000+).
- role: Crypto primary role (e.g. Investigator, Developer, Investor). Empty string if not available.
- individual_or_entity: "individual" (person) or "entity" (organization/project).

PARAMETERS: Provide either user_id or username. user_id is preferred for reliability.

USE CASES:
- Quickly check a Twitter user's crypto role and influence tier.
- Determine if an account is an individual or an entity/organization.
- Assess credibility of a KOL before deeper analysis.
- Enrich user profiles when investigating token communities.`,
      inputSchema: {
        user_id: z
          .string()
          .optional()
          .describe("Twitter user ID (e.g. 3012852462). Preferred over username."),
        username: z
          .string()
          .optional()
          .describe("Twitter username (e.g. zachxbt). Case-insensitive."),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ user_id, username }) => {
      const data = await client.request(
        "twitter_account_type",
        { user_id, username },
        { internal: true },
      );
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
