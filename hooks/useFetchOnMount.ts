"use client";

import { useEffect } from "react";

export function useFetchOnMount<T>(
  url: string,
  onSuccess: (data: T) => void,
  options: { onFinally?: () => void; deps?: unknown[] } = {}
) {
  const { onFinally, deps = [] } = options;
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(url);
        const data = await res.json() as T;
        if (!cancelled) onSuccess(data);
      } catch (e) {
        console.error(`[fetch] ${url} failed`, e);
      } finally {
        if (!cancelled) onFinally?.();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
