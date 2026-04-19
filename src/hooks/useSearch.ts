import { useMemo, useState } from "react";
import { useStatuses, type Status } from "./useStatuses";

export function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitWords(value: string) {
  const normalized = normalize(value);
  if (!normalized) return [];
  return normalized.split(" ").filter(Boolean);
}

export function isStatusCodeQuery(query: string) {
  const q = query.trim();
  if (!q) return false;
  return /^[a-z0-9]+$/i.test(q);
}

function normalizeStatusCode(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9]/g, "");
}

export function matchesWordSearch(status: Status, query: string) {
  const queryWords = splitWords(query);
  if (queryWords.length === 0) return false;

  const searchableWords = [
    ...splitWords(status.description ?? ""),
    ...splitWords(status.action ?? ""),
  ];
  if (searchableWords.length === 0) return false;

  return queryWords.every((queryWord) =>
    searchableWords.some((word) => word.startsWith(queryWord))
  );
}

export function filterStatuses(statuses: Status[], query: string) {
  const q = query.trim();
  if (!q) return [];

  if (isStatusCodeQuery(q)) {
    const normalizedQueryCode = normalizeStatusCode(q);
    if (!normalizedQueryCode) return [];

    const exactMatches = statuses.filter((status) => {
      const normalizedCode = normalizeStatusCode(status.code ?? "");
      return normalizedCode === normalizedQueryCode;
    });

    if (exactMatches.length > 0) {
      return exactMatches;
    }

    return statuses.filter((status) => {
      const normalizedCode = normalizeStatusCode(status.code ?? "");
      return normalizedCode.startsWith(normalizedQueryCode);
    });
  }

  return statuses.filter((status) => matchesWordSearch(status, q));
}

export function useSearch() {
  const { statuses, loading, error } = useStatuses();
  const [query, setQuery] = useState("");

  const results = useMemo(() => filterStatuses(statuses, query), [query, statuses]);
  const clear = () => setQuery("");

  return { query, setQuery, clear, results, statuses, loading, error };
}
