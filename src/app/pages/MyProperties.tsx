import { useState } from "react";
import { useRole } from "../context/RoleContext";
import { deals } from "../data/mockData";
import { useListings, type InterestedTenant } from "../context/ListingsContext";
import TenantProfileModal from "../components/TenantProfileModal";
import ListingCard from "../components/ListingCard";
import PropertyLinkImporter from "../components/PropertyLinkImporter";

function MyPropertiesInvestor() {
  const { investorListings, interestedTenantsFor } = useListings();
  const [openTenant, setOpenTenant] = useState<{ tenant: InterestedTenant; context: string } | null>(null);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">My Properties</h1>
      <p className="mt-1 text-brand-muted">
        Add a property link, run the AI rental analysis, then publish it to tenants.
      </p>

      {/* The full paste-a-link flow - same component as the Search page, so
          a property added in either place shows up in both. This replaced a
          cut-down link box that had no analysis or publish step. */}
      <PropertyLinkImporter />

      <h2 className="mt-10 font-display text-xl font-semibold tracking-tight text-brand-ink">
        Listed to tenants
      </h2>
      <p className="mt-1 text-sm text-brand-muted">
        Everything live on the marketplace, and how many tenants have shown interest.
      </p>

      {investorListings.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
          Nothing published yet. Add a link above, then use "Publish to tenants".
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {investorListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              variant="investor"
              interestedTenants={interestedTenantsFor(listing.id)}
              listedByYou
              onOpenTenant={(tenant) =>
                setOpenTenant({ tenant, context: `${listing.address}, ${listing.city}` })
              }
            />
          ))}
        </div>
      )}

      {openTenant && (
        <TenantProfileModal
          tenant={openTenant.tenant}
          context={openTenant.context}
          onClose={() => setOpenTenant(null)}
        />
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
