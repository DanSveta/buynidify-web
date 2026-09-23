import { propertyImage } from "../utils/propertyImages";
import { useFavorites } from "../context/FavoritesContext";
import type { InvestorListing, TenantDemandEntry } from "../context/ListingsContext";

// The marketplace cards, shared by Platform listings, Search and Shortlist.
//
// These used to carry everything - AI analysis, "listed by", accepts/notes,
// an express-interest or connect button - which made the grid feel dense
// and slow to scan, and meant a card looked different depending on which
// page rendered it. Airbnb's browse grid doesn't try to do that: a photo,
// a price, the essentials, nothing else. Every action (express interest,
// connect, see who posted it, read the AI analysis) now lives on the
// property's own page, opened in a new tab - so browsing stays fast and
// "more details" always means the same thing: go look at the property.

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function HeartButton({ id }: { id: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(id);
      }}
      aria-label={liked ? "Remove from saved" : "Save this"}
      aria-pressed={liked}
      className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition-colors ${liked ? "fill-red-500 text-red-500" : "fill-none text-brand-muted"}`}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20.5s-7.5-4.6-7.5-9.8A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 3.3c0 5.2-7.5 9.8-7.5 9.8Z" />
      </svg>
    </button>
  );
}

const statIcon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-4 w-4 flex-shrink-0 text-brand-muted",
};

function BedIcon() {
  return (
    <svg {...statIcon}>
      <path d="M3 18v-5h18v5M3 13V7M21 13v-2a2 2 0 0 0-2-2h-6v4" />
      <circle cx="7" cy="11" r="1.6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg {...statIcon}>
      <path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg {...statIcon}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3.5V6M16 3.5V6" />
    </svg>
  );
}

/** The divided stat strip: icon, value, thin rule between each. */
function StatStrip({ items }: { items: { icon: React.ReactNode; value: string }[] }) {
  return (
    <div className="mt-3 flex items-center">
      {items.map((it, i) => (
        <div key={i} className="flex min-w-0 flex-1 items-center gap-2">
          {i > 0 && <span className="mr-2 h-5 w-px flex-shrink-0 bg-brand-border" />}
          {it.icon}
          <span className="truncate text-sm font-semibold text-brand-ink">{it.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Wraps a card in a real link that opens the property's own page in a new
 *  tab - clicking anywhere on the card except the heart does this, matching
 *  how a listing photo behaves everywhere else on the platform now. */
function CardLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-sm transition-shadow hover:shadow-lg"
    >
      {children}
    </a>
  );
}

function InvestorListingCard({ listing }: { listing: InvestorListing }) {
  const rent = listing.monthlyRent;

  return (
    <CardLink href={`/property/${listing.id}?kind=listing`}>
      <div className="relative h-52 w-full flex-shrink-0 overflow-hidden">
        <img
          src={listing.imageUrl ?? propertyImage(listing.id, listing.type)}
          alt={listing.type}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <HeartButton id={listing.id} />
      </div>

      <div className="relative -mt-10 flex flex-1 flex-col rounded-3xl bg-white p-5">
        <p className="font-display text-2xl font-semibold tracking-tight text-brand-blue">
          {rent ? `${gbp.format(rent)}/mo` : "Rent on request"}
        </p>
        <p className="mt-1 text-sm text-brand-muted">
          {listing.address}, {listing.city}
        </p>
        <h3 className="mt-1 font-display text-base font-semibold text-brand-ink">
          {listing.beds === 0 ? "Studio" : `${listing.beds}-bedroom`} {listing.type.toLowerCase()}
        </h3>

        <StatStrip
          items={[
            { icon: <BedIcon />, value: listing.beds === 0 ? "Studio" : `${listing.beds} beds` },
            { icon: <HomeIcon />, value: listing.type },
            {
              icon: <CalendarIcon />,
              value: listing.availableFrom ? `From ${listing.availableFrom}` : "Available now",
            },
          ]}
        />
      </div>
    </CardLink>
  );
}

function TenantDemandCard({ demand }: { demand: TenantDemandEntry }) {
  return (
    <CardLink href={`/property/${demand.id}?kind=demand`}>
      <div className="relative h-52 w-full flex-shrink-0 overflow-hidden">
        <img
          src={demand.imageUrl ?? propertyImage(demand.id, demand.propertyType)}
          alt={demand.propertyType}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <HeartButton id={demand.id} />
      </div>

      <div className="relative -mt-10 flex flex-1 flex-col rounded-3xl bg-white p-5">
        <p className="font-display text-2xl font-semibold tracking-tight text-brand-blue">
          {demand.targetPrice ? gbp.format(demand.targetPrice) : "Price on portal"}{" "}
          <span className="text-xs font-medium text-brand-muted">to buy</span>
        </p>
        <p className="mt-1 text-sm text-brand-muted">{demand.city}, UK</p>
        <h3 className="mt-1 font-display text-base font-semibold text-brand-ink">
          {demand.minBeds === 0 ? "Studio" : `${demand.minBeds}-bedroom`}{" "}
          {demand.propertyType.toLowerCase()} wanted
        </h3>

        <StatStrip
          items={[
            { icon: <BedIcon />, value: demand.minBeds === 0 ? "Studio" : `${demand.minBeds}+ beds` },
            { icon: <HomeIcon />, value: demand.propertyType },
            {
              icon: <CalendarIcon />,
              value: demand.addedDaysAgo === 0 ? "Posted today" : `${demand.addedDaysAgo}d ago`,
            },
          ]}
        />
      </div>
    </CardLink>
  );
}

/** Renders one side of the marketplace as a lean, Airbnb-style grid. Every
 *  card is a link to that property's own page (opened in a new tab) - this
 *  component no longer owns any interaction state itself. */
export default function MarketplaceGrid({
  side,
  listings = [],
  demand = [],
  emptyMessage = "Nothing matches that search yet.",
}: {
  side: "investors" | "tenants";
  listings?: InvestorListing[];
  demand?: TenantDemandEntry[];
  emptyMessage?: string;
}) {
  const count = side === "investors" ? listings.length : demand.length;

  if (count === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {side === "investors"
        ? listings.map((listing) => <InvestorListingCard key={listing.id} listing={listing} />)
        : demand.map((d) => <TenantDemandCard key={d.id} demand={d} />)}
    </div>
  );
}
