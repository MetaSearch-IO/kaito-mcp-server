import { z } from "zod";

const tokenReferenceSchema = z.object({
  token: z.string(),
  fullname: z.string().optional(),
  symbol: z.string().optional(),
  coingecko_id: z.string().optional(),
});

const narrativeReferenceSchema = z.object({
  narrative: z.string(),
  fullname: z.string().optional(),
  description: z.string().optional(),
});

export const tokenReferenceListSchema = z.array(tokenReferenceSchema);
export const narrativeReferenceListSchema = z.array(narrativeReferenceSchema);

export type TokenReference = z.infer<typeof tokenReferenceSchema>;
export type NarrativeReference = z.infer<typeof narrativeReferenceSchema>;

type LookupResult<T> = {
  query: string | null;
  total_available: number;
  returned: number;
  usage_note: string;
  browse_note?: string;
  matches: T[];
};

type RankedItem<T> = {
  item: T;
  score: number;
};

function normalize(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(value: string | undefined): string {
  return normalize(value).replace(/\s+/g, "");
}

function scoreField(
  query: string,
  compactQuery: string,
  value: string | undefined,
  priority: number,
): number | null {
  const normalizedValue = normalize(value);
  if (!normalizedValue) return null;

  const compactValue = compact(value);
  if (normalizedValue === query || compactValue === compactQuery) {
    return priority;
  }

  if (
    normalizedValue.startsWith(query) ||
    compactValue.startsWith(compactQuery)
  ) {
    return 10 + priority;
  }

  if (normalizedValue.split(" ").some((word) => word.startsWith(query))) {
    return 20 + priority;
  }

  if (
    normalizedValue.includes(query) ||
    compactValue.includes(compactQuery)
  ) {
    return 30 + priority;
  }

  return null;
}

function rankMatches<T>(
  items: T[],
  query: string,
  getFields: (item: T) => Array<string | undefined>,
  getSortKey: (item: T) => string,
): T[] {
  const compactQuery = compact(query);

  return items
    .map((item) => {
      const bestScore = getFields(item).reduce<number | null>(
        (currentBest, value, index) => {
          const nextScore = scoreField(query, compactQuery, value, index);
          if (nextScore === null) return currentBest;
          if (currentBest === null) return nextScore;
          return Math.min(currentBest, nextScore);
        },
        null,
      );

      if (bestScore === null) return null;
      return { item, score: bestScore } satisfies RankedItem<T>;
    })
    .filter((item): item is RankedItem<T> => item !== null)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      return getSortKey(left.item).localeCompare(getSortKey(right.item));
    })
    .map(({ item }) => item);
}

function resolveLimit(query: string | undefined, limit: number | undefined) {
  const fallback = query ? 20 : 50;
  return Math.min(Math.max(limit ?? fallback, 1), 100);
}

export function lookupTokens(
  tokens: TokenReference[],
  query?: string,
  limit?: number,
): LookupResult<TokenReference> {
  const normalizedQuery = normalize(query);
  const resolvedLimit = resolveLimit(normalizedQuery, limit);
  const matches = normalizedQuery
    ? rankMatches(
        tokens,
        normalizedQuery,
        (token) => [
          token.token,
          token.symbol,
          token.fullname,
          token.coingecko_id,
        ],
        (token) => token.token,
      )
    : [...tokens].sort((left, right) => left.token.localeCompare(right.token));

  return {
    query: normalizedQuery || null,
    total_available: tokens.length,
    returned: Math.min(matches.length, resolvedLimit),
    usage_note:
      "Use the returned token value for Kaito tool parameters. The symbol field is included for reference.",
    browse_note: normalizedQuery
      ? undefined
      : `Showing the first ${resolvedLimit} tokens alphabetically. Provide a query to narrow the results.`,
    matches: matches.slice(0, resolvedLimit),
  };
}

export function lookupNarratives(
  narratives: NarrativeReference[],
  query?: string,
  limit?: number,
): LookupResult<NarrativeReference> {
  const normalizedQuery = normalize(query);
  const resolvedLimit = resolveLimit(normalizedQuery, limit);
  const matches = normalizedQuery
    ? rankMatches(
        narratives,
        normalizedQuery,
        (narrative) => [narrative.narrative, narrative.fullname],
        (narrative) => narrative.narrative,
      )
    : [...narratives].sort((left, right) =>
        left.narrative.localeCompare(right.narrative),
      );

  return {
    query: normalizedQuery || null,
    total_available: narratives.length,
    returned: Math.min(matches.length, resolvedLimit),
    usage_note:
      "Use the returned narrative value exactly as shown. Narrative IDs are case-sensitive.",
    browse_note: normalizedQuery
      ? undefined
      : `Showing the first ${resolvedLimit} narratives alphabetically. Provide a query to narrow the results.`,
    matches: matches.slice(0, resolvedLimit),
  };
}
