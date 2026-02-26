import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = "https://api.kaito.ai/api/v1";

export class KaitoClient {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.KAITO_API_KEY;
  }

  async request(
    endpoint: string,
    params: Record<string, string | undefined>,
    options?: { requireAuth?: boolean },
  ): Promise<unknown> {
    const requireAuth = options?.requireAuth ?? true;

    if (requireAuth && !this.apiKey) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "KAITO_API_KEY environment variable is not set. Please configure it to use this tool.",
      );
    }

    const url = new URL(`${BASE_URL}/${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }

    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      switch (response.status) {
        case 401:
        case 403:
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Authentication failed (${response.status}): ${body || "Invalid API key"}`,
          );
        case 429:
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Rate limit exceeded. Kaito API allows 5 requests/second. ${body}`,
          );
        default:
          throw new McpError(
            ErrorCode.InternalError,
            `Kaito API error ${response.status}: ${body || response.statusText}`,
          );
      }
    }

    return response.json();
  }
}
