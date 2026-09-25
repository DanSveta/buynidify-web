import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useRole, type Role } from "./RoleContext";
import { useListings } from "./ListingsContext";
import { CorporateIcon, InvestorIcon, TenantIcon } from "../../components/icons";

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
  /** Open the sign-in panel as a pop-up over whatever page you're on,
   *  instead of navigating to a separate scrolly page - what "Start as
   *  investor/tenant" on Choose Your Journey opens. `role`, if given,
   *  is which demo account is offered first. */
  promptLogin: (role?: Role) => void;
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

const demoAccounts: {
  role: Role;
  label: string;
  email: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}[] = [
  { role: "investor", label: "Investor", email: "investor@demo.com", icon: InvestorIcon, iconBg: "bg-brand-blue", iconColor: "text-white" },
  { role: "tenant", label: "Tenant", email: "tenant@demo.com", icon: TenantIcon, iconBg: "bg-brand-gold", iconColor: "text-brand-ink" },
  { role: "corporate", label: "Corporate", email: "corporate@demo.com", icon: CorporateIcon, iconBg: "bg-emerald-600", iconColor: "text-white" },
];

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { role, login } = useRole();
  const { claimGuestProperties } = useListings();
  const navigate = useNavigate();
  const [gate, setGate] = useState<Gate | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // null = closed. Doubles as which demo account to lead with, so "Start as
  // investor" on Choose Your Journey opens the panel already leaning
  // investor rather than a neutral form.
  const [loginOpen, setLoginOpen] = useState<Role | "any" | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const promptLogin = useCallback((forRole?: Role) => {
    setLoginOpen(forRole ?? "any");
  }, []);

  function enterAs(chosenRole: Role) {
    if (chosenRole === "corporate") {
      setLoginOpen(null);
      navigate("/corporate");
      return;
    }
    login(chosenRole);
    setLoginOpen(null);
    navigate("/app/overview");
  }

  function submitSignIn(e: React.FormEvent) {
    e.preventDefault();
    // Nothing to check a password against - this is a demo. Signing in
    // lands you as whichever role the panel was opened for, or investor by
    // default, so the button does something real rather than nothing.
    enterAs(loginOpen === "tenant" || loginOpen === "corporate" ? loginOpen : "investor");
  }

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
    <AuthGateContext.Provider value={{ requireAccount, promptSignUp, promptLogin }}>
      {children}

      {loginOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setLoginOpen(null)}
        >
          {/* A pop-up over whatever page you were on, not a separate page
              you navigate to and then have to scroll - per Véta, "whatever
              is below will stay, and that will be on top". */}
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-brand-border bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full flex-shrink-0 bg-gradient-to-r from-brand-blue via-brand-blue to-brand-gold" />
            <div className="p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
                    Welcome back
                  </h2>
                  <p className="mt-1 text-sm text-brand-muted">Sign in to your Buynidify account</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLoginOpen(null)}
                  aria-label="Close"
                  className="flex-shrink-0 text-brand-muted hover:text-brand-ink"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={submitSignIn} className="mt-6 flex flex-col gap-4">
                <label className="block text-sm font-medium text-brand-ink">
                  Email address
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
                  />
                </label>
                <label className="block text-sm font-medium text-brand-ink">
                  Password
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-1 rounded-xl bg-gradient-to-r from-brand-blue to-brand-blue-dark py-3 text-sm font-semibold text-white shadow-md shadow-brand-blue/25 transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Sign in
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-brand-border bg-brand-surface p-4">
                <p className="mb-2.5 text-sm font-semibold text-brand-blue">Demo accounts</p>
                <div className="flex flex-col gap-1.5">
                  {demoAccounts.map((d) => {
                    const DemoIcon = d.icon;
                    const isLeading = loginOpen === d.role;
                    return (
                      <button
                        key={d.role}
                        type="button"
                        onClick={() => enterAs(d.role)}
                        className={`flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                          isLeading ? "ring-2 ring-brand-blue" : ""
                        }`}
                      >
                        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${d.iconBg} ${d.iconColor}`}>
                          <DemoIcon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-brand-ink">{d.label}</span>
                          <span className="block truncate text-xs text-brand-muted">{d.email}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-brand-muted">
                No account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setLoginOpen(null);
                    promptSignUp();
                  }}
                  className="font-semibold text-brand-blue hover:underline"
                >
                  Create one free
                </button>
              </p>
              <p className="mt-3 text-center text-xs text-brand-muted">
                This is a demo - Sign in doesn't check a real password. Use a Demo account above for
                the fastest way in.
              </p>
            </div>
          </div>
        </div>
      )}

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
