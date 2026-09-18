import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useRole } from "./context/RoleContext";
import { useTheme } from "./context/ThemeContext";
import { useListings } from "./context/ListingsContext";
import { useProfile } from "./context/ProfileContext";
import { useFavorites } from "./context/FavoritesContext";
import { resolveSavedProperties } from "./utils/savedProperties";
import PlanModal from "./components/PlanModal";
import { useAuthGate } from "./context/AuthGateContext";
import ThemeDock from "../components/ThemeDock";
import TopBar from "./components/TopBar";

type NavItem = {
  to: string;
  label: string;
  badge?: number;
  /** A quiet heart mark instead of a coloured count - saving something isn't
   *  a notification, it doesn't need to compete for attention the way an
   *  unread message or a match does. */
  heart?: boolean;
  highlight?: boolean;
};

const roleLabel: Record<string, string> = {
  investor: "Investor",
  tenant: "Tenant",
  corporate: "Corporate",
};

// The sidebar is plain, so the brand colour lands on exactly one thing: the
// item you're on. A filled primary pill against neutral text is the strongest
// "you are here" signal available, and it clears 4.5:1 on every palette.
// Relocate is the flagship feature, so it gets the same gold chip treatment
// it has on the marketing site rather than sitting flat among the section
// links. Bright when idle, solid when you're on it.
function highlightClasses(isActive: boolean) {
  return `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    isActive
      ? "bg-brand-gold text-brand-ink shadow-md ring-2 ring-brand-gold/35"
      : "bg-brand-gold/90 text-brand-ink hover:bg-brand-gold"
  }`;
}

function linkClasses(isActive: boolean) {
  return `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive
      ? "bg-brand-blue text-white font-semibold shadow-sm"
      : "text-brand-muted hover:bg-brand-surface hover:text-brand-ink"
  }`;
}

// Settings, Help & Support and the plan card sit at the foot of the sidebar,
// away from the working navigation - the pattern every dashboard uses, because
// they're destinations you go to occasionally rather than things you switch
// between.
//
// The card reads the current plan, so it sells the next step up rather than
// pushing something you already pay for, and it opens the plan chooser in
// place instead of navigating away.
function UpgradeCard({ onOpen }: { onOpen: () => void }) {
  const { profile } = useProfile();

  const copy =
    profile.plan === "vip"
      ? { title: "VIP member", body: "You're on the top plan. Manage it any time.", cta: "Manage plan" }
      : profile.plan === "premium"
        ? {
            title: "Premium member",
            body: "Step up to VIP for a dedicated account manager.",
            cta: "Upgrade to VIP",
          }
        : {
            title: "Upgrade your plan",
            body: "Priority analysis and early access to tenant demand.",
            cta: "See plans",
          };

  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full rounded-xl bg-gradient-to-br from-brand-ink to-brand-blue-dark p-4 text-left ring-1 ring-white/15 transition-shadow hover:shadow-lg"
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
      <p className="mt-3 text-sm font-semibold text-white">{copy.title}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-white/70">{copy.body}</p>
      <span className="mt-3 block rounded-lg bg-brand-cta px-3 py-2 text-center text-xs font-semibold text-brand-cta-text">
        {copy.cta}
      </span>
    </button>
  );
}

export default function AppLayout() {
  const { role, login, logout } = useRole();
  const { dark } = useTheme();
  const { unreadThreadCount, matches, connections, importedProperties, investorListings, tenantDemand } =
    useListings();
  const { favoriteIds } = useFavorites();
  const { total: savedCount } = resolveSavedProperties(favoriteIds, investorListings, tenantDemand);
  const [planOpen, setPlanOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { promptSignUp } = useAuthGate();
  const navigate = useNavigate();
  const location = useLocation();

  // On a phone the sidebar is a drawer over the page, so navigating has to
  // close it, otherwise you tap a link and stare at the menu you just used.
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  // Private demo shortcut: swap between the two customer personas without
  // signing out or moving away from the page currently being reviewed.
  useEffect(() => {
    function switchPersona(event: KeyboardEvent) {
      if (
        event.repeat ||
        event.altKey ||
        !(event.metaKey || event.ctrlKey) ||
        !event.shiftKey ||
        event.key.toLowerCase() !== "x" ||
        (role !== "investor" && role !== "tenant")
      ) {
        return;
      }

      event.preventDefault();
      login(role === "investor" ? "tenant" : "investor");
    }

    window.addEventListener("keydown", switchPersona);
    return () => window.removeEventListener("keydown", switchPersona);
  }, [login, role]);

  // The dashboard belongs to an account. Someone just looking around gets the
  // public search page instead, which is where browsing lives.
  if (!role) {
    return <Navigate to="/search" replace />;
  }

  // The badge is for things that are actually yours to look at: mutual
  // matches, plus anyone waiting on you to answer about your own property.
  // It used to count a static seeded list, which never changed whatever you
  // did in the app.
  const waitingOnYou = connections.filter(
    (c) =>
      !c.accepted &&
      (role === "investor" ? c.by === "tenant" : c.by === "investor") &&
      importedProperties.some((p) => p.id === c.id)
  ).length;
  const matchedCount = matches.length + waitingOnYou;

  // How many deals are still moving - the Deal Tracker had no nav entry at
  // all, so a deal that reached "agreement signed" or further had nowhere
  // obvious to be found again once you left Mutual Matches.
  const dealsInProgress = importedProperties.filter(
    (p) =>
      p.agreement &&
      p.agreement.stage !== "tenancy-active" &&
      (role === "investor" ? p.owner === "investor" : p.agreement.tenantId === "you")
  ).length;

  const primaryNavItems: NavItem[] =
    role === "investor"
      ? [
          { to: "/app/overview", label: "Overview" },
          { to: "/app/search", label: "Search Properties" },
          { to: "/app/my-properties", label: "My Properties" },
          { to: "/app/platform-listings", label: "Platform listings" },
          { to: "/app/shortlist", label: "Shortlist", heart: savedCount > 0 },
          { to: "/app/matches", label: "Mutual Matches", badge: matchedCount },
          { to: "/app/deals", label: "Deal Tracker", badge: dealsInProgress },
          { to: "/app/messages", label: "Messages", badge: unreadThreadCount },
        ]
      : role === "tenant"
        ? [
            { to: "/app/overview", label: "Overview" },
            { to: "/app/search", label: "Find a Home" },
            { to: "/app/my-properties", label: "My Properties" },
            { to: "/app/platform-listings", label: "Platform listings" },
            { to: "/app/shortlist", label: "Saved Homes", heart: savedCount > 0 },
            { to: "/app/matches", label: "Matched!", badge: matchedCount },
            { to: "/app/deals", label: "Deal Tracker", badge: dealsInProgress },
            { to: "/app/messages", label: "Messages", badge: unreadThreadCount },
          ]
        : [{ to: "/app/b2b", label: "Company Dashboard" }];

  const secondaryNavItems: NavItem[] =
    role === "corporate"
      ? [{ to: "/app/platform-listings", label: "Platform listings" }]
      : [{ to: "/app/relocate", label: "Relocate AI", highlight: true }];

  return (
    // data-theme is set here rather than on <html> so dark mode covers the
    // portal (and anything it portals in) without touching the marketing site.
    <div
      data-theme={dark ? "dark" : undefined}
      className="flex min-h-screen bg-brand-page"
    >
      {/* Backdrop for the mobile drawer. */}
      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-brand-border bg-brand-panel px-4 py-6 transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          to="/"
          className="mb-1 flex items-center gap-2 px-2 font-wordmark text-[1.7rem] font-medium leading-none tracking-[0.015em] text-brand-blue"
        >
          Buynidify
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
        </Link>
        <p className="mb-6 px-2 text-xs uppercase tracking-wide text-brand-muted">
          {role ? `${roleLabel[role]} Portal` : "Browsing"}
        </p>

        <nav className="flex flex-col gap-1">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                item.highlight ? highlightClasses(isActive) : linkClasses(isActive)
              }
            >
              <span>{item.label}</span>
              {!!item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-ink">
                  {item.badge}
                </span>
              )}
              {item.heart && (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="h-3.5 w-3.5 flex-shrink-0 fill-current opacity-50"
                >
                  <path d="M12 20.5s-7.5-4.6-7.5-9.8A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 3.3c0 5.2-7.5 9.8-7.5 9.8Z" />
                </svg>
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
              className={({ isActive }) =>
                item.highlight ? highlightClasses(isActive) : linkClasses(isActive)
              }
            >
              <span className="flex items-center gap-1.5">
                {item.highlight && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
                  </svg>
                )}
                {item.label}
              </span>
            </NavLink>
          ))}
          {role && (
            <button
              onClick={() => {
                logout();
                navigate("/app/search");
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-muted transition-colors hover:bg-brand-surface hover:text-brand-ink"
            >
              Sign Out
            </button>
          )}
        </nav>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <nav className="flex flex-col gap-1">
            {role && (
              <NavLink to="/app/profile" className={({ isActive }) => linkClasses(isActive)}>
                <span>Settings</span>
              </NavLink>
            )}
            <NavLink to="/app/support" className={({ isActive }) => linkClasses(isActive)}>
              <span>Help &amp; Support</span>
            </NavLink>
          </nav>

          {role ? (
            <UpgradeCard onOpen={() => setPlanOpen(true)} />
          ) : (
            <button
              type="button"
              onClick={promptSignUp}
              className="block w-full rounded-xl bg-gradient-to-br from-brand-ink to-brand-blue-dark p-4 text-left ring-1 ring-white/15 transition-shadow hover:shadow-lg"
            >
              <p className="text-sm font-semibold text-white">Join Buynidify</p>
              <p className="mt-0.5 text-[11px] leading-snug text-white/70">
                Free to browse. An account is only needed to publish or register interest.
              </p>
              <span className="mt-3 block rounded-lg bg-brand-cta px-3 py-2 text-center text-xs font-semibold text-brand-cta-text">
                Create account
              </span>
            </button>
          )}

          <Link
            to="/"
            className="px-2 text-xs text-brand-muted transition-colors hover:text-brand-ink"
          >
            ← Back to marketing site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setNavOpen(true)} />
        {/* Wide enough to use a laptop screen properly, capped so text lines
            don't run away on an ultrawide monitor. */}
        <main className="min-w-0 flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-7">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>

      {planOpen && <PlanModal onClose={() => setPlanOpen(false)} />}

      <ThemeDock />
    </div>
  );
}
