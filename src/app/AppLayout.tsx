import { NavLink, Outlet, Link, Navigate, useNavigate } from "react-router-dom";
import { useRole } from "./context/RoleContext";
import { useTheme } from "./context/ThemeContext";
import { deals } from "./data/mockData";
import ThemeDock from "../components/ThemeDock";
import TopBar from "./components/TopBar";

type NavItem = { to: string; label: string; badge?: number };

const roleLabel: Record<string, string> = {
  investor: "Investor",
  tenant: "Tenant",
  corporate: "Corporate",
};

// The sidebar is a solid brand-primary panel, so nav items are light-on-color.
// Active state flips to a white pill with primary-coloured text - that pairing
// clears 4.5:1 on every palette, and it reads as "you are here" much faster
// than a slightly-lighter tint would.
function linkClasses(isActive: boolean) {
  return `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive
      ? "bg-white text-brand-blue font-semibold shadow-sm"
      : "text-white/75 hover:bg-white/10 hover:text-white"
  }`;
}

// Settings, Help & Support and the upgrade prompt sit at the foot of the
// sidebar, away from the working navigation - the pattern every dashboard
// uses, because they're destinations you go to occasionally rather than
// things you switch between.
function UpgradeCard() {
  return (
    <Link
      to="/app/premium"
      className="block rounded-xl bg-gradient-to-br from-brand-ink to-brand-blue-dark p-4 ring-1 ring-white/15 transition-shadow hover:shadow-lg"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-white"
        >
          <path d="M6 4h12v4a6 6 0 0 1-12 0V4Z" />
          <path d="M6 6H4a2 2 0 0 0 2 4M18 6h2a2 2 0 0 1-2 4" />
          <path d="M12 14v3M9 20h6" />
        </svg>
      </span>
      <p className="mt-3 text-sm font-semibold text-white">Upgrade to Premium</p>
      <p className="mt-0.5 text-[11px] leading-snug text-white/70">
        Unlock priority matching and the full set of benefits.
      </p>
      <span className="mt-3 block rounded-lg bg-brand-cta px-3 py-2 text-center text-xs font-semibold text-brand-cta-text">
        Upgrade premium
      </span>
    </Link>
  );
}

export default function AppLayout() {
  const { role, logout } = useRole();
  const { dark } = useTheme();
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
          { to: "/app/messages", label: "Messages" },
        ]
      : role === "tenant"
        ? [
            { to: "/app/overview", label: "Overview" },
            { to: "/app/my-properties", label: "My Properties" },
            { to: "/app/search", label: "Find a Home" },
            { to: "/app/shortlist", label: "Saved Homes" },
            { to: "/app/matches", label: "Matched!", badge: matchedCount },
            { to: "/app/local-services", label: "Local Services" },
            { to: "/app/messages", label: "Messages" },
          ]
        : [{ to: "/app/b2b", label: "Company Dashboard" }];

  const secondaryNavItems: NavItem[] =
    role === "corporate"
      ? [{ to: "/app/platform-listings", label: "Platform listings" }]
      : [
          { to: "/app/verification", label: "Verification" },
          { to: "/app/platform-listings", label: "Platform listings" },
          { to: "/app/pricing", label: "Pricing" },
          { to: "/app/relocate", label: "Relocate AI" },
        ];

  return (
    // data-theme is set here rather than on <html> so dark mode covers the
    // portal (and anything it portals in) without touching the marketing site.
    <div
      data-theme={dark ? "dark" : undefined}
      className="flex min-h-screen bg-brand-page"
    >
      <aside className="sidebar-panel sticky top-0 flex h-screen w-64 flex-shrink-0 flex-col overflow-y-auto bg-brand-blue px-4 py-6">
        <Link
          to="/"
          className="mb-1 flex items-center gap-2 px-2 font-wordmark text-[1.7rem] font-medium leading-none tracking-[0.015em] text-white"
        >
          Buynidify
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
        </Link>
        <p className="mb-6 px-2 text-xs uppercase tracking-wide text-white/55">
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

        <div className="my-4 border-t border-white/15" />

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
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          >
            Sign Out
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <nav className="flex flex-col gap-1">
            <NavLink to="/app/profile" className={({ isActive }) => linkClasses(isActive)}>
              <span>Settings</span>
            </NavLink>
            <NavLink to="/app/support" className={({ isActive }) => linkClasses(isActive)}>
              <span>Help &amp; Support</span>
            </NavLink>
          </nav>

          <UpgradeCard />

          <Link
            to="/"
            className="px-2 text-xs text-white/60 transition-colors hover:text-white"
          >
            ← Back to marketing site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1 px-8 pb-12 pt-7">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>

      <ThemeDock />
    </div>
  );
}
