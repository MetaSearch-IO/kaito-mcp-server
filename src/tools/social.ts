import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

export function registerSocialTools(server: McpServer, client: KaitoClient) {
  server.registerTool(
    "kaito_smart_followers",
    {
      description:
        "Get smart follower data for a Twitter user. 'count' mode returns cumulative smart follower count; 'users' mode returns the list of smart followers gained on a specific date.",
      inputSchema: {
        user_id: z
          .string()
          .optional()
          .describe("Twitter user ID. One of user_id or username is required."),
        username: z
          .string()
          .optional()
          .describe("Twitter username. One of user_id or username is required."),
        date: z
          .string()
          .optional()
          .describe("Date YYYY-MM-DD (default: yesterday, must be >= 2024-01-01)"),
        mode: z
          .enum(["count", "users"])
          .optional()
          .describe("'count' for cumulative count, 'users' for follower list (default: count)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ user_id, username, date, mode }) => {
      const data = await client.request("smart_followers", {
        user_id,
        username,
        date,
        mode,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.registerTool(
    "kaito_smart_following",
    {
      description:
        "Get the latest 100 smart accounts followed by a Twitter user, in reverse chronological order.",
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

  server.registerTool(
    "kaito_reciprocal_followers",
    {
      description:
        "Get reciprocal (mutual) followers for a Twitter user, sorted by smart follower count descending.",
      inputSchema: {
        user_id: z
          .string()
          .optional()
          .describe("Twitter user ID. One of user_id or username is required."),
        username: z
          .string()
          .optional()
          .describe("Twitter username. One of user_id or username is required."),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ user_id, username }) => {
      const data = await client.request("reciprocal_followers", {
        user_id,
        username,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
