export const REQUIRED_TOKEN_GUIDANCE =
  "TOOL CALLING: Before calling this tool, you MUST first call kaito_tokens with the user's project name or ticker and use the returned token value for the token parameter. If your MCP client supports resources, you may alternatively read kaito://tokens. Never guess token values.";

export const OPTIONAL_TOKEN_GUIDANCE =
  "TOOL CALLING: If you provide the token parameter, you MUST first call kaito_tokens with the user's project name or ticker and use the returned token value. If your MCP client supports resources, you may alternatively read kaito://tokens. Never guess token values.";

export const MULTI_TOKEN_GUIDANCE =
  "TOOL CALLING: If you provide the tokens parameter, you MUST first call kaito_tokens and use the returned token values joined by commas. If your MCP client supports resources, you may alternatively read kaito://tokens. Never guess token values.";

export const NARRATIVE_GUIDANCE =
  "TOOL CALLING: Before calling this tool, you MUST first call kaito_narratives and use the returned narrative value exactly as shown. If your MCP client supports resources, you may alternatively read kaito://narratives. Never guess narrative IDs.";
