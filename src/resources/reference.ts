import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KaitoClient } from "../client.js";

export function registerResources(server: McpServer, client: KaitoClient) {
  server.registerResource(
    "tokens",
    "kaito://tokens",
    {
      description:
        "List of all supported token tickers on Kaito. Use these values for the 'token' parameter in market data tools.",
      mimeType: "application/json",
    },
    async () => {
      const data = await client.request("tokens", {}, { requireAuth: false });
      return {
        contents: [
          {
            uri: "kaito://tokens",
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "narratives",
    "kaito://narratives",
    {
      description:
        "List of all supported crypto narrative IDs on Kaito. Use these values for the 'narrative' parameter in kaito_narrative_mindshare.",
      mimeType: "application/json",
    },
    async () => {
      const data = await client.request(
        "narratives",
        {},
        { requireAuth: false },
      );
      return {
        contents: [
          {
            uri: "kaito://narratives",
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );
}
