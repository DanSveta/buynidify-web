import { NavLink, Outlet, Link, Navigate, useNavigate } from "react-router-dom";
import { useRole } from "./context/RoleContext";
import { deals } from "./data/mockData";

type NavItem = { to: string; label: string; badge?: number };

const roleLabel: Record<string, string> = {
  investor: "Investor",
  tenant: "Tenant",
  corporate: "Corporate",
};

function linkClasses(isActive: boolean) {
  return `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive
      ? "bg-brand-blue text-white font-semibold"
      : "text-brand-muted hover:bg-brand-surface hover:text-brand-ink"
  }`;
}

export default function AppLayout() {
  const { role, logout } = useRole();
  const navigate = useNavigate();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  const matchedCount = deals.filter((d) => d.stage === "matched").length;

  const primaryNavItems: NavItem[] =
    role === "investor"
      ? [
          { to: "/app/overview", label: "Overview" },
          { to: "/app/my-properties", label: "My Properties" },
          { to: "/app/search", label: "Search Properties" },
          { to: "/app/shortlist", label: "Shortlist" },
          { to: "/app/matches", label: "Mutual Matches", badge: matchedCount },
          { to: "/app/local-services", label: "Local Services" },
        ]
      : role === "tenant"
        ? [
            { to: "/app/overview", label: "Overview" },
            { to: "/app/my-properties", label: "My Properties" },
            { to: "/app/search", label: "Find a Home" },
            { to: "/app/shortlist", label: "Saved Homes" },
            { to: "/app/matches", label: "Matched!", badge: matchedCount },
            { to: "/app/local-services", label: "Local Services" },
          ]
        : [{ to: "/app/b2b", label: "Company Dashboard" }];

  const secondaryNavItems: NavItem[] =
    role === "corporate"
      ? [{ to: "/app/profile", label: "Profile" }]
      : [
          { to: "/app/profile", label: "Profile" },
          { to: "/app/verification", label: "Verification" },
          { to: "/app/platform-listings", label: "Platform listings" },
          { to: "/app/pricing", label: "Pricing" },
          { to: "/app/relocate", label: "Relocate AI" },
        ];

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="sticky top-0 flex h-screen w-64 flex-shrink-0 flex-col border-r border-brand-border bg-brand-surface px-4 py-6">
        <Link to="/" className="mb-1 px-2 font-display text-xl font-semibold tracking-tight text-brand-blue">
          Buynidify
        </Link>
        <p className="mb-6 px-2 text-xs text-brand-muted">
          {roleLabel[role]} Portal
        </p>

        <nav className="flex flex-col gap-1">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => linkClasses(isActive)}
            >
              <span>{item.label}</span>
              {!!item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-ink">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="my-4 border-t border-brand-border" />

        <nav className="flex flex-col gap-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => linkClasses(isActive)}
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-muted transition-colors hover:bg-brand-surface hover:text-brand-ink"
          >
            Sign Out
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <div className="rounded-xl border border-brand-border bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
              Logged in as
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-ink">
              {roleLabel[role]}
            </p>
          </div>
          <Link
            to="/"
            className="px-2 text-xs text-brand-muted hover:text-brand-blue"
          >
            ← Back to marketing site
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-8 py-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
