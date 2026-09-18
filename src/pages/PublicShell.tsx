import { Link } from "react-router-dom";
import { useRole } from "../app/context/RoleContext";
import { useAuthGate } from "../app/context/AuthGateContext";
import { useListings } from "../app/context/ListingsContext";
import { initialsOf } from "../app/utils/greeting";

// The public chrome: a plain site header and footer, no dashboard.
//
// This is the Airbnb split. Searching and browsing listings happen out here,
// open to everyone. The portal (sidebar, overview, my properties, messages)
// is for people signed in and looking at their own account.

export default function PublicShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: "search" | "listings" | "my-properties";
}) {
  const { role, name } = useRole();
  const { promptSignUp } = useAuthGate();
  const { importedProperties } = useListings();
  // Only worth a nav slot once you have something in there.
  const addedCount = importedProperties.filter((p) => p.owner === "guest").length;

  return (
    <div className="min-h-screen bg-brand-page">
      {/* Site header, not a portal shell. */}
      <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-panel">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-5 py-3 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 font-wordmark text-[1.8rem] font-medium leading-none tracking-[0.015em] text-brand-blue"
          >
            Buynidify
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
          </Link>

          <nav className="ml-6 hidden items-center gap-6 md:flex">
            <Link
              to="/search"
              className={
                active === "search"
                  ? "text-sm font-semibold text-brand-ink"
                  : "text-sm text-brand-muted transition-colors hover:text-brand-ink"
              }
            >
              Search
            </Link>
            <Link
              to="/listings"
              className={
                active === "listings"
                  ? "text-sm font-semibold text-brand-ink"
                  : "text-sm text-brand-muted transition-colors hover:text-brand-ink"
              }
            >
              Platform listings
            </Link>
            {addedCount > 0 && !role && (
              <Link
                to="/my-properties"
                className={
                  active === "my-properties"
                    ? "flex items-center gap-1.5 text-sm font-semibold text-brand-ink"
                    : "flex items-center gap-1.5 text-sm text-brand-muted transition-colors hover:text-brand-ink"
                }
              >
                My properties
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-ink">
                  {addedCount}
                </span>
              </Link>
            )}
            <Link
              to="/#relocate"
              className="text-sm text-brand-muted transition-colors hover:text-brand-ink"
            >
              Relocate AI
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {role ? (
              <Link
                to="/app/overview"
                className="flex items-center gap-2 rounded-full border border-brand-border py-1.5 pl-3 pr-1.5 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue"
              >
                <span className="hidden sm:inline">My account</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
                  {initialsOf(name || "You")}
                </span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-surface sm:block"
                >
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={promptSignUp}
                  className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 sm:px-8">
        {children}
      </main>

      <footer className="border-t border-brand-border bg-brand-panel py-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 text-xs text-brand-muted sm:px-8">
          <p>
            Buynidify references properties advertised for sale on UK portals. Free to search, an
            account is only needed to publish or register interest.
          </p>
          <Link to="/" className="font-semibold text-brand-blue hover:underline">
            Back to home →
          </Link>
        </div>
      </footer>
    </div>
  );
}
