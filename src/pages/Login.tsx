import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRole, type Role } from "../app/context/RoleContext";
import { CorporateIcon, InvestorIcon, TenantIcon } from "../components/icons";

// Redesigned to look like an ordinary email/password sign-in page - the
// previous version was three big "pick your persona" cards with no sign-in
// form at all, which read as obviously fake rather than a demo standing in
// for a real product. The form above still isn't wired to a real backend
// (there's nothing to check a password against), but it looks and behaves
// like one: type anything, hit Sign in, land in the portal. The "Demo
// accounts" panel below is the actual fast path for testing, same as
// before, just relabelled to look like the quick-fill shortcuts a real demo
// environment would offer.

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

export default function Login() {
  const { login } = useRole();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function enterAs(role: Role) {
    if (role === "corporate") {
      // Corporate doesn't sign in to a dashboard - it's a real service page
      // ending in "talk to us", not a fake logged-in product.
      navigate("/corporate");
      return;
    }
    login(role);
    navigate("/app/overview");
  }

  function submitSignIn(e: React.FormEvent) {
    e.preventDefault();
    // Nothing to check a password against - this is a demo. Signing in
    // lands you as an investor (the more common of the two real portals)
    // so the button does something real rather than nothing.
    enterAs("investor");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-surface px-6 py-16">
      <Link
        to="/"
        className="mb-8 font-wordmark text-[2.1rem] font-medium leading-none tracking-[0.015em] text-brand-blue"
      >
        Buynidify
      </Link>

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-brand-border bg-white shadow-xl shadow-brand-ink/5">
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-blue via-brand-blue to-brand-gold" />
        <div className="p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-brand-muted">Sign in to your Buynidify account</p>

        <form onSubmit={submitSignIn} className="mt-6 flex flex-col gap-4">
          <label className="block text-sm font-medium text-brand-ink">
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
            />
          </label>
          <label className="block text-sm font-medium text-brand-ink">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              return (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => enterAs(d.role)}
                  className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
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
          <Link to="/signup" className="font-semibold text-brand-blue hover:underline">
            Create one free
          </Link>
        </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-brand-muted">
        Just looking?{" "}
        <Link to="/search" className="font-semibold text-brand-blue hover:underline">
          Browse without an account →
        </Link>
      </p>
      <p className="mt-3 max-w-md text-center text-xs text-brand-muted">
        This is a demo - Sign in and Create account don't check a real password. Use a Demo account
        above for the fastest way in.
      </p>
    </div>
  );
}
