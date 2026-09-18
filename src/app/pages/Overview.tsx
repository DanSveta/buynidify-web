import { Link } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { deals, properties } from "../data/mockData";
import { useListings } from "../context/ListingsContext";
import PropertyCard from "../components/PropertyCard";
import ListingCard from "../components/ListingCard";
import DashboardGreeting from "../components/DashboardGreeting";

export default function Overview() {
  const { role } = useRole();
  const { investorListings, tenantDemand: demandEntries, matches, interestedTenantsFor } = useListings();

  if (role === "investor") {
    const owned = investorListings;
    const matched = deals.filter((d) => d.stage === "matched").length + matches.length;
    const demandCount = demandEntries.length;

    return (
      <div>
        <DashboardGreeting
          subtitle={`${owned.length} properties in your portfolio · ${demandCount} live tenant-demand signals`}
          action={
            <Link
              to="/app/search"
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              Find properties
            </Link>
          }
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-brand-border bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Portfolio value
            </p>
            <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-brand-ink">
              £{owned.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-brand-border bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Mutual matches
            </p>
            <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-brand-ink">{matched}</p>
          </div>
          <div className="rounded-2xl border border-brand-border bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Tenant demand waiting
            </p>
            <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-brand-ink">{demandCount}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-ink">
              Search real UK listings
            </p>
            <p className="text-xs text-brand-muted">
              Opens live results on Rightmove, Zoopla &amp; OnTheMarket
            </p>
          </div>
          <Link
            to="/app/search"
            className="flex-shrink-0 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Search Properties
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-brand-ink">
            Your listed properties
          </h2>
          <Link to="/app/my-properties" className="text-xs font-semibold text-brand-blue hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {owned.slice(0, 3).map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              variant="investor"
              interestedTenants={interestedTenantsFor(listing.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Tenant overview
  const affordabilityLimit = 2100;
  const homesForYou = properties.slice(0, 3);

  return (
    <div>
      <DashboardGreeting
        subtitle="Find your next home with AI-powered matching, no jargon, no stress."
        action={
          <Link
            to="/app/search"
            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Search homes
          </Link>
        }
      />

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-ink">
            Properties listed by investors are waiting for you
          </p>
          <p className="text-xs text-brand-muted">
            Browse real listings, express interest, and let Buynidify coordinate the rest.
          </p>
        </div>
        <Link
          to="/app/search"
          className="flex-shrink-0 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
        >
          Browse listings
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
            Your search at a glance
          </h2>
          <p className="mt-1 max-w-md text-sm text-brand-muted">
            What you can afford, what's verified, and what still needs your attention.
          </p>
        </div>
        <div className="flex-shrink-0 rounded-xl border border-brand-border bg-brand-surface p-4 text-center sm:text-right">
          <p className="text-xs text-brand-muted">Your affordability limit</p>
          <p className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
            £{affordabilityLimit.toLocaleString()}/mo
          </p>
          <p className="text-[11px] text-brand-muted">Based on verified income</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Identity", "Verified"],
          ["Right to Rent", "Verified"],
          ["Affordability", "Pending"],
          ["References", "Needs Review"],
        ].map(([label, status]) => (
          <div key={label} className="rounded-xl border border-brand-border bg-white p-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
              {label}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                status === "Verified"
                  ? "text-emerald-600"
                  : status === "Pending"
                    ? "text-brand-gold-dark"
                    : "text-red-500"
              }`}
            >
              {status === "Verified" ? "✓ " : status === "Needs Review" ? "! " : ""}
              {status}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-brand-ink">Homes for you</h2>
        <Link to="/app/search" className="text-xs font-semibold text-brand-blue hover:underline">
          Browse all →
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {homesForYou.map((property) => (
          <PropertyCard key={property.id} property={property} asRent showFavorite />
        ))}
      </div>
    </div>
  );
}
