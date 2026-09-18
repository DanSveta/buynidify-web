import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useRole, type Role } from "./RoleContext";
import { useListings } from "./ListingsContext";

// Browsing is open to everyone. Searching, pasting a link, running the AI
// analysis, reading listings and looking at profiles need no account at all.
//
// An account is only required at the moment you do something that affects
// somebody else: publishing to the marketplace, registering interest,
// connecting, messaging, or asking to proceed with a deal.
//
// requireAccount() is how a component asks for that: if you're signed in it
// just runs the action, and if you aren't it opens the sign-up panel and runs
// the action for you once you're in. Nothing is lost by not being registered
// yet, which is the whole point.

type Gate = {
  title: string;
  message: string;
  action: () => void;
};

type AuthGateValue = {
  /** Runs `action` now if signed in, otherwise asks the person to join first. */
  requireAccount: (gate: Gate) => void;
  /** Open the sign-up panel with no pending action. */
  promptSignUp: () => void;
};

const AuthGateContext = createContext<AuthGateValue | null>(null);

const roleChoices: { id: Role; label: string; description: string }[] = [
  {
    id: "investor",
    label: "I invest",
    description: "Test tenant demand before you buy, then publish your terms.",
  },
  {
    id: "tenant",
    label: "I'm renting",
    description: "Ask an investor to buy a home you found for sale.",
  },
  {
    id: "corporate",
    label: "Company",
    description: "Relocate and house employees.",
  },
];

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { role, login } = useRole();
  const { claimGuestProperties } = useListings();
  const [gate, setGate] = useState<Gate | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const requireAccount = useCallback(
    (next: Gate) => {
      if (role) {
        next.action();
        return;
      }
      setGate(next);
    },
    [role]
  );

  const promptSignUp = useCallback(() => {
    setGate({
      title: "Join Buynidify",
      message:
        "Create an account to publish properties, register interest and talk to the other side.",
      action: () => {},
    });
  }, []);

  function join(chosen: Role) {
    login(chosen, name);
    // Anything analysed while browsing comes with you.
    if (chosen !== "corporate") claimGuestProperties(chosen);
    const pending = gate?.action;
    setGate(null);
    setName("");
    setEmail("");
    pending?.();
  }

  return (
    <AuthGateContext.Provider value={{ requireAccount, promptSignUp }}>
      {children}

      {gate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-brand-border bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-brand-border p-6">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
                  {gate.title}
                </h2>
                <p className="mt-1 text-sm text-brand-muted">{gate.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setGate(null)}
                aria-label="Close"
                className="text-brand-muted hover:text-brand-ink"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                    Your name
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Andrew"
                    className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                    Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
                  />
                </label>
              </div>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                How will you use Buynidify?
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {roleChoices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => join(choice.id)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-brand-border p-4 text-left transition-colors hover:border-brand-blue hover:bg-brand-surface"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-brand-ink">
                        {choice.label}
                      </span>
                      <span className="block text-xs text-brand-muted">{choice.description}</span>
                    </span>
                    <span className="flex-shrink-0 text-brand-blue">→</span>
                  </button>
                ))}
              </div>

              <p className="mt-5 rounded-lg bg-brand-surface p-3 text-xs text-brand-muted">
                Verification comes next: identity, and proof of funds or referencing depending on
                your side. Nothing you've already analysed is lost, it moves into your account.
              </p>
            </div>
          </div>
        </div>
      )}
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error("useAuthGate must be used within an AuthGateProvider");
  return ctx;
}
