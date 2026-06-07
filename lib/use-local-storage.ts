"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  const readValue = useCallback(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? ({ ...initialValue, ...JSON.parse(item) } as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [initialValue, key]);

  useEffect(() => {
    setValue(readValue());
    setHydrated(true);
  }, [readValue]);

  const persist = useCallback(
    (nextValue: T) => {
      setValue(nextValue);
      if (typeof window === "undefined") return;

      try {
        window.localStorage.setItem(key, JSON.stringify(nextValue));
      } catch {
        // Storage can be disabled in private or restricted browser contexts.
      }
    },
    [key]
  );

  return { value, setValue: persist, hydrated, readValue };
}
