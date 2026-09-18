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
  /** Who's signed in. Set at login, editable on the Profile page, and used
   *  for the dashboard greeting and the avatar. */
  name: string;
  setName: (name: string) => void;
  /** Choose a scenario at login. This is the only place the role is set. */
  login: (role: Role, name?: string) => void;
  logout: () => void;
};

const STORAGE_KEY = "buynidify-role";
const NAME_KEY = "buynidify-name";

const defaultNames: Record<Role, string> = {
  investor: "Alex Morgan",
  tenant: "Sam Carter",
  corporate: "Northgate HR",
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "tenant" || stored === "investor" || stored === "corporate"
      ? stored
      : null;
  });

  const [name, setNameState] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const stored = window.localStorage.getItem(NAME_KEY);
    if (stored) return stored;
    // Already signed in from a session before names existed - give them the
    // stand-in for their role rather than an empty greeting.
    const storedRole = window.localStorage.getItem(STORAGE_KEY) as Role | null;
    return storedRole && defaultNames[storedRole] ? defaultNames[storedRole] : "";
  });

  useEffect(() => {
    if (role) {
      window.localStorage.setItem(STORAGE_KEY, role);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [role]);

  useEffect(() => {
    if (name) window.localStorage.setItem(NAME_KEY, name);
  }, [name]);

  function setName(next: string) {
    setNameState(next);
  }

  function login(next: Role, providedName?: string) {
    setRoleState(next);
    const typed = providedName?.trim();
    // Only fall back to a stand-in name when nothing was typed and nothing
    // was kept from a previous session - so the greeting is never blank.
    setNameState(typed || name || defaultNames[next]);
  }

  function logout() {
    setRoleState(null);
    // The name is deliberately kept: signing back in as a different role
    // shouldn't make you re-introduce yourself.
  }

  return (
    <RoleContext.Provider value={{ role, name, setName, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
