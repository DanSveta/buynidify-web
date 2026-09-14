import { useState } from "react";
import { useRole } from "../context/RoleContext";
import { deals } from "../data/mockData";
import { useListings } from "../context/ListingsContext";
import { buildMockPropertyFromUrl } from "../utils/mockFromUrl";
import ListingCard from "../components/ListingCard";
import PropertyLinkImporter from "../components/PropertyLinkImporter";

function MyPropertiesInvestor() {
  const { investorListings, addInvestorListing, interestedTenantsFor } = useListings();
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = link.trim();
    if (!trimmed) return;
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      setError("That doesn't look like a valid link. Paste the full property page URL.");
      return;
    }
    setError("");
    const mock = buildMockPropertyFromUrl(parsed.toString());
    addInvestorListing({
      id: `il-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: parsed.toString(),
      address: mock.address,
      city: mock.city,
      price: mock.price,
      beds: mock.beds,
      type: mock.type,
    });
    setLink("");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">My Properties</h1>
      <p className="mt-1 text-brand-muted">
        Properties you've listed. See how many tenants have shown interest in each one.
      </p>

      <form
        onSubmit={handleAdd}
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-brand-border bg-brand-surface p-5 sm:flex-row sm:items-center"
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-brand-ink">Add a property link</p>
          <p className="text-xs text-brand-muted">
            Paste a link from Rightmove, Zoopla, or OnTheMarket - tenants will be able to browse it and express interest.
          </p>
        </div>
        <div className="flex gap-2 sm:w-96">
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://rightmove.co.uk/..."
            className="flex-1 rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Add
          </button>
        </div>
      </form>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      {investorListings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
          You haven't listed any properties yet.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {investorListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              variant="investor"
              interestedTenants={interestedTenantsFor(listing.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MyPropertiesTenant() {
  // Current tenancy (if a lease exists) + any properties in an active deal
  // (deposit paid or purchase in progress), plus the paste-a-link + AI
  // analysis flow (same as the live product's My Properties page).
  const myDeals = deals.filter((d) => d.stage !== "matched");
  const currentHome = myDeals.find((d) => d.stage === "lease-signed");

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">My Properties</h1>
      <p className="mt-1 text-brand-muted">
        Save property links, run AI analysis, and see anything moving through a deal right now.
      </p>

      <PropertyLinkImporter />

      {currentHome && (
        <div className="mt-8 rounded-2xl border border-brand-blue bg-brand-blue-light p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Current home</p>
          <p className="mt-1 font-display text-lg font-semibold text-brand-ink">{currentHome.propertyAddress}</p>
          <p className="text-sm text-brand-muted">{currentHome.city}</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {myDeals
          .filter((d) => d.stage !== "lease-signed")
          .map((deal) => (
            <div key={deal.id} className="flex items-center justify-between rounded-2xl border border-brand-border bg-white p-5">
              <div>
                <p className="font-display text-base font-semibold text-brand-ink">{deal.propertyAddress}</p>
                <p className="text-sm text-brand-muted">{deal.city}</p>
              </div>
              <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-ink">
                {deal.stage === "deposit-paid" ? "Deposit paid" : "Purchase in progress"}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function MyProperties() {
  const { role } = useRole();
  return role === "investor" ? <MyPropertiesInvestor /> : <MyPropertiesTenant />;
}
