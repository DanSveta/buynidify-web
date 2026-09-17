import { useState } from "react";
import type { InvestorListing, InterestedTenant } from "../context/ListingsContext";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

type Props = {
  listing: InvestorListing;
  variant: "tenant" | "investor";
  expressed?: boolean;
  onExpressInterest?: () => void;
  interestedTenants?: InterestedTenant[];
  /** Click an interested tenant to open their profile. */
  onOpenTenant?: (tenant: InterestedTenant) => void;
  /** Shown on My Properties so it's clear these are your own listings. */
  listedByYou?: boolean;
};

// Lighter-weight card than PropertyCard - covers listings that came from a
// pasted link (no baths/image/furnished data to work with) as well as the
// seeded ones, for both the "browse & express interest" (tenant) and "see
// who's interested" (investor) sides of the same listing.
export default function ListingCard({ listing, variant, expressed, onExpressInterest, interestedTenants = [], onOpenTenant, listedByYou }: Props) {
  const [showInterested, setShowInterested] = useState(false);

  return (
    <div className="rounded-2xl border border-brand-border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-brand-ink">{listing.address}</p>
          <p className="text-sm text-brand-muted">{listing.city}</p>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          {listedByYou && (
            <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-semibold text-white">
              Listed by you
            </span>
          )}
          {listing.source === "imported" && (
            <span className="rounded-full bg-brand-blue-light px-2 py-0.5 text-[10px] font-semibold text-brand-blue">
              Pasted link
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-ink">
        <span className="font-semibold">{gbp.format(listing.price)}</span>
        <span className="text-brand-muted">{listing.beds} bed</span>
        <span className="text-brand-muted">{listing.type}</span>
      </div>

      {variant === "tenant" ? (
        <button
          type="button"
          onClick={onExpressInterest}
          disabled={expressed}
          className={`mt-3 w-full rounded-lg py-2 text-xs font-semibold transition-colors ${
            expressed
              ? "cursor-default bg-brand-blue-light text-brand-blue"
              : "bg-brand-ink text-white hover:bg-black"
          }`}
        >
          {expressed ? "Interest sent ✓" : "Express interest"}
        </button>
      ) : (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowInterested((v) => !v)}
            disabled={interestedTenants.length === 0}
            className="flex items-center gap-1 text-xs font-semibold text-brand-blue disabled:cursor-default disabled:text-brand-muted"
          >
            {interestedTenants.length === 0
              ? "No tenant interest yet"
              : `👥 ${interestedTenants.length} tenant${interestedTenants.length === 1 ? "" : "s"} interested`}
            {interestedTenants.length > 0 && <span>{showInterested ? "▲" : "▼"}</span>}
          </button>
          {showInterested && interestedTenants.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {interestedTenants.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onOpenTenant?.(t)}
                    className="flex w-full items-center gap-2 rounded-lg bg-brand-surface p-2 text-left transition-colors hover:bg-brand-blue-light"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white">
                      {t.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-brand-ink">{t.name}</span>
                      <span className="block truncate text-[11px] text-brand-muted">
                        {t.occupation} · {t.household}
                      </span>
                    </span>
                    <span className="flex-shrink-0 text-[10px] text-brand-muted">
                      {t.daysAgo === 0 ? "today" : `${t.daysAgo}d ago`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
