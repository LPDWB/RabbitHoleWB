import { useEffect, useState } from "react";

export type Status = {
  code: string;
  description: string;
  action: string;
};

export function useStatuses() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/statuses")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сети");
        return res.json();
      })
      .then((data) => setStatuses(data))
      .catch((err) => {
        console.error("Ошибка при загрузке статусов", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { statuses, loading, error };
}
