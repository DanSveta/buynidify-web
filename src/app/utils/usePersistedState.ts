import { useEffect, useRef, useState } from "react";

// useState that survives reloads and role switches by mirroring into
// localStorage. The demo depends on this: an investor adds a property, signs
// out, signs back in as a tenant, and the property is still there to be
// found - which only works if the state outlives the React tree.
//
// It also syncs LIVE across browser tabs on the same key: when one tab
// writes, every other open tab picks up the change via the native
// "storage" event (which only ever fires in the *other* tabs, never the one
// that wrote). That's what makes testing two personas side by side work -
// send a message as the investor in one tab, and it shows up in the tenant
// tab without a reload, because both tabs are watching the same
// "buynidify:threads" key.
//
// Sets don't survive JSON, so anything stored here is kept as a plain array
// or object.
function readFromStorage<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  } catch {
    // Corrupt or unreadable entry - fall back rather than crash the app.
    return initial;
  }
}

export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readFromStorage(key, initial));

  // If the key itself changes (e.g. a per-role storage key, once the role
  // becomes known after the first render, or a role switch), re-read from
  // that new key instead of carrying over whatever was loaded under the old
  // one.
  const prevKey = useRef(key);
  // The persist-write effect below runs in the SAME commit as this one,
  // right after it, and by then `value` still holds the OLD key's data (the
  // setValue call here only takes effect on the next render) - so without
  // this flag, that effect would immediately write the old key's stale
  // value into the new key, clobbering whatever was really stored there
  // (e.g. the investor persona's profile getting overwritten with the
  // tenant persona's, the moment you switch roles). This is exactly the bug
  // behind "switching roles doesn't change the profile/photo" - once that
  // wrong write lands, the corrupted value IS what's on disk from then on,
  // there's nothing left to self-correct back to.
  const skipNextPersist = useRef(false);
  useEffect(() => {
    if (prevKey.current !== key) {
      prevKey.current = key;
      skipNextPersist.current = true;
      setValue(readFromStorage(key, initial));
    }
    // Deliberately not depending on `initial` - it's usually a fresh object
    // literal every render, and re-running this for that alone would defeat
    // the point (it would look like the key "changed" every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked (private browsing). The demo still works for
      // this session, it just won't persist.
    }
  }, [key, value]);

  // Cross-tab sync: another tab wrote to this same key.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== key) return;
      if (e.newValue == null) {
        setValue(initial);
        return;
      }
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {
        // Ignore a malformed write from elsewhere rather than crash.
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue] as const;
}
