import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerSmartFollowingTool(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_smart_following",
    {
      description: `Get the latest 100 smart accounts followed by a Twitter user, in reverse chronological order.

INTERPRETATION GUIDE:
- Smart following shows which Kaito-classified smart accounts a user has recently followed. Each result includes user_id, username, category (Individual/Organization), and the date followed.
- Recent follows signal current interests and attention — a cluster of follows in the same sector suggests active research or positioning.
- Organization follows often signal project-level interest; Individual follows suggest relationship-building or alpha sourcing.`,
      inputSchema: {
        user_id: z
          .string()
          .optional()
          .describe("Twitter user ID. One of user_id or username is required."),
        username: z
          .string()
          .optional()
          .describe("Twitter username. One of user_id or username is required."),
        category: z
          .enum(["ALL", "Organization", "Individual"])
          .optional()
          .describe("Filter by account type"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ user_id, username, category }) => {
      const data = await client.request("smart_following", {
        user_id,
        username,
        category,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
