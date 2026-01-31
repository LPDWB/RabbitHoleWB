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
    let isActive = true;

    const loadStatuses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/statuses", {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Ошибка сети: ${res.status}`);
        }

        const rawText = await res.text();
        let data: unknown;

        try {
          data = rawText ? JSON.parse(rawText) : {};
        } catch (parseError) {
          throw new Error("Некорректный JSON от сервера");
        }

        const rawStatuses = Array.isArray((data as { statuses?: unknown }).statuses)
          ? (data as { statuses: unknown[] }).statuses
          : [];

        const normalized = rawStatuses
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const record = item as Record<string, unknown>;
            const code = typeof record.code === "string" ? record.code : String(record.code ?? "");
            const description =
              typeof record.description === "string"
                ? record.description
                : String(record.description ?? "");
            const action =
              record.action == null
                ? ""
                : typeof record.action === "string"
                  ? record.action
                  : String(record.action);
            return { code, description, action };
          })
          .filter((value): value is Status => Boolean(value));

        if (isActive) {
          setStatuses(normalized);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Неизвестная ошибка";
        console.error("Ошибка при загрузке статусов", err);
        if (isActive) {
          setError(message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadStatuses();

    return () => {
      isActive = false;
    };
  }, []);

  return { statuses, loading, error };
}
