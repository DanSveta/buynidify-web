import type { Property } from "../data/mockData";
import { useFavorites } from "../context/FavoritesContext";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

type Props = {
  property: Property;
  /** Show rent-equivalent framing for tenants instead of sale price */
  asRent?: boolean;
  actionLabel?: string;
  onAction?: (property: Property) => void;
  /** Show the heart/favorite toggle in the top-left corner */
  showFavorite?: boolean;
};

export default function PropertyCard({
  property,
  asRent = false,
  actionLabel,
  onAction,
  showFavorite = false,
}: Props) {
  const rentEstimate = Math.round((property.price * 0.045) / 12);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-white">
      <div className="relative h-36">
        <img
          src={property.image}
          alt={property.address}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
          {asRent ? "For rent" : property.status === "under-offer" ? "Under offer" : "For sale"}
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-brand-blue-light px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
          {property.fitScore}% fit
        </span>
        {showFavorite && (
          <button
            type="button"
            onClick={() => toggleFavorite(property.id)}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favorited}
            className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-ink shadow-sm transition-transform hover:scale-105"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill={favorited ? "#febe10" : "none"}
              stroke={favorited ? "#febe10" : "currentColor"}
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20s-7-4.35-9.5-8.5C.9 8.1 2.2 4.5 5.6 4.5c2 0 3.4 1.1 4.4 2.6C11 5.6 12.4 4.5 14.4 4.5c3.4 0 4.7 3.6 3.1 7C15 15.65 12 20 12 20z"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="text-base font-bold text-brand-ink">
          {asRent ? `${gbp.format(rentEstimate)}/mo` : gbp.format(property.price)}
        </p>
        <p className="mt-0.5 text-sm text-brand-muted">
          {property.address}, {property.city}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-muted">
          <span>{property.type}</span>
          {property.beds > 0 && <span>{property.beds} bed</span>}
          <span>{property.baths} bath</span>
          {property.furnished && <span>Furnished</span>}
        </div>
        {actionLabel && (
          <button
            onClick={() => onAction?.(property)}
            className="mt-3 w-full rounded-lg bg-brand-ink py-2 text-xs font-semibold text-white transition-colors hover:bg-black"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
