import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import PublicShell from "./PublicShell";
import {
  useListings,
  agreementSteps,
  type InvestorListing,
  type TenantDemandEntry,
  type InterestedTenant,
} from "../app/context/ListingsContext";
import { useRole } from "../app/context/RoleContext";
import { useFavorites } from "../app/context/FavoritesContext";
import { useAuthGate } from "../app/context/AuthGateContext";
import { propertyImage } from "../app/utils/propertyImages";
import {
  propertyDetailsFor,
  effectiveAvailableFrom,
  type AmenityKey,
  type NearbyPlace,
} from "../app/utils/propertyDetails";
import { avatarFor } from "../app/utils/avatars";
import {
  investorProfileFor,
  tenantProfileFor,
  namedInvestorProfile,
  namedTenantProfile,
  profileFromInterestedTenant,
  selfProfile,
  type PartyProfile,
} from "../app/utils/profiles";
import { roleStyles } from "../app/components/ProfileBody";
import AgreementTimeline from "../app/components/AgreementTimeline";
import { fallbackTenantProfile } from "../app/components/DealDetailPanel";
import TenantProfileModal from "../app/components/TenantProfileModal";
import ConnectTenantModal from "../app/components/ConnectTenantModal";
import Avatar from "../app/components/Avatar";
import { AIAnalysisCard, type AnalysisMetric } from "../app/components/AIAnalysisCard";
import { marketFor, suggestedRent } from "../data/ukMarketData";

// The property page, rebuilt as an actual editorial listing page rather than
// a stack of bordered dashboard cards. The model is a real portal's own
// listing page: title and location first, one full-width photo, a plain
// stat line, then the content flows as sections separated by hairlines -
// host, highlights, description, what's included, location, analysis - with
// a single elevated card (price, availability, the call to action) pinned to
// the side. That's the one thing that's allowed to look like a "card" here;
// everything else reads as a page, not a panel.

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function portalFromUrl(url?: string) {
  if (!url) return null;
  if (url.includes("rightmove")) return "Rightmove";
  if (url.includes("zoopla")) return "Zoopla";
  if (url.includes("onthemarket")) return "OnTheMarket";
  if (url.includes("primelocation")) return "PrimeLocation";
  return "Portal";
}

function demandAnalysis(d: TenantDemandEntry) {
  const market = marketFor(d.city);
  // The tenant's own target rent wins if they set one - it's what they
  // actually said they can afford - otherwise fall back to this city's
  // researched market rate for the bed count they're after.
  const rent = d.targetRentPerMonth ?? suggestedRent(d.city, d.minBeds);
  let h = 0;
  for (let i = 0; i < d.id.length; i++) h = (h * 31 + d.id.charCodeAt(i)) >>> 0;
  const commute = Math.round((6 + (h % 35) / 10) * 10) / 10;
  const amenities = Math.round((6 + ((h >> 3) % 35) / 10) * 10) / 10;
  const value = ["Fair", "Good", "Excellent"][h % 3];
  const [rentLow, rentHigh] = market.rentByBeds[Math.min(4, Math.max(1, Math.round(d.minBeds))) as 1 | 2 | 3 | 4];
  return {
    rent,
    deposit: rent * 5,
    upfront: rent * 6,
    commute,
    amenities,
    value,
    market,
    rentLow,
    rentHigh,
    summary: `This ${d.minBeds}-bedroom property in ${d.city} could suit your requirements. ${market.summary}`,
    positives: [
      `${d.minBeds} bedroom${d.minBeds === 1 ? "" : "s"} offer good space for your household`,
      `${d.city} has good transport links`,
      "Property type suits long-term tenancy",
    ],
    consider: ["Confirm pets policy with landlord", "Check broadband speeds for the area", "Verify council tax band"],
    suggestions: [
      `Typical rent here: ${gbp.format(rentLow)}-${gbp.format(rentHigh)}/month for ${d.minBeds} bed${d.minBeds === 1 ? "" : "s"}`,
      "Ask about minimum lease term",
      "Request energy performance certificate",
      `Popular areas nearby: ${market.popularAreas.slice(0, 3).join(", ")}`,
    ],
  };
}

function mapsHref(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/* --- icons, one small consistent set -------------------------------------- */

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Icon = {
  bed: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M3 18v-5h18v5M3 13V7M21 13v-2a2 2 0 0 0-2-2h-6v4" />
      <circle cx="7" cy="11" r="1.6" />
    </svg>
  ),
  bath: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z" />
      <path d="M7 12V6a2 2 0 0 1 3.2-1.6M9 4.5 7.5 6" />
      <path d="M6 21v1M16 21v1" />
    </svg>
  ),
  ruler: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <rect x="3" y="8.5" width="18" height="7" rx="1.2" transform="rotate(-45 12 12)" />
      <path d="m8 13 1.4-1.4M11 16l1.4-1.4M14 19l1.4-1.4" strokeWidth={1.4} />
    </svg>
  ),
  mapPin: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M12 21s7-6.1 7-11.5S16.4 3 12 3 5 4.6 5 9.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  ),
  user: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.2-4 4.2-6 7.5-6s6.3 2 7.5 6" />
    </svg>
  ),
  doc: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M7 3h7l4 4v14H7Z" />
      <path d="M14 3v4h4M9.5 13h5M9.5 16.5h5" />
    </svg>
  ),
  bolt: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  ),
  tag: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M12.6 3H5a2 2 0 0 0-2 2v7.6a2 2 0 0 0 .6 1.4l9 9a2 2 0 0 0 2.8 0l7.6-7.6a2 2 0 0 0 0-2.8l-9-9a2 2 0 0 0-1.4-.6Z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  ),
  car: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M4 16V11l2-5h12l2 5v5" />
      <path d="M4 16a1.5 1.5 0 0 0 3 0M17 16a1.5 1.5 0 0 0 3 0M4 16h16" />
      <circle cx="7.5" cy="16" r="1.3" />
      <circle cx="16.5" cy="16" r="1.3" />
    </svg>
  ),
  tree: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M12 3 7 11h3l-4 7h5v3M12 3l5 8h-3l4 7h-5" />
    </svg>
  ),
  check: (p: { className?: string }) => (
    <svg viewBox="0 0 20 20" className={p.className} fill="currentColor">
      <path d="M7.6 13.4 4 9.8l1.2-1.2 2.4 2.4 6.8-6.8L15.6 5.4z" />
    </svg>
  ),
  sparkle: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className} fill="currentColor" stroke="none">
      <path d="M12 2.5 13.9 9l6.5 1.9-6.5 1.9L12 19.3 10.1 12.8 3.6 10.9 10.1 9z" />
    </svg>
  ),
  users: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M2.5 19.5c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <path d="M16 8.7a3 3 0 1 1 1.6 5.6M21 19.5c0-2.7-1.9-4.7-4.6-5.3" />
    </svg>
  ),
  compass: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 6-6 2 2-6z" />
    </svg>
  ),
  kitchen: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M4 9h16M4 9v10h16V9M4 9l1.5-5h13L20 9" />
      <path d="M9 13v3M15 13v3" />
    </svg>
  ),
  wifi: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M3 8.5a15 15 0 0 1 18 0M6 12a10.5 10.5 0 0 1 12 0M9.3 15.5a6 6 0 0 1 5.4 0" />
      <circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  flame: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M12 3s-5 5-5 9.5A5 5 0 0 0 12 21a5 5 0 0 0 5-5.5c0-1.5-.8-2.5-1.5-3.3.3 1.4-.4 2.3-1 2.3-.9 0-1-1-.7-2C14.3 10 14 7 12 3Z" />
    </svg>
  ),
  window: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <rect x="4" y="4" width="16" height="16" rx="1.2" />
      <path d="M12 4v16M4 12h16" />
    </svg>
  ),
  lock: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
  box: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z" />
      <path d="M3.5 8v8L12 20l8.5-4V8M12 12v8" />
    </svg>
  ),
  dial: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 12 9.5 9.5" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  ),
  sofa: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
      <path d="M3.5 12h17v4a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16v-4Z" />
      <path d="M5 17.5V20M19 17.5V20" />
    </svg>
  ),
  desk: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M3 8h18M3 8v11M21 8v11M3 13h18" />
      <path d="M6 13v6M18 13v6" />
    </svg>
  ),
  closet: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M12 3v18" />
      <circle cx="9.5" cy="12" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  ),
  layout: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <rect x="3.5" y="4" width="17" height="16" rx="1.2" />
      <path d="M3.5 9.5h17M9.5 9.5V20" />
    </svg>
  ),
  column: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M4 4h16M4 20h16M8 6v12M16 6v12" />
    </svg>
  ),
  washer: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <circle cx="12" cy="13" r="4.5" />
      <path d="M8 6.5h.01M11 6.5h.01" strokeWidth={2.2} />
    </svg>
  ),
  paw: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className} fill="currentColor" stroke="none">
      <circle cx="7" cy="9" r="1.8" />
      <circle cx="12" cy="6.5" r="1.8" />
      <circle cx="17" cy="9" r="1.8" />
      <path d="M12 12.5c-3.5 0-6 2.3-6 4.7 0 1.6 1.3 2.3 2.7 1.7.9-.4 2-.9 3.3-.9s2.4.5 3.3.9c1.4.6 2.7-.1 2.7-1.7 0-2.4-2.5-4.7-6-4.7Z" />
    </svg>
  ),
  elevator: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <rect x="6" y="3" width="12" height="18" rx="1.2" />
      <path d="m10 9 2-2 2 2M10 15l2 2 2-2" />
    </svg>
  ),
  balcony: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M4 20V10l8-6 8 6v10" />
      <path d="M4 20h16M6 20v-6h12v6" />
    </svg>
  ),
  bike: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17 10 9h5l3 8M10 9l2 4h6M9 5h3" />
    </svg>
  ),
  train: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <rect x="5" y="4" width="14" height="13" rx="3" />
      <path d="M5 12h14M9 17l-2 3M15 17l2 3" />
      <circle cx="9" cy="14.2" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14.2" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  storefront: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M3.5 9 5 4h14l1.5 5" />
      <path d="M4 9v11h16V9M4 9a2.2 2.2 0 0 0 4.2 1 2.2 2.2 0 0 0 4 0 2.2 2.2 0 0 0 4 0 2.2 2.2 0 0 0 4.2-1" />
      <path d="M10 20v-5h4v5" />
    </svg>
  ),
  cart: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M3 4h2l2.4 11h10.2L20 8H6.2" />
      <circle cx="9.5" cy="19" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="19" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  ),
  book: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
    </svg>
  ),
  walk: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <circle cx="13" cy="4.5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M10 8.5 13 7l3 2.5-1.5 2L16 15l1.5 5.5M13 7l-2 4-3.5 1.5M11 12l-2.5 8" />
    </svg>
  ),
};

const AMENITY_ICON: Record<AmenityKey, (p: { className?: string }) => React.ReactNode> = {
  kitchen: Icon.kitchen,
  broadband: Icon.wifi,
  heating: Icon.flame,
  underfloor: Icon.flame,
  glazing: Icon.window,
  security: Icon.lock,
  storage: Icon.box,
  smart: Icon.dial,
  furnished: Icon.sofa,
  dishwasher: Icon.kitchen,
  office: Icon.desk,
  wardrobe: Icon.closet,
  ensuite: Icon.bath,
  openplan: Icon.layout,
  period: Icon.column,
  utility: Icon.washer,
  pets: Icon.paw,
  lift: Icon.elevator,
  balcony: Icon.balcony,
  communalGarden: Icon.tree,
  bike: Icon.bike,
  garden: Icon.tree,
  garage: Icon.car,
  parking: Icon.car,
  terrace: Icon.balcony,
};

const NEARBY_ICON: Record<NearbyPlace["key"], (p: { className?: string }) => React.ReactNode> = {
  station: Icon.train,
  highstreet: Icon.storefront,
  supermarket: Icon.cart,
  school: Icon.book,
  park: Icon.tree,
};

const NEARBY_CATEGORY_LABEL: Record<NearbyPlace["key"], string> = {
  station: "Transport",
  highstreet: "Local centre",
  supermarket: "Shopping",
  school: "School",
  park: "Green space",
};

/** "Listed by" / "Posted by", rebuilt as an actual profile card - photo,
 *  verification, a couple of real stats and a way to message them - rather
 *  than a bare name-and-badge row. The stats are genuine fields already on
 *  the profile (properties listed, member since), not invented for the
 *  occasion. */
function AgentCard({
  profile,
  onMessage,
  fill,
  interestCount,
  interestLabel,
  interestZeroLabel,
}: {
  profile: PartyProfile;
  onMessage?: () => void;
  /** Stretches to match the height of the photo it sits beside in the hero
   *  row, instead of only being as tall as its own content. */
  fill?: boolean;
  /** How many other people are interested in this listing/request - shown
   *  as an anonymized cluster (no names, no photos), since this card is
   *  what a stranger sees, not the owner. Omit to hide the row entirely. */
  interestCount?: number;
  interestLabel?: string;
  interestZeroLabel?: string;
}) {
  const allVerified = profile.verified.idCheck && profile.verified.referencing && profile.verified.funds;
  const propertiesListed = profile.details.find((d) => d.label === "Properties listed")?.value;
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div
      className={`rounded-2xl border border-brand-border bg-white p-6 ${fill ? "flex h-full flex-col" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
            {profile.role === "Tenant" ? "Posted by" : "Listed by"}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-brand-ink">{profile.name}</p>
          {profile.location && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-muted">
              <Icon.mapPin className="h-3.5 w-3.5" /> {profile.location}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${roleStyles[profile.role]}`}>
              {profile.role}
            </span>
            {allVerified && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
        <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-blue text-lg font-bold text-white">
          {profile.photoUrl && !photoFailed ? (
            <img
              src={profile.photoUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            profile.initials
          )}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-brand-muted">{profile.about}</p>

      <div className={fill ? "mt-auto" : ""}>
        <div className="mt-5 flex gap-6 border-t border-brand-border pt-4">
          {propertiesListed && (
            <div>
              <p className="text-lg font-bold text-brand-ink">{propertiesListed}+</p>
              <p className="text-xs text-brand-muted">Properties listed</p>
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-brand-ink">{profile.memberSince}</p>
            <p className="text-xs text-brand-muted">Member since</p>
          </div>
        </div>

        {interestCount !== undefined && (
          <InterestCluster
            count={interestCount}
            label={interestLabel ?? "interested"}
            zeroLabel={interestZeroLabel ?? "No interest yet"}
          />
        )}

        {onMessage && (
          <button
            type="button"
            onClick={onMessage}
            className="mt-5 w-full rounded-lg bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Message
          </button>
        )}
      </div>
    </div>
  );
}

/** The other half of the hero when it's your own listing or request - same
 *  shape as AgentCard (photo, badges, a row of real numbers) rather than a
 *  near-empty box with one sentence in it, since "it's you" isn't an excuse
 *  for the card to have nothing in it. */
function YourListingCard({
  profile,
  stats,
  manageTo,
  manageLabel,
  interest,
}: {
  profile: PartyProfile;
  stats: { label: string; value: string }[];
  manageTo: string;
  manageLabel: string;
  /** Real names/photos this time - it's your own listing, so unlike
   *  AgentCard's anonymized version you're allowed to see exactly who's
   *  interested. Clicking scrolls down to the full list further down the
   *  page. */
  interest?: {
    count: number;
    label: string;
    zeroLabel: string;
    people?: { name: string; initials: string; photoUrl?: string }[];
    scrollToId: string;
  };
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  return (
    <div className="flex h-full flex-col rounded-2xl border border-brand-border bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
            {profile.role === "Tenant" ? "Posted by" : "Listed by"}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-brand-ink">{profile.name}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${roleStyles[profile.role]}`}>
              {profile.role}
            </span>
            <span className="rounded-full bg-brand-blue-light px-2.5 py-1 text-[11px] font-bold text-brand-blue">
              You
            </span>
          </div>
        </div>
        <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-blue text-lg font-bold text-white">
          {profile.photoUrl && !photoFailed ? (
            <img
              src={profile.photoUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            profile.initials
          )}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-brand-surface px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-brand-muted">{s.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-brand-ink">{s.value}</p>
          </div>
        ))}
      </div>

      {interest && (
        <InterestCluster
          count={interest.count}
          label={interest.label}
          zeroLabel={interest.zeroLabel}
          people={interest.people}
          onClick={interest.count > 0 ? () => scrollToId(interest.scrollToId) : undefined}
        />
      )}

      <Link
        to={manageTo}
        className="mt-6 block rounded-lg bg-brand-blue px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
      >
        {manageLabel}
      </Link>
    </div>
  );
}

/** A stacked-circle "N people interested" indicator - overlapping avatars
 *  (or, for a stranger looking at someone else's listing, overlapping blank
 *  silhouettes instead of real photos) plus a "+N" badge and a count, the
 *  way most marketplaces hint at demand without handing over who exactly is
 *  interested. Clickable (scrolls to the full named list) only when there's
 *  a list to scroll to - the owner's own view. A stranger sees the same
 *  shape but nothing to click through to, which is the point: enough to
 *  know it's wanted, not enough to know by whom. */
function InterestCluster({
  count,
  label,
  zeroLabel,
  people,
  onClick,
}: {
  count: number;
  /** e.g. "tenants interested" / "investor interested" - already pluralised
   *  for the count passed in. */
  label: string;
  zeroLabel: string;
  /** Real name/photo for each of up to 3 shown circles - only ever passed
   *  for the owner's own view. Omit for the anonymized stranger view. */
  people?: { name: string; initials: string; photoUrl?: string }[];
  onClick?: () => void;
}) {
  if (count === 0) {
    return <p className="mt-4 text-xs text-brand-muted">{zeroLabel}</p>;
  }
  const shown = people?.slice(0, 3) ?? [];
  const blanks = Math.max(0, Math.min(3, count) - shown.length);
  const extra = count - shown.length - blanks;
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`mt-4 flex items-center gap-2.5 ${onClick ? "cursor-pointer group" : ""}`}
    >
      <span className="flex flex-shrink-0 items-center -space-x-2.5">
        {shown.map((p, i) => (
          <span
            key={i}
            className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-brand-blue text-[10px] font-bold text-white ring-2 ring-white"
          >
            {p.photoUrl ? <img src={p.photoUrl} alt="" className="h-full w-full object-cover" /> : p.initials}
          </span>
        ))}
        {Array.from({ length: blanks }).map((_, i) => (
          <span
            key={`blank-${i}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-surface text-brand-muted ring-2 ring-white"
          >
            <Icon.user className="h-3.5 w-3.5" />
          </span>
        ))}
        {extra > 0 && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-ink text-[10px] font-bold text-white ring-2 ring-white">
            +{extra}
          </span>
        )}
      </span>
      <span
        className={`text-xs font-semibold text-brand-ink ${onClick ? "group-hover:text-brand-blue group-hover:underline" : ""}`}
      >
        {count} {label}
      </span>
    </Tag>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* --- small shared bits ------------------------------------------------------ */

function BackLink() {
  return (
    <Link to="/listings" className="text-sm font-semibold text-brand-muted transition-colors hover:text-brand-ink">
      ← Back to listings
    </Link>
  );
}

function IconRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center text-brand-ink">{icon}</div>
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-brand-ink">{title}</p>
        <p className="mt-0.5 text-sm text-brand-muted">{body}</p>
      </div>
    </div>
  );
}

/** The "Features" grid, modelled on a real portal's own feature list: icon
 *  plus bold label, four across, with only the first eight shown until asked
 *  for more - a wall of every amenity at once is what made the old version
 *  feel like a spec sheet instead of a place someone might want to live. */
function FeatureGrid({ items }: { items: { key: AmenityKey; label: string }[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, 8);
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
        {shown.map((f) => {
          const FeatureIcon = AMENITY_ICON[f.key];
          return (
            <div key={f.key} className="flex items-center gap-2.5 text-sm">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-brand-blue">
                <FeatureIcon className="h-5 w-5" />
              </span>
              <span className="font-semibold text-brand-ink">{f.label}</span>
            </div>
          );
        })}
      </div>
      {items.length > 8 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-brand-ink underline underline-offset-2"
        >
          {expanded ? "Show fewer features" : `View all ${items.length} features`}
          <span aria-hidden className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
            ⌄
          </span>
        </button>
      )}
    </div>
  );
}

/** "Where you'll be": each place as an icon-in-a-circle plus name, category
 *  and a real travel time and mode instead of a bare mileage figure - closer
 *  to how a person actually decides whether something is close enough. */
function NearbyGrid({ items }: { items: NearbyPlace[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
      {items.map((n) => {
        const PlaceIcon = NEARBY_ICON[n.key];
        return (
          <div key={n.key} className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
              <PlaceIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-brand-ink">{n.name}</p>
              <p className="text-xs text-brand-muted">
                {NEARBY_CATEGORY_LABEL[n.key]} · {n.minutes} min {n.mode === "walk" ? "walk" : "drive"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** An actual embedded map (Google's public embed endpoint - no API key
 *  needed), the way Airbnb's "Where you'll be" shows one. It doesn't need to
 *  centre on the exact address - the real one lives behind the "View on
 *  Google Maps" link below it - it just needs to make the neighbourhood feel
 *  real instead of describing it in a list. */
function PropertyMap({ query }: { query: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-brand-border">
      <iframe
        title="Property location"
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
        width="100%"
        height="320"
        style={{ border: 0, display: "block" }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

function Divider() {
  return <div className="my-7 border-t border-brand-border" />;
}

function SaveButton({ id }: { id: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(id);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id)}
      className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        liked
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-brand-border text-brand-ink hover:border-brand-blue hover:text-brand-blue"
      }`}
    >
      <span aria-hidden>{liked ? "♥" : "♡"}</span>
      {liked ? "Saved" : "Save"}
    </button>
  );
}


/** A compact month view built for the sidebar - one glance, one highlighted
 *  date, nothing interactive to fake. Laid out with inline grid styles
 *  rather than a Tailwind grid utility, since the class-based version has a
 *  history of not surviving a stale dev cache on a brand-new class name. */
function MiniCalendar({ date }: { date: Date | null }) {
  const today = new Date();
  const target = date ?? today;
  const year = target.getFullYear();
  const month = target.getMonth();
  const monthLabel = target.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetTime = date
    ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    : startOfToday.getTime();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <p className="text-center text-xs font-semibold text-brand-ink">{monthLabel}</p>
      <div
        className="mt-2 text-center text-[10px] font-semibold uppercase text-brand-muted"
        style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
      >
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", rowGap: 2 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`g${i}`} />;
          const cellTime = new Date(year, month, day).getTime();
          const isTarget = cellTime === targetTime;
          const isPast = cellTime < startOfToday.getTime();
          return (
            <div key={i} className="flex items-center justify-center py-0.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] ${
                  isTarget
                    ? "bg-brand-ink font-bold text-white"
                    : isPast
                      ? "text-brand-muted/40"
                      : "text-brand-ink"
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- listing (investor's property) --------------------------------------- */

function ListingDetail({ listing }: { listing: InvestorListing }) {
  const { role, namesByRole } = useRole();
  const isInvestor = role === "investor";
  const isTenant = role === "tenant";
  const isGuest = !role;
  const {
    importedProperties,
    interestedTenantsFor,
    hasExpressedInterest,
    expressInterestInListing,
    updateImportedProperty,
    acceptConnection,
    advanceAgreement,
  } = useListings();
  const { requireAccount } = useAuthGate();
  const navigate = useNavigate();

  const [tenantModalTenant, setTenantModalTenant] = useState<InterestedTenant | null>(null);

  const importedProperty = importedProperties.find((p) => p.id === listing.id);
  const isYours = isInvestor && listing.source === "imported";
  const analysis = importedProperty?.analysis ?? null;
  const agreement = importedProperty?.agreement ?? null;
  const interested = interestedTenantsFor(listing.id);
  // A self-published listing was always posted by the real signed-in
  // investor, whoever's looking at it right now - a random generated name
  // here is exactly the "Riverside Holdings on my own listing" bug.
  const owner =
    listing.source === "imported"
      ? namedInvestorProfile(listing.id, namesByRole.investor, listing.city, listing.accepts)
      : investorProfileFor(listing.id, listing.city, listing.accepts);
  const portal = listing.portal ?? portalFromUrl(listing.url);
  const expressed = hasExpressedInterest(listing.id);
  const canExpress = isTenant || isGuest;

  const details = propertyDetailsFor(listing.id, listing.beds, listing.type);
  const baths = importedProperty?.baths ?? Math.max(1, Math.round(listing.beds * 0.7) || 1);
  const availableDate = effectiveAvailableFrom(listing.id, listing.availableFrom);

  const agreementInvestor = selfProfile(`investor-${listing.id}`, namesByRole.investor, "Investor");
  const agreementTenantProfile = agreement
    ? agreement.tenantId === "you"
      ? selfProfile(`tenant-${listing.id}`, namesByRole.tenant, "Tenant")
      : (() => {
          const match = interested.find((t) => t.id === agreement.tenantId);
          return match ? profileFromInterestedTenant(match) : fallbackTenantProfile(agreement);
        })()
    : null;
  const viewerRole: "investor" | "tenant" = isInvestor ? "investor" : "tenant";

  function requestToProceed(tenant: InterestedTenant) {
    updateImportedProperty(listing.id, {
      agreement: {
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantInitials: tenant.initials,
        stage: "request-sent",
        startedAt: new Date().toISOString(),
      },
    });
    acceptConnection(listing.id);
  }

  const highlights = [
    {
      icon: <Icon.compass className="h-6 w-6" />,
      title: "Well-connected location",
      body: `${details.nearby[0].name} is about ${details.nearby[0].distance} away, in ${listing.city}.`,
    },
    {
      icon: <Icon.doc className="h-6 w-6" />,
      title: details.tenure,
      body: `Council tax band ${details.councilTaxBand} · EPC rating ${details.epcRating}.`,
    },
    {
      icon: <Icon.sparkle className="h-6 w-6 text-brand-blue" />,
      title: "Buynidify-analysed",
      body: analysis
        ? "AI-reviewed for rental potential, so you're not judging it on photos alone."
        : "Every listing here is screened before it reaches the marketplace.",
    },
  ];

  return (
    <PublicShell active="property">
      <div className="mx-auto max-w-5xl">
        <BackLink />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-brand-ink sm:text-[32px]">
              {listing.address}
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-brand-muted">
              <Icon.mapPin className="h-4 w-4" /> {listing.city}, UK
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {listing.url && (
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
              >
                {portal ? `View on ${portal} ↗` : "View original listing ↗"}
              </a>
            )}
            <SaveButton id={listing.id} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="relative h-[280px] w-full overflow-hidden rounded-2xl sm:h-[360px] lg:h-full">
            <img
              src={listing.imageUrl ?? propertyImage(listing.id, listing.type, 1200)}
              alt=""
              className="h-full w-full object-cover"
            />
            {portal && (
              <span className="absolute left-4 top-4 rounded-full bg-brand-blue px-3 py-1 text-xs font-bold text-brand-gold shadow-sm">
                {portal}
              </span>
            )}
          </div>
          {isYours ? (
            <YourListingCard
              profile={selfProfile(`investor-${listing.id}`, namesByRole.investor, "Investor")}
              stats={[
                { label: "Interested tenants", value: `${interested.length}` },
                {
                  label: "Deal status",
                  value: agreement
                    ? agreementSteps.find((s) => s.id === agreement.stage)?.label ?? agreement.stage
                    : "No deal yet",
                },
                { label: "Monthly rent", value: listing.monthlyRent ? `${gbp.format(listing.monthlyRent)}/mo` : "Not set" },
                {
                  label: "Availability",
                  value: availableDate
                    ? availableDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                    : "Now",
                },
              ]}
              manageTo="/app/my-properties"
              manageLabel="Manage in My Properties"
              interest={{
                count: interested.length,
                label: interested.length === 1 ? "tenant interested" : "tenants interested",
                zeroLabel: "No interest yet",
                people: interested.map((t) => ({ name: t.name, initials: t.initials, photoUrl: avatarFor(t.name) })),
                scrollToId: "interested-tenants",
              }}
            />
          ) : (
            <AgentCard
              profile={owner}
              interestCount={interested.length}
              interestLabel={interested.length === 1 ? "tenant interested" : "tenants interested"}
              interestZeroLabel="No interest yet - be the first"
              fill
              onMessage={() =>
                requireAccount({
                  title: "Message the investor",
                  message: "Buynidify introduces both sides once you have an account.",
                  action: () => navigate(`/app/messages?thread=investor-${listing.id}`),
                })
              }
            />
          )}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-brand-ink">
              {listing.beds === 0 ? "Studio" : `${listing.beds}-bedroom`} {listing.type.toLowerCase()} in {listing.city}
            </h2>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-brand-muted">
              <span className="flex items-center gap-1.5">
                <Icon.bed className="h-4 w-4" /> {listing.beds === 0 ? "Studio" : `${listing.beds} bed`}
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1.5">
                <Icon.bath className="h-4 w-4" /> {baths} bath{baths === 1 ? "" : "s"}
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1.5">
                <Icon.ruler className="h-4 w-4" /> {details.sqft.toLocaleString()} sq ft
              </span>
            </p>

            <Divider />

            <div className="space-y-5">
              {highlights.map((h) => (
                <IconRow key={h.title} icon={h.icon} title={h.title} body={h.body} />
              ))}
            </div>

            <Divider />

            <p className="text-[15px] leading-relaxed text-brand-ink">{details.blurb}</p>
            {listing.notes && <p className="mt-3 text-[15px] italic leading-relaxed text-brand-ink">"{listing.notes}"</p>}
            {listing.accepts && listing.accepts.length > 0 && (
              <p className="mt-3 text-sm text-brand-muted">
                <span className="font-semibold text-brand-ink">Accepting:</span> {listing.accepts.join(", ")}
              </p>
            )}

            <Divider />

            <h2 className="font-display text-xl font-semibold text-brand-ink">Features</h2>
            <div className="mt-4">
              <FeatureGrid items={details.amenities} />
            </div>

            <Divider />

            <h2 className="font-display text-xl font-semibold text-brand-ink">Where you'll be</h2>
            <p className="mt-1 text-sm text-brand-muted">
              {listing.city}, UK{importedProperty?.postcode ? ` · ${importedProperty.postcode}` : ""} - the exact
              address is shared once you're connected.
            </p>
            <div className="mt-4">
              <NearbyGrid items={details.nearby} />
            </div>
            <PropertyMap query={importedProperty?.postcode || `${listing.address}, ${listing.city}, UK`} />
            <a
              href={mapsHref(importedProperty?.postcode || `${listing.address}, ${listing.city}, UK`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-brand-blue hover:underline"
            >
              View on Google Maps ↗
            </a>

            {analysis && (
              <>
                <Divider />
                <AIAnalysisCard
                  summary={analysis.summary}
                  source={analysis.source ?? "demo"}
                  marketNote={`${listing.city}: ${marketFor(listing.city).summary}`}
                  metrics={
                    analysis.kind === "investor"
                      ? ([
                          {
                            key: "rent",
                            label: "Suggested monthly rent",
                            value: `${gbp.format(analysis.monthlyRent)}/mo`,
                            icon: "money",
                            featured: true,
                          },
                          { key: "gross", label: "Gross yield", value: `${analysis.grossYield.toFixed(1)}%`, icon: "trend" },
                          { key: "net", label: "Net yield", value: `${analysis.netYield.toFixed(1)}%`, icon: "scale" },
                          { key: "loc", label: "Location score", value: `${analysis.locationScore}/10`, icon: "pin" },
                          { key: "demand", label: "Rental demand", value: analysis.rentalDemand, icon: "users" },
                          { key: "let", label: "Time to let", value: analysis.timeToLet, icon: "clock" },
                          { key: "profile", label: "Tenant profile", value: analysis.tenantProfile, icon: "compass" },
                        ] satisfies AnalysisMetric[])
                      : ([
                          {
                            key: "rent",
                            label: "Suggested monthly rent",
                            value: `${gbp.format(analysis.estimatedMonthlyRent)}/mo`,
                            icon: "money",
                            featured: true,
                          },
                          { key: "deposit", label: "Est. deposit", value: gbp.format(analysis.deposit), icon: "wallet" },
                          { key: "upfront", label: "Upfront costs", value: gbp.format(analysis.upfrontCosts), icon: "scale" },
                          { key: "commute", label: "Commute", value: `${analysis.commuteScore}/10`, icon: "compass" },
                          { key: "amenities", label: "Amenities", value: `${analysis.amenitiesScore}/10`, icon: "spark" },
                          { key: "value", label: "Value for money", value: analysis.valueForMoney, icon: "trend" },
                        ] satisfies AnalysisMetric[])
                  }
                  positives={analysis.positives}
                  consider={analysis.consider}
                  suggestions={analysis.suggestions}
                />
              </>
            )}

            <Divider />

            <p className="text-xs text-brand-muted">
              Buynidify shows what it can estimate here. For the full photo gallery, floorplan and exact
              specification, use the "View on {portal ?? "the portal"}" link at the top of the page.
            </p>

            {isYours && (
              <>
                <Divider />
                <h2 id="interested-tenants" className="font-display text-xl font-semibold text-brand-ink scroll-mt-24">
                  Interested tenants <span className="text-base font-normal text-brand-muted">({interested.length})</span>
                </h2>
                {interested.length === 0 ? (
                  <p className="mt-2 text-sm text-brand-muted">No tenant interest yet.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-brand-border">
                    {interested.map((t) => (
                      <li key={t.id} className="flex flex-wrap items-center gap-3 py-3">
                        <Avatar name={t.name} initials={t.initials} photoUrl={avatarFor(t.name)} />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
                            {t.name}
                            {t.isYou && (
                              <span className="rounded-full bg-brand-blue-light px-2 py-0.5 text-[10px] font-bold text-brand-blue">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-brand-muted">
                            {t.occupation} · {t.household} · interested{" "}
                            {t.daysAgo === 0 ? "today" : `${t.daysAgo}d ago`}
                          </p>
                        </div>
                        <div className="flex flex-shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => setTenantModalTenant(t)}
                            className="rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
                          >
                            Profile &amp; message
                          </button>
                          {!agreement && (
                            <button
                              type="button"
                              onClick={() => requestToProceed(t)}
                              className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
                            >
                              Request to proceed
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {agreement &&
              agreementTenantProfile &&
              (isYours || (isTenant && agreement.tenantId === "you")) && (
                <>
                  <Divider />
                  <h2 className="font-display text-xl font-semibold text-brand-ink">Deal progress</h2>
                  <div className="mt-3">
                    <AgreementTimeline
                      agreement={agreement}
                      investor={agreementInvestor}
                      tenant={agreementTenantProfile}
                      viewerRole={viewerRole}
                      onAdvance={(by) => advanceAgreement(listing.id, by)}
                    />
                  </div>
                </>
              )}
          </div>

          <aside className="h-fit rounded-2xl border border-brand-border bg-white p-6 shadow-lg lg:sticky lg:top-24">
            <p className="font-display text-[28px] font-semibold tracking-tight text-brand-ink">
              {listing.monthlyRent ? `${gbp.format(listing.monthlyRent)}` : "Rent on request"}
              {listing.monthlyRent && <span className="text-sm font-medium text-brand-muted"> /mo</span>}
            </p>

            <div className="mt-5 rounded-xl border border-brand-border p-4">
              <p className="text-center text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                Availability
              </p>
              <div className="mt-2">
                <MiniCalendar date={availableDate} />
              </div>
              <p className="mt-2 text-center text-xs font-semibold text-brand-ink">
                {availableDate
                  ? availableDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                  : "Available now"}
              </p>
              {listing.minTenancy && (
                <p className="mt-0.5 text-center text-[11px] text-brand-muted">{listing.minTenancy} minimum tenancy</p>
              )}
            </div>

            {!isYours && canExpress && (
              <button
                type="button"
                onClick={() =>
                  requireAccount({
                    title: "Register your interest",
                    message:
                      "Investors only see real demand from verified people, so registering interest needs an account.",
                    action: () => expressInterestInListing(listing.id),
                  })
                }
                disabled={expressed}
                className={`mt-4 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  expressed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-brand-blue text-white hover:bg-brand-blue-dark"
                }`}
              >
                {expressed ? "Interested ✓" : "Express interest"}
              </button>
            )}
            {expressed && (
              <Link
                to="/app/matches"
                className="mt-2 block text-center text-[11px] font-semibold text-brand-blue hover:underline"
              >
                Track it in Matches →
              </Link>
            )}
            {isYours && (
              <Link
                to="/app/my-properties"
                className="mt-4 block rounded-lg bg-brand-blue px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
              >
                Manage in My Properties
              </Link>
            )}
            {!isYours && !canExpress && (
              <p className="mt-4 text-xs text-brand-muted">Published by another investor - browsing only.</p>
            )}

            <div className="mt-5 space-y-1.5 border-t border-brand-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-muted">Tenure</span>
                <span className="font-semibold text-brand-ink">{details.tenure}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">EPC</span>
                <span className="font-semibold text-brand-ink">{details.epcRating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Council tax</span>
                <span className="font-semibold text-brand-ink">Band {details.councilTaxBand}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {tenantModalTenant && (
        <TenantProfileModal
          tenant={tenantModalTenant}
          context={`${listing.address}, ${listing.city}`}
          propertyId={listing.id}
          onClose={() => setTenantModalTenant(null)}
        />
      )}
    </PublicShell>
  );
}


/* --- demand (a tenant's wanted property) ---------------------------------- */

function DemandDetail({ demand }: { demand: TenantDemandEntry }) {
  const { role, namesByRole } = useRole();
  const isInvestor = role === "investor";
  const isTenant = role === "tenant";
  const isGuest = !role;
  const { hasInvestorResponded, respondToDemand } = useListings();
  const { requireAccount } = useAuthGate();
  const navigate = useNavigate();

  const [connecting, setConnecting] = useState(false);

  const isYours = isTenant && demand.source === "imported";
  // Same reasoning as the investor side: a self-published home request was
  // always posted by the real signed-in tenant, not an invented one.
  const poster =
    demand.source === "imported"
      ? namedTenantProfile(demand.id, namesByRole.tenant, demand.city, {
          budget: demand.targetRentPerMonth,
          minBeds: demand.minBeds,
          household: demand.household,
        })
      : tenantProfileFor(demand.id, demand.city, demand.targetRentPerMonth, demand.minBeds);
  const a = demandAnalysis(demand);
  const portal = portalFromUrl(demand.url);
  const responded = hasInvestorResponded(demand.id);
  const canRespond = isInvestor || isGuest;

  const details = propertyDetailsFor(demand.id, demand.minBeds, demand.propertyType);
  const baths = Math.max(1, Math.round(demand.minBeds * 0.7) || 1);
  const moveInDate = effectiveAvailableFrom(demand.id, demand.moveInDate);

  const highlights = [
    {
      icon: <Icon.compass className="h-6 w-6" />,
      title: "Well-connected area",
      body: `${details.nearby[0].name} is about ${details.nearby[0].distance} away, in ${demand.city}.`,
    },
    {
      icon: <Icon.doc className="h-6 w-6" />,
      title: details.tenure,
      body: `Council tax band ${details.councilTaxBand} · EPC rating ${details.epcRating}.`,
    },
    {
      icon: <Icon.sparkle className="h-6 w-6 text-brand-blue" />,
      title: "Buynidify-analysed",
      body: "AI-reviewed for affordability and fit, so an investor isn't judging this on a bare request alone.",
    },
  ];

  function confirmConnect() {
    respondToDemand(demand.id);
    setConnecting(false);
  }

  return (
    <PublicShell active="property">
      <div className="mx-auto max-w-5xl">
        <BackLink />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-brand-ink sm:text-[32px]">
              {demand.minBeds === 0 ? "Studio" : `${demand.minBeds}-bedroom`} {demand.propertyType.toLowerCase()}{" "}
              wanted
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-brand-muted">
              <Icon.mapPin className="h-4 w-4" /> {demand.city}, UK · Tenant demand
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {demand.url && (
              <a
                href={demand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
              >
                {portal ? `View on ${portal} ↗` : "View original listing ↗"}
              </a>
            )}
            <SaveButton id={demand.id} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="relative h-[280px] w-full overflow-hidden rounded-2xl sm:h-[360px] lg:h-full">
            <img
              src={demand.imageUrl ?? propertyImage(demand.id, demand.propertyType, 1200)}
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-brand-blue px-3 py-1 text-xs font-bold text-brand-gold shadow-sm">
              Tenant demand
            </span>
          </div>
          {isYours ? (
            <YourListingCard
              profile={selfProfile(`tenant-${demand.id}`, namesByRole.tenant, "Tenant")}
              stats={[
                { label: "Investor interest", value: responded ? "Responded ✓" : "No response yet" },
                {
                  label: "Looking for",
                  value: `${demand.minBeds === 0 ? "Studio" : `${demand.minBeds}+ bed`} ${demand.propertyType}`,
                },
                { label: "Target price", value: demand.targetPrice ? gbp.format(demand.targetPrice) : "Flexible" },
                { label: "Posted", value: demand.addedDaysAgo === 0 ? "Today" : `${demand.addedDaysAgo}d ago` },
              ]}
              manageTo="/app/my-properties"
              manageLabel="Manage in My Properties"
              interest={{
                count: responded ? 1 : 0,
                label: "investor interested",
                zeroLabel: "No interest yet",
                scrollToId: "investor-interest",
              }}
            />
          ) : (
            <AgentCard
              profile={poster}
              fill
              interestCount={responded ? 1 : 0}
              interestLabel="investor interested"
              interestZeroLabel="No interest yet - be the first"
              onMessage={() =>
                requireAccount({
                  title: "Message the tenant",
                  message: "Buynidify introduces both sides once you have an account.",
                  action: () => navigate(`/app/messages?thread=tenant-${demand.id}`),
                })
              }
            />
          )}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-brand-ink">
              {demand.minBeds === 0 ? "Studio" : `${demand.minBeds}-bedroom`} {demand.propertyType.toLowerCase()} wanted in {demand.city}
            </h2>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-brand-muted">
              <span className="flex items-center gap-1.5">
                <Icon.bed className="h-4 w-4" /> {demand.minBeds === 0 ? "Studio" : `${demand.minBeds}+ beds`}
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1.5">
                <Icon.bath className="h-4 w-4" /> {baths}+ bath{baths === 1 ? "" : "s"}
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1.5">
                <Icon.ruler className="h-4 w-4" /> ~{details.sqft.toLocaleString()} sq ft
              </span>
              <span aria-hidden>·</span>
              <span>{demand.addedDaysAgo === 0 ? "Posted today" : `Posted ${demand.addedDaysAgo}d ago`}</span>
            </p>

            <Divider />

            <div className="space-y-5">
              {highlights.map((h) => (
                <IconRow key={h.title} icon={h.icon} title={h.title} body={h.body} />
              ))}
            </div>

            <Divider />

            <p className="text-[15px] leading-relaxed text-brand-ink">
              {`Looking for a ${demand.minBeds === 0 ? "studio" : `${demand.minBeds}-bedroom`} ${demand.propertyType.toLowerCase()} in ${demand.city}, ready to be bought for the right tenant.`}
            </p>
            {demand.notes && <p className="mt-3 text-[15px] italic leading-relaxed text-brand-ink">"{demand.notes}"</p>}
            {demand.household && (
              <p className="mt-3 text-sm text-brand-muted">
                <span className="font-semibold text-brand-ink">Household:</span> {demand.household}
              </p>
            )}

            <Divider />

            <h2 className="font-display text-xl font-semibold text-brand-ink">Features</h2>
            <div className="mt-4">
              <FeatureGrid items={details.amenities} />
            </div>

            <Divider />

            <h2 className="font-display text-xl font-semibold text-brand-ink">Where you'll be</h2>
            <p className="mt-1 text-sm text-brand-muted">
              {demand.city}, UK - the exact area narrows down once you're connected.
            </p>
            <div className="mt-4">
              <NearbyGrid items={details.nearby} />
            </div>
            <PropertyMap query={`${demand.city}, UK`} />
            <a
              href={mapsHref(`${demand.city}, UK`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-brand-blue hover:underline"
            >
              View on Google Maps ↗
            </a>

            <Divider />

            <AIAnalysisCard
              summary={a.summary}
              source="demo"
              marketNote={`${demand.city}: ${a.market.summary}`}
              metrics={
                [
                  {
                    key: "rent",
                    label: "Suggested monthly rent",
                    value: `${gbp.format(a.rent)}/mo`,
                    icon: "money",
                    featured: true,
                  },
                  { key: "deposit", label: "Estimated deposit", value: gbp.format(a.deposit), icon: "wallet" },
                  { key: "upfront", label: "Upfront costs", value: gbp.format(a.upfront), icon: "scale" },
                  { key: "commute", label: "Commute score", value: `${a.commute}/10`, icon: "compass" },
                  { key: "amenities", label: "Amenities score", value: `${a.amenities}/10`, icon: "spark" },
                  { key: "value", label: "Value for money", value: a.value, icon: "trend" },
                ] satisfies AnalysisMetric[]
              }
              positives={a.positives}
              consider={a.consider}
              suggestions={a.suggestions}
            />

            <Divider />

            <p className="text-xs text-brand-muted">
              Buynidify shows what it can estimate here. For the exact address and full listing detail,
              use the "View on {portal ?? "the portal"}" link at the top of the page.
            </p>

            {isYours && (
              <>
                <Divider />
                <h2 id="investor-interest" className="font-display text-xl font-semibold text-brand-ink scroll-mt-24">
                  Investor interest
                </h2>
                <p className="mt-2 text-sm text-brand-muted">
                  {responded
                    ? "An investor has responded to this request ✓"
                    : "No investor has responded yet - it stays visible to every investor on the platform."}
                </p>
              </>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-brand-border bg-white p-6 shadow-lg lg:sticky lg:top-24">
            <p className="font-display text-[28px] font-semibold tracking-tight text-brand-ink">
              {demand.targetPrice ? gbp.format(demand.targetPrice) : "Price on portal"}
            </p>
            <p className="mt-1 text-sm text-brand-muted">
              {a.rent ? `${gbp.format(a.rent)}/mo tenant will pay` : "Budget flexible"}
            </p>

            <div className="mt-5 rounded-xl border border-brand-border p-4">
              <p className="text-center text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                Wants to move in
              </p>
              <div className="mt-2">
                <MiniCalendar date={moveInDate} />
              </div>
              <p className="mt-2 text-center text-xs font-semibold text-brand-ink">
                {moveInDate
                  ? moveInDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                  : "As soon as possible"}
              </p>
              {demand.minBeds !== undefined && (
                <p className="mt-0.5 text-center text-[11px] text-brand-muted">
                  {demand.propertyType}, {demand.minBeds === 0 ? "studio" : `${demand.minBeds}+ bed`}
                </p>
              )}
            </div>

            {!isYours && canRespond && (
              <button
                type="button"
                onClick={() =>
                  requireAccount({
                    title: "Connect with this tenant",
                    message:
                      "Buynidify introduces both sides once you have an account, so we know who we're introducing.",
                    action: () => setConnecting(true),
                  })
                }
                disabled={responded}
                className={`mt-4 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  responded
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-brand-blue text-white hover:bg-brand-blue-dark"
                }`}
              >
                {responded ? "Request sent ✓" : "Connect"}
              </button>
            )}
            {responded && (
              <Link
                to="/app/matches"
                className="mt-2 block text-center text-[11px] font-semibold text-brand-blue hover:underline"
              >
                Track it in Matches →
              </Link>
            )}
            {isYours && (
              <Link
                to="/app/my-properties"
                className="mt-4 block rounded-lg bg-brand-blue px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
              >
                Manage in My Properties
              </Link>
            )}
            {!isYours && !canRespond && (
              <p className="mt-4 text-xs text-brand-muted">Posted by another tenant - browsing only.</p>
            )}

            <div className="mt-5 space-y-1.5 border-t border-brand-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-muted">Tenure sought</span>
                <span className="font-semibold text-brand-ink">{details.tenure}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">EPC</span>
                <span className="font-semibold text-brand-ink">{details.epcRating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Council tax</span>
                <span className="font-semibold text-brand-ink">Band {details.councilTaxBand}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {connecting && (
        <ConnectTenantModal
          propertyTitle={`${demand.minBeds} Bedroom ${demand.propertyType}`}
          onCancel={() => setConnecting(false)}
          onConfirm={confirmConnect}
        />
      )}
    </PublicShell>
  );
}

/* --- entry point ------------------------------------------------------------ */

export default function PropertyPage() {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const kind = searchParams.get("kind");
  const { investorListings, tenantDemand } = useListings();

  const listing = kind !== "demand" ? investorListings.find((l) => l.id === id) : undefined;
  const demand = !listing && kind !== "listing" ? tenantDemand.find((d) => d.id === id) : undefined;

  if (!listing && !demand) {
    return (
      <PublicShell active="property">
        <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-brand-border p-16 text-center">
          <p className="font-display text-lg font-semibold text-brand-ink">Property not found</p>
          <p className="mt-1 text-sm text-brand-muted">
            This listing may have been removed, or the link is out of date.
          </p>
          <Link
            to="/listings"
            className="mt-4 inline-block text-sm font-semibold text-brand-blue hover:underline"
          >
            ← Back to listings
          </Link>
        </div>
      </PublicShell>
    );
  }

  return listing ? <ListingDetail listing={listing} /> : <DemandDetail demand={demand!} />;
}
