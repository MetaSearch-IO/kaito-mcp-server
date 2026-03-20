import { describe, expect, it } from "vitest";
import { lookupNarratives, lookupTokens } from "../reference-search.js";

describe("lookupTokens", () => {
  const tokens = [
    {
      token: "BTC",
      symbol: "BTC",
      fullname: "Bitcoin",
      coingecko_id: "bitcoin",
    },
    {
      token: "HYPERLIQUID",
      symbol: "HYPE",
      fullname: "Hyperliquid",
      coingecko_id: "hyperliquid",
    },
    {
      token: "ETH",
      symbol: "ETH",
      fullname: "Ethereum",
      coingecko_id: "ethereum",
    },
  ];

  it("matches project names to canonical token values", () => {
    const result = lookupTokens(tokens, "hyperliquid");

    expect(result.matches[0]?.token).toBe("HYPERLIQUID");
    expect(result.matches[0]?.symbol).toBe("HYPE");
  });

  it("matches symbols directly", () => {
    const result = lookupTokens(tokens, "hype");

    expect(result.matches[0]?.token).toBe("HYPERLIQUID");
  });

  it("returns 50 rows by default when browsing without a query", () => {
    const manyTokens = Array.from({ length: 60 }, (_, index) => ({
      token: `TOKEN${index}`,
      symbol: `T${index}`,
      fullname: `Token ${index}`,
    }));

    const result = lookupTokens(manyTokens);

    expect(result.returned).toBe(50);
    expect(result.matches).toHaveLength(50);
    expect(result.browse_note).toContain("first 50 tokens");
  });

  it("caps explicit limits at 100", () => {
    const manyTokens = Array.from({ length: 120 }, (_, index) => ({
      token: `TOKEN${index}`,
      symbol: `T${index}`,
      fullname: `Token ${index}`,
    }));

    const result = lookupTokens(manyTokens, undefined, 999);

    expect(result.returned).toBe(100);
    expect(result.matches).toHaveLength(100);
  });
});

describe("lookupNarratives", () => {
  const narratives = [
    {
      narrative: "AI",
      fullname: "Artificial Intelligence",
      description: "AI-related crypto projects.",
    },
    {
      narrative: "L2",
      fullname: "Layer 2",
      description: "Rollups and scaling networks.",
    },
  ];

  it("matches narrative display names", () => {
    const result = lookupNarratives(narratives, "layer 2");

    expect(result.matches[0]?.narrative).toBe("L2");
  });
});
