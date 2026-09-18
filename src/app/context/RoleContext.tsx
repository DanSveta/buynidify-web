import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Role = "investor" | "tenant" | "corporate";

type RoleContextValue = {
  /** null = not logged in yet, show the scenario picker */
  role: Role | null;
  /** Who's signed in, for the currently active role. Set at login, editable
   *  on the Profile page, and used for the dashboard greeting and avatar. */
  name: string;
  setName: (name: string) => void;
  /** Every persona's name, keyed by role - so a screen showing "you" as the
   *  other role (a tenant looking at their own investor listing, say) can
   *  name that persona properly instead of an anonymous "you". */
  namesByRole: Record<Role, string>;
  /** Choose a scenario at login. This is the only place the role is set. */
  login: (role: Role, name?: string) => void;
  logout: () => void;
};

const STORAGE_KEY = "buynidify-role";
const NAMES_KEY = "buynidify-names";
// Superseded by NAMES_KEY, which keeps a separate name per persona - this is
// only read once, to carry over whatever a returning browser already has.
const LEGACY_NAME_KEY = "buynidify-name";

// Two named demo personas, not "you" and "the other side" - this is what
// makes a self-dealing loop (your tenant account expressing interest in your
// own investor listing) readable: two different people, not one blank actor.
export const defaultNames: Record<Role, string> = {
  investor: "Alex Morgan",
  tenant: "Sam Carter",
  corporate: "Northgate HR",
};

// Two personas sharing a name defeats the point of naming them at all - it's
// how "your own tenant account" and "your own investor account" end up
// looking like the same person in a self-dealing demo. Browsers that had a
// single shared name before personas were split (or where the same name got
// typed twice for two different roles) can end up in exactly that state, so
// this straightens it out: first role to claim a name keeps it, anyone else
// sharing it falls back to their own default instead.
const ROLE_PRIORITY: Role[] = ["investor", "tenant", "corporate"];

function dedupeNames(names: Record<Role, string>): Record<Role, string> {
  const seen = new Set<string>();
  const result = { ...names };
  for (const role of ROLE_PRIORITY) {
    const value = result[role].trim().toLowerCase();
    if (value && seen.has(value)) {
      result[role] = defaultNames[role];
    } else if (value) {
      seen.add(value);
    }
  }
  return result;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "tenant" || stored === "investor" || stored === "corporate"
      ? stored
      : null;
  });

  const [namesByRole, setNamesByRole] = useState<Record<Role, string>>(() => {
    if (typeof window === "undefined") return { ...defaultNames };
    try {
      const stored = window.localStorage.getItem(NAMES_KEY);
      if (stored) return dedupeNames({ ...defaultNames, ...JSON.parse(stored) });
    } catch {
      // Fall through to the legacy migration below.
    }
    // A returning browser from before personas had separate names: that one
    // name belonged to whichever role was signed in when it was typed.
    const legacyName = window.localStorage.getItem(LEGACY_NAME_KEY);
    const legacyRole = window.localStorage.getItem(STORAGE_KEY) as Role | null;
    if (legacyName && legacyRole && legacyRole in defaultNames) {
      return dedupeNames({ ...defaultNames, [legacyRole]: legacyName });
    }
    return { ...defaultNames };
  });

  useEffect(() => {
    if (role) {
      window.localStorage.setItem(STORAGE_KEY, role);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [role]);

  useEffect(() => {
    window.localStorage.setItem(NAMES_KEY, JSON.stringify(namesByRole));
    try {
      window.localStorage.removeItem(LEGACY_NAME_KEY);
    } catch {
      // Not worth failing over.
    }
  }, [namesByRole]);

  const name = role ? namesByRole[role] : "";

  function setName(next: string) {
    if (!role || !next.trim()) return;
    setNamesByRole((prev) => dedupeNames({ ...prev, [role]: next }));
  }

  function login(next: Role, providedName?: string) {
    setRoleState(next);
    const typed = providedName?.trim();
    if (typed) {
      setNamesByRole((prev) => dedupeNames({ ...prev, [next]: typed }));
    }
    // Untyped: keep whatever that persona is already named (its own saved
    // name, or the stand-in) rather than borrowing another persona's name.
  }

  function logout() {
    setRoleState(null);
  }

  return (
    <RoleContext.Provider value={{ role, name, setName, namesByRole, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
