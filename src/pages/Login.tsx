import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRole, type Role } from "../app/context/RoleContext";
import {
  CorporateIcon,
  InvestorIcon,
  TenantIcon,
} from "../components/icons";

const scenarios: {
  role: Role;
  title: string;
  description: string;
  destination: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    role: "investor",
    title: "Investor",
    description:
      "AI yield analysis, portfolio matching, and pre-vetted tenants.",
    destination: "/app/overview",
    icon: InvestorIcon,
  },
  {
    role: "tenant",
    title: "Tenant",
    description:
      "Find your home. Smart search, affordability, and a transparent journey.",
    destination: "/app/overview",
    icon: TenantIcon,
  },
  {
    role: "corporate",
    title: "Corporate",
    description: "Employee relocation, bulk housing, and HR reporting.",
    destination: "/app/b2b",
    icon: CorporateIcon,
  },
];

export default function Login() {
  const { login, name: savedName } = useRole();
  const navigate = useNavigate();
  const [name, setName] = useState(savedName);

  function handleSelect(role: Role, destination: string) {
    // An empty name is fine - RoleContext falls back to a stand-in so the
    // dashboard greeting is never blank.
    login(role, name);
    navigate(destination);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface px-6 py-16">
      <div className="w-full max-w-3xl">
        <div className="mb-10 text-center">
          <Link
            to="/"
            className="font-wordmark text-[2.1rem] font-medium leading-none tracking-[0.015em] text-brand-blue"
          >
            Buynidify
          </Link>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-brand-ink">
            How are you using Buynidify?
          </h1>
          <p className="mt-2 text-brand-muted">
            Choose how you'd like to sign in. You can log out and pick a different one any time.
          </p>
          <p className="mt-3 text-sm text-brand-muted">
            Just looking?{" "}
            <Link to="/app/search" className="font-semibold text-brand-blue hover:underline">
              Browse without an account →
            </Link>
          </p>
        </div>

        <div className="mx-auto mb-8 max-w-sm">
          <label className="block text-xs font-semibold text-brand-muted">
            Your name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Andrew"
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
            />
          </label>
          <p className="mt-1.5 text-center text-[11px] text-brand-muted">
            Used to greet you in the portal. Optional.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {scenarios.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.role}
                onClick={() => handleSelect(s.role, s.destination)}
                className="group flex flex-col items-start rounded-2xl border border-brand-border bg-white p-6 text-left transition-colors hover:border-brand-blue hover:shadow-md"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-white transition-colors group-hover:bg-brand-blue-dark">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="font-display text-lg font-semibold tracking-tight text-brand-ink">
                  {s.title}
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  {s.description}
                </p>
                <span className="mt-4 text-sm font-semibold text-brand-blue">
                  Continue as {s.title} →
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-brand-muted">
          This is a demo login, no real account or password required.
        </p>
      </div>
    </div>
  );
}
