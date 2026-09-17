import { useEffect, useState } from "react";

// useState that survives reloads and role switches by mirroring into
// localStorage. The demo depends on this: an investor adds a property, signs
// out, signs back in as a tenant, and the property is still there to be
// found - which only works if the state outlives the React tree.
//
// Sets don't survive JSON, so anything stored here is kept as a plain array
// or object.
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      // Corrupt or unreadable entry - fall back rather than crash the app.
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked (private browsing). The demo still works for
      // this session, it just won't persist.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
