import { Link } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { useFavorites } from "../context/FavoritesContext";
import { useListings } from "../context/ListingsContext";
import PropertyCard from "../components/PropertyCard";
import MarketplaceGrid from "../components/MarketplaceGrid";
import { resolveSavedProperties } from "../utils/savedProperties";

// Saving works from any card on the platform, so this page has to read every
// place a card can come from. It used to look only in the original static
// property list, which meant a heart on anything imported or on any tenant
// request saved fine and then showed up nowhere. The heart writes an id; this
// page resolves that id against the same sources the marketplace renders,
// and shows each one with the card it was saved from.

export default function Shortlist() {
  const { role } = useRole();
  const { favoriteIds } = useFavorites();
  const { investorListings, tenantDemand } = useListings();
  const isTenant = role === "tenant";

  const { savedListings, savedDemand, savedProperties, total } = resolveSavedProperties(
    favoriteIds,
    investorListings,
    tenantDemand
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        {isTenant ? "Saved Homes" : "Shortlist"}
      </h1>
      <p className="mt-1 text-brand-muted">
        {isTenant
          ? "Homes you've saved to compare later. Tap the heart on any listing to add it here."
          : "Properties you're tracking. Tap the heart on any listing to add it here."}
      </p>

      {total === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
          Nothing saved yet.{" "}
          <Link to="/listings" className="font-semibold text-brand-blue hover:underline">
            Browse platform listings
          </Link>{" "}
          and tap the heart on anything worth keeping.
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {savedListings.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold tracking-tight text-brand-ink">
                From investors
                <span className="ml-2 text-sm font-medium text-brand-muted">
                  {savedListings.length}
                </span>
              </h2>
              <p className="mt-0.5 text-sm text-brand-muted">
                Properties an investor has published. Register interest and they know the demand is
                real.
              </p>
              <MarketplaceGrid side="investors" listings={savedListings} />
            </section>
          )}

          {savedDemand.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold tracking-tight text-brand-ink">
                From tenants
                <span className="ml-2 text-sm font-medium text-brand-muted">
                  {savedDemand.length}
                </span>
              </h2>
              <p className="mt-0.5 text-sm text-brand-muted">
                Properties a tenant wants an investor to buy. Buy one and a tenant is already
                waiting.
              </p>
              <MarketplaceGrid side="tenants" demand={savedDemand} />
            </section>
          )}

          {savedProperties.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold tracking-tight text-brand-ink">
                Saved from search
                <span className="ml-2 text-sm font-medium text-brand-muted">
                  {savedProperties.length}
                </span>
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {savedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    asRent={isTenant}
                    showFavorite
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
