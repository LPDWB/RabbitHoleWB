import { useStatuses } from "./useStatuses";
import { useState, useMemo } from "react";

export function useSearch() {
  const { statuses, loading, error } = useStatuses();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return statuses.filter((s) =>
      s.code.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.action && s.action.toLowerCase().includes(q))
    );
  }, [query, statuses]);

  const clear = () => setQuery("");

  return { query, setQuery, clear, results, loading, error };
}
