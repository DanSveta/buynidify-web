import { useState } from "react";
import { useRole } from "../context/RoleContext";
import { useListings } from "../context/ListingsContext";
import { buildMockPropertyFromUrl } from "../utils/mockFromUrl";
import ListingCard from "../components/ListingCard";

export default function Marketplace() {
  const { role } = useRole();
  const {
    investorListings,
    addImportedProperty,
    expressInterestInListing,
    hasExpressedInterest,
    interestedTenantsFor,
  } = useListings();
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  function handleAddListing(e: React.FormEvent) {
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
    addImportedProperty({
      id: `il-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      owner: "investor",
      url: parsed.toString(),
      portal: mock.portal,
      title: mock.address,
      location: mock.city,
      price: mock.price,
      beds: mock.beds,
      type: mock.type,
      analysis: null,
      showAnalysis: false,
      published: null,
    });
    setLink("");
  }

  if (role === "investor") {
    return (
      <div>
        <span className="mb-2 inline-block rounded-full bg-brand-blue-light px-3 py-1 text-xs font-semibold text-brand-blue">
          Investor view
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
          Marketplace
        </h1>
        <p className="mt-1 text-brand-muted">
          Every property you've listed, plus how many tenants have shown interest in each one.
        </p>

        <form
          onSubmit={handleAddListing}
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-brand-border bg-brand-surface p-5 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-ink">
              List a property you've bought
            </p>
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
              Add listing
            </button>
          </div>
        </form>
        {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

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
      </div>
    );
  }

  return (
    <div>
      <span className="mb-2 inline-block rounded-full bg-brand-blue-light px-3 py-1 text-xs font-semibold text-brand-blue">
        Tenant view
      </span>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        Marketplace
      </h1>
      <p className="mt-1 text-brand-muted">
        Homes listed by investors, ready to buy. Express interest and we'll let you know if it's a match.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {investorListings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            variant="tenant"
            expressed={hasExpressedInterest(listing.id)}
            onExpressInterest={() => expressInterestInListing(listing.id)}
          />
        ))}
      </div>
    </div>
  );
}
