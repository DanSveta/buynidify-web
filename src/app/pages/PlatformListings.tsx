import { useRole } from "../context/RoleContext";
import { useListings } from "../context/ListingsContext";
import ListingCard from "../components/ListingCard";

export default function PlatformListings() {
  const { role } = useRole();
  const isTenant = role === "tenant";
  const { investorListings, expressInterestInListing, hasExpressedInterest, interestedTenantsFor } = useListings();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        Platform listings
      </h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        Properties listed directly on Buynidify by investors, as opposed to
        results pulled live from Rightmove, Zoopla, or OnTheMarket. {investorListings.length} live right now.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {investorListings.map((listing) =>
          isTenant ? (
            <ListingCard
              key={listing.id}
              listing={listing}
              variant="tenant"
              expressed={hasExpressedInterest(listing.id)}
              onExpressInterest={() => expressInterestInListing(listing.id)}
            />
          ) : (
            <ListingCard
              key={listing.id}
              listing={listing}
              variant="investor"
              interestedTenants={interestedTenantsFor(listing.id)}
            />
          )
        )}
      </div>
    </div>
  );
}
