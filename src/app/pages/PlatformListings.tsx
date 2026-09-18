import { useMemo, useState } from "react";
import { useListings } from "../context/ListingsContext";
import MarketplaceGrid from "../components/MarketplaceGrid";

// Mirrors the live product's /marketplace page: both sides of the platform in
// one place, with the cards themselves living in MarketplaceGrid so Search can
// show the same thing.

const bedroomFilters = ["Any bedrooms", "1+", "2+", "3+", "4+"];

export default function PlatformListings() {
  const { investorListings, tenantDemand } = useListings();
  const [tab, setTab] = useState<"investors" | "tenants">("investors");
  const [query, setQuery] = useState("");
  const [bedFilter, setBedFilter] = useState(bedroomFilters[0]);

  const minBeds = bedFilter === bedroomFilters[0] ? 0 : parseInt(bedFilter, 10);
  const q = query.trim().toLowerCase();

  const filteredListings = useMemo(
    () =>
      investorListings.filter((l) => {
        if (l.beds < minBeds) return false;
        if (!q) return true;
        return `${l.address} ${l.city} ${l.type}`.toLowerCase().includes(q);
      }),
    [investorListings, minBeds, q]
  );

  const filteredDemand = useMemo(
    () =>
      tenantDemand.filter((d) => {
        if (d.minBeds < minBeds) return false;
        if (!q) return true;
        return `${d.city} ${d.propertyType} ${d.notes}`.toLowerCase().includes(q);
      }),
    [tenantDemand, minBeds, q]
  );

  const shown = tab === "investors" ? filteredListings.length : filteredDemand.length;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">Platform listings</h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        Browse properties published by investors and rental requirements from tenants. Express your
        interest and Buynidify coordinates the rest.
      </p>

      {/* Both sides of the marketplace, with live counts. */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setTab("investors")}
          className={`rounded-xl border px-4 py-3 text-left transition-colors ${
            tab === "investors"
              ? "border-brand-blue bg-brand-blue-light"
              : "border-brand-border bg-white hover:border-brand-blue"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
            From investors
            <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[11px] font-bold text-white">
              {investorListings.length}
            </span>
          </span>
          <span className="block text-xs text-brand-muted">Properties available to rent</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("tenants")}
          className={`rounded-xl border px-4 py-3 text-left transition-colors ${
            tab === "tenants"
              ? "border-brand-blue bg-brand-blue-light"
              : "border-brand-border bg-white hover:border-brand-blue"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
            From tenants
            <span className="rounded-full bg-brand-gold px-2 py-0.5 text-[11px] font-bold text-brand-ink">
              {tenantDemand.length}
            </span>
          </span>
          <span className="block text-xs text-brand-muted">What people are looking for</span>
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by location or property name..."
          className="flex-1 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
        />
        <select
          value={bedFilter}
          onChange={(e) => setBedFilter(e.target.value)}
          className="rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue sm:w-48"
        >
          {bedroomFilters.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-sm text-brand-muted">
        {shown} listing{shown === 1 ? "" : "s"} found
      </p>

      <MarketplaceGrid
        side={tab}
        listings={filteredListings}
        demand={filteredDemand}
      />

    </div>
  );
}
