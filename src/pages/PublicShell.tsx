import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRole } from "../app/context/RoleContext";
import { useAuthGate } from "../app/context/AuthGateContext";
import { useListings } from "../app/context/ListingsContext";
import { initialsOf } from "../app/utils/greeting";
import { avatarFor } from "../app/utils/avatars";
import Avatar from "../app/components/Avatar";
import LocationCombobox from "../components/LocationCombobox";
import { ukCities } from "../lib/content";
import { portalPropertyTypeOptions, type PortalPropertyType } from "../lib/propertyTypes";

// The public chrome: a plain site header and footer, no dashboard.
//
// This is the Airbnb split. Searching and browsing listings happen out here,
// open to everyone. The portal (sidebar, overview, my properties, messages)
// is for people signed in and looking at their own account.

const bedroomOptions = ["Any", "1", "2", "3", "4+"];

/** The compact Airbnb-style pill: three segments (Where / Beds / Type) and a
 *  round search button, dropped into the header only on a property's own
 *  page - the one place you're deep in a listing with no other way to start
 *  a fresh search without leaving. Submits straight to /search with the
 *  same query params that page already reads. */
function HeaderSearchPill() {
  const { role } = useRole();
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [beds, setBeds] = useState("Any");
  const [type, setType] = useState<PortalPropertyType>("Any");

  function submit() {
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (beds !== "Any") params.set("beds", beds);
    if (type !== "Any") params.set("type", type);
    const query = params.toString();
    navigate(`${role ? "/app/search" : "/search"}${query ? `?${query}` : ""}`);
  }

  return (
    <div className="hidden flex-1 items-center justify-center lg:flex">
      <div className="flex w-full max-w-xl items-center rounded-full border border-brand-border bg-white shadow-sm">
        <div className="min-w-0 flex-1 px-5 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">Where</p>
          <LocationCombobox
            options={ukCities}
            value={location}
            onChange={setLocation}
            placeholder="Anywhere"
          />
        </div>
        <span className="h-7 w-px flex-shrink-0 bg-brand-border" />
        <div className="min-w-0 flex-shrink-0 px-5 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">Beds</p>
          <select
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            className="w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent p-0 text-sm font-semibold text-brand-ink outline-none"
          >
            {bedroomOptions.map((b) => (
              <option key={b} value={b}>
                {b === "Any" ? "Any beds" : b}
              </option>
            ))}
          </select>
        </div>
        <span className="h-7 w-px flex-shrink-0 bg-brand-border" />
        <div className="min-w-0 flex-shrink-0 px-5 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">Type</p>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PortalPropertyType)}
            className="w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent p-0 text-sm font-semibold text-brand-ink outline-none"
          >
            {portalPropertyTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={submit}
          aria-label="Search"
          className="m-1.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-white transition-colors hover:bg-brand-blue-dark"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function PublicShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: "search" | "listings" | "my-properties" | "partners" | "about" | "property" | "corporate";
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

          {active === "property" ? (
            <HeaderSearchPill />
          ) : (
            <nav className="ml-6 hidden items-center gap-6 md:flex">
              {/* Search and Platform listings used to be two separate nav
                  links to two pages doing almost the same job. Now one page
                  (Search) covers both, so there's one link. */}
              <Link
                to="/search"
                className={
                  active === "search" || active === "listings"
                    ? "text-sm font-semibold text-brand-ink"
                    : "text-sm text-brand-muted transition-colors hover:text-brand-ink"
                }
              >
                Search
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
              {/* Everywhere except the landing page itself, "Relocate AI"
                  should go straight to the product, not to a hash anchor on
                  a section that only exists on "/" - that's the bug Andrew
                  hit on Platform listings (the button "didn't work"): the
                  hash never resolves once you're already on another page. */}
              <Link
                to="/relocate-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-muted transition-colors hover:text-brand-ink"
              >
                Relocate AI
              </Link>
              <Link
                to="/partners"
                className={
                  active === "partners"
                    ? "text-sm font-semibold text-brand-ink"
                    : "text-sm text-brand-muted transition-colors hover:text-brand-ink"
                }
              >
                Partners
              </Link>
              <Link
                to="/corporate"
                className={
                  active === "corporate"
                    ? "text-sm font-semibold text-brand-ink"
                    : "text-sm text-brand-muted transition-colors hover:text-brand-ink"
                }
              >
                For companies
              </Link>
              <Link
                to="/about"
                className={
                  active === "about"
                    ? "text-sm font-semibold text-brand-ink"
                    : "text-sm text-brand-muted transition-colors hover:text-brand-ink"
                }
              >
                About us
              </Link>
            </nav>
          )}

          <div className="ml-auto flex items-center gap-2">
            {role ? (
              <Link
                to="/app/overview"
                className="flex items-center gap-2 rounded-full border border-brand-border py-1.5 pl-3 pr-1.5 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue"
              >
                <span className="hidden sm:inline">My account</span>
                <Avatar name={name || "You"} initials={initialsOf(name || "You")} photoUrl={avatarFor(name || "You")} size="sm" />
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
