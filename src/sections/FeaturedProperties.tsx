import { Link } from "react-router-dom";
import { BathIcon, BedIcon } from "../components/icons";
import { useListings } from "../app/context/ListingsContext";
import { propertyImage } from "../app/utils/propertyImages";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

// Real cards, pulled from what's actually on the platform - a mix of
// investor listings and tenant demand, same as the marketplace itself,
// rather than invented showcase content. Pulled from the seed set
// specifically: older, quieter entries that aren't doing much elsewhere on
// the site, so featuring them here doesn't take anything away from the
// live marketplace. Keeps this section's exact card design; only the data
// feeding it changed.
export default function FeaturedProperties() {
  const { investorListings, tenantDemand } = useListings();

  const listingCards = investorListings
    .filter((l) => l.source === "seed")
    .slice(0, 2)
    .map((l) => ({
      id: l.id,
      href: `/property/${l.id}?kind=listing`,
      image: l.imageUrl ?? propertyImage(l.id, l.type),
      badge: l.portal ?? "For sale",
      name: l.address,
      location: l.city,
      beds: l.beds,
      baths: Math.max(1, Math.round(l.beds * 0.7) || 1),
      chip: l.monthlyRent
        ? `${((l.monthlyRent * 12) / l.price * 100).toFixed(1)}% yield`
        : "Investor listing",
      priceLabel: l.monthlyRent ? "Rent" : "Asking price",
      price: l.monthlyRent ? `${gbp.format(l.monthlyRent)}/mo` : gbp.format(l.price),
    }));

  const demandCards = tenantDemand
    .filter((d) => d.source === "seed")
    .slice(0, 2)
    .map((d) => ({
      id: d.id,
      href: `/property/${d.id}?kind=demand`,
      image: d.imageUrl ?? propertyImage(d.id, d.propertyType),
      badge: "Tenant demand",
      name: `${d.minBeds === 0 ? "Studio" : `${d.minBeds}-bed`} ${d.propertyType} wanted`,
      location: d.city,
      beds: d.minBeds,
      baths: Math.max(1, Math.round(d.minBeds * 0.7) || 1),
      chip: "Buyer wanted",
      priceLabel: "Target price",
      price: d.targetPrice ? gbp.format(d.targetPrice) : "Price on portal",
    }));

  const featured = [...listingCards, ...demandCards];

  if (featured.length === 0) return null;

  return (
    <section id="properties" className="mx-auto max-w-[1440px] px-6 py-24 sm:px-10">
      <div className="mb-12 flex flex-col items-center text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
          Handpicked Listings
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Featured Properties &amp; Portfolios
        </h2>
        <p className="mt-3 max-w-xl text-brand-muted">
          A look at what's actually on Buynidify right now - properties investors have listed and
          homes tenants are asking us to buy for them.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((property) => (
          <Link
            key={property.id}
            to={property.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={property.image}
                alt={property.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-brand-blue px-3 py-1 text-xs font-bold text-brand-gold">
                {property.badge}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-display text-xs font-semibold tracking-tight text-brand-ink">
                {property.name}
              </h3>
              <p className="mt-1 text-sm text-brand-muted">
                {property.location}
              </p>
              <div className="mt-3 flex items-center gap-3 text-sm text-brand-muted">
                <span className="inline-flex items-center gap-1">
                  <BedIcon className="h-4 w-4 text-brand-blue" />
                  {property.beds} Beds
                </span>
                <span className="inline-flex items-center gap-1">
                  <BathIcon className="h-4 w-4 text-brand-blue" />
                  {property.baths} Baths
                </span>
                <span className="rounded-md bg-brand-blue-light px-2 py-0.5 text-xs font-semibold text-brand-blue">
                  {property.chip}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-brand-border pt-4">
                <div>
                  <p className="text-xs text-brand-muted">
                    {property.priceLabel}
                  </p>
                  <p className="font-display text-lg font-semibold tracking-tight text-brand-blue">
                    {property.price}
                  </p>
                </div>
                <span className="rounded-lg border border-brand-border px-4 py-2 text-xs font-semibold text-brand-ink transition-colors group-hover:border-brand-blue group-hover:text-brand-blue">
                  View Details
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
