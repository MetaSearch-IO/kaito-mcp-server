import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KaitoClient } from "../client.js";

const TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  openWorldHint: true,
} as const;

export function registerSocialTools(server: McpServer, client: KaitoClient) {
  server.tool(
    "kaito_smart_followers",
    "Get smart follower data for a Twitter user. 'count' mode returns cumulative smart follower count; 'users' mode returns the list of smart followers gained on a specific date.",
    {
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
    TOOL_ANNOTATIONS,
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

  server.tool(
    "kaito_smart_following",
    "Get the latest 100 smart accounts followed by a Twitter user, in reverse chronological order.",
    {
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
    TOOL_ANNOTATIONS,
    async ({ user_id, username, category }) => {
      const data = await client.request("smart_following", {
        user_id,
        username,
        category,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "kaito_reciprocal_followers",
    "Get reciprocal (mutual) followers for a Twitter user, sorted by smart follower count descending.",
    {
      user_id: z
        .string()
        .optional()
        .describe("Twitter user ID. One of user_id or username is required."),
      username: z
        .string()
        .optional()
        .describe("Twitter username. One of user_id or username is required."),
    },
    TOOL_ANNOTATIONS,
    async ({ user_id, username }) => {
      const data = await client.request("reciprocal_followers", {
        user_id,
        username,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
