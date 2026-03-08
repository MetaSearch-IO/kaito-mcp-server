import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { KaitoClient } from "../client.js";

const SKIP_REASON = "KAITO_API_KEY not set";
const hasApiKey = !!process.env.KAITO_API_KEY;

const client = new KaitoClient();

// Rate limit protection: 100ms between each test (API limit: 5 req/s)
beforeEach(() => new Promise((r) => setTimeout(r, 100)));

describe.skipIf(!hasApiKey)("Market Data", () => {
  it("sentiment", async () => {
    const result = await client.request("sentiment", { token: "BTC" });
    expect(result).toBeDefined();
  });

  it("mindshare", async () => {
    const result = await client.request("mindshare", { token: "BTC" });
    expect(result).toBeDefined();
  });

  it("narrative_mindshare", async () => {
    const result = await client.request("narrative_mindshare", {
      narrative: "AI",
    });
    expect(result).toBeDefined();
  });

  it("mentions", async () => {
    const result = await client.request("mentions", { token: "BTC" });
    expect(result).toBeDefined();
  });

  it("engagement", async () => {
    const result = await client.request("engagement", { token: "BTC" });
    expect(result).toBeDefined();
  });
});

describe.skipIf(!hasApiKey)("Search", () => {
  it("advanced_search", async () => {
    const result = await client.request("advanced_search", { tokens: "BTC" });
    expect(result).toBeDefined();
  });
});

describe.skipIf(!hasApiKey)("Social", () => {
  it("smart_followers", async () => {
    const result = await client.request("smart_followers", {
      username: "VitalikButerin",
    });
    expect(result).toBeDefined();
  });

  it("smart_following", async () => {
    const result = await client.request("smart_following", {
      username: "VitalikButerin",
    });
    expect(result).toBeDefined();
  });

  it("kol_token_mindshare", async () => {
    const result = await client.request("kol_token_mindshare", {
      token: "BTC",
    });
    expect(result).toBeDefined();
  });

  it("get_twitter_user", async () => {
    const result = await client.request("get_twitter_user", {
      user_id: "950486928784228352",
    });
    expect(result).toBeDefined();
  });

  it("market_smart_following", async () => {
    const result = await client.request("market_smart_following", {});
    expect(result).toBeDefined();
  });
});

describe.skipIf(!hasApiKey)("Rankings", () => {
  it("mindshare_arena", async () => {
    const result = await client.request("mindshare_arena", {});
    expect(result).toBeDefined();
  });

  it("mindshare_delta", async () => {
    const result = await client.request("mindshare_delta", {});
    expect(result).toBeDefined();
  });
});

describe.skipIf(!hasApiKey)("Events", () => {
  it("events", async () => {
    const result = await client.request("events", { token: "BTC" });
    expect(result).toBeDefined();
  });

  it("tweet_engagement_info", async () => {
    const result = await client.request("tweet_engagement_info", {
      tweet_id: "2029089398625845359",
    });
    expect(result).toBeDefined();
  });
});

describe("Resources (no auth)", () => {
  it("tokens", async () => {
    const result = await client.request("tokens", {}, { requireAuth: false });
    expect(result).toBeDefined();
  });

  it("narratives", async () => {
    const result = await client.request(
      "narratives",
      {},
      { requireAuth: false },
    );
    expect(result).toBeDefined();
  });
});
