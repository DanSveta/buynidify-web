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
  /** Choose a scenario at login. This is the only place the role is set. */
  login: (role: Role) => void;
  logout: () => void;
};

const STORAGE_KEY = "buynidify-role";

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "tenant" || stored === "investor" || stored === "corporate"
      ? stored
      : null;
  });

  useEffect(() => {
    if (role) {
      window.localStorage.setItem(STORAGE_KEY, role);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [role]);

  const login = (next: Role) => setRoleState(next);
  const logout = () => setRoleState(null);

  return (
    <RoleContext.Provider value={{ role, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
