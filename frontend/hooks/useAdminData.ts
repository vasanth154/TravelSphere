"use client";

import { useCallback, useEffect, useState } from "react";

interface UseAdminDataOptions {
  load: () => Promise<unknown>;
  initial?: unknown;
}

export function useAdminData<T>({ load, initial }: UseAdminDataOptions) {
  const [data, setData] = useState<T | null>(initial as T | null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData((await load()) as T);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}