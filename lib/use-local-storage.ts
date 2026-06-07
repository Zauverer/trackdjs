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
        window.dispatchEvent(new CustomEvent("trackdjs:local-storage", { detail: { key, value: nextValue } }));
      } catch {
        // Storage can be disabled in private or restricted browser contexts.
      }
    },
    [key]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onExternalUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string; value?: T }>).detail;
      if (detail?.key === key && detail.value) setValue(detail.value);
    };
    const onNativeStorage = (event: StorageEvent) => {
      if (event.key === key) setValue(readValue());
    };
    window.addEventListener("trackdjs:local-storage", onExternalUpdate);
    window.addEventListener("storage", onNativeStorage);
    return () => {
      window.removeEventListener("trackdjs:local-storage", onExternalUpdate);
      window.removeEventListener("storage", onNativeStorage);
    };
  }, [key, readValue]);

  return { value, setValue: persist, hydrated, readValue };
}
