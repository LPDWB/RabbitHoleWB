import { useStatuses } from "./useStatuses";
import { useState, useMemo } from "react";

export function useSearch() {
  const { statuses, loading, error } = useStatuses();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return statuses.filter((status) => {
      if (!status) return false;
      const code = status.code?.toLowerCase?.() ?? "";
      const description = status.description?.toLowerCase?.() ?? "";
      const action = status.action?.toLowerCase?.() ?? "";
      return (
        code.includes(q) ||
        description.includes(q) ||
        (action && action.includes(q))
      );
    });
  }, [query, statuses]);

  const clear = () => setQuery("");

  return { query, setQuery, clear, results, loading, error };
}
