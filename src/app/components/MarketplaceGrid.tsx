import { useState } from "react";
import { useRole } from "../context/RoleContext";
import {
  useListings,
  type Analysis,
  type InvestorListing,
  type TenantDemandEntry,
} from "../context/ListingsContext";
import { propertyImage } from "../utils/propertyImages";
import ConnectTenantModal from "./ConnectTenantModal";
import ProfilePanel from "./ProfilePanel";
import { investorProfileFor, tenantProfileFor, type PartyProfile } from "../utils/profiles";
import { Link, useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useAuthGate } from "../context/AuthGateContext";

// The marketplace cards, shared by Platform listings and Search.
//
// Both pages show the same thing from different angles: Platform listings is
// the whole marketplace with tabs, Search shows you the opposite side of the
// platform filtered by whatever you just searched for. Same cards either way,
// so interest can be expressed from wherever you happen to be.

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-brand-surface px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-brand-muted">{label}</p>
      <p className="text-sm font-semibold text-brand-ink">{value}</p>
    </div>
  );
}

// Matches the live demo's tenant analysis exactly: same fields, same
// wording, same derivation (deposit = 5 months' rent, upfront = 6).
function demandAnalysis(d: TenantDemandEntry) {
  const rent = d.targetRentPerMonth ?? Math.round(((d.targetPrice ?? 0) * 0.05) / 12 / 5) * 5;
  let h = 0;
  for (let i = 0; i < d.id.length; i++) h = (h * 31 + d.id.charCodeAt(i)) >>> 0;
  const commute = Math.round((6 + (h % 35) / 10) * 10) / 10;
  const amenities = Math.round((6 + ((h >> 3) % 35) / 10) * 10) / 10;
  const value = ["Fair", "Good", "Excellent"][h % 3];
  return {
    rent,
    deposit: rent * 5,
    upfront: rent * 6,
    commute,
    amenities,
    value,
    summary: `This ${d.minBeds}-bedroom property in ${d.city} could suit your requirements. Based on your profile, it falls within affordability guidelines.`,
    positives: [
      `${d.minBeds} bedroom${d.minBeds === 1 ? "" : "s"} offer good space for your household`,
      `${d.city} has good transport links`,
      "Property type suits long-term tenancy",
    ],
    consider: [
      "Confirm pets policy with landlord",
      "Check broadband speeds for the area",
      "Verify council tax band",
    ],
    suggestions: ["Ask about minimum lease term", "Request energy performance certificate"],
  };
}

function portalFromUrl(url?: string) {
  if (!url) return null;
  if (url.includes("rightmove")) return "Rightmove";
  if (url.includes("zoopla")) return "Zoopla";
  if (url.includes("onthemarket")) return "OnTheMarket";
  if (url.includes("primelocation")) return "PrimeLocation";
  return "Portal";
}

/* --- card furniture -------------------------------------------------------
   Big photo, then a white panel that lifts over the bottom of it: the price
   leads, the address and headline follow, and a row of icon stats closes it
   off. Same shape for both sides of the marketplace so the grid reads as one
   thing rather than two. */

function HeartButton({ id }: { id: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(id);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id)}
      aria-label={liked ? "Remove from saved" : "Save this"}
      aria-pressed={liked}
      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
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
    <div className="mt-4 flex items-center">
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

// The same AI analysis the property was imported with, shown inline so both
// sides can see the reasoning behind a listing.
function AnalysisPanel({ analysis }: { analysis: Analysis }) {
  return (
    <div className="mt-3 rounded-lg bg-brand-surface p-3">
      <p className="text-xs text-brand-ink">{analysis.summary}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {analysis.kind === "investor" ? (
          <>
            <Stat label="Est. rent" value={`${gbp.format(analysis.monthlyRent)}/mo`} />
            <Stat label="Location score" value={`${analysis.locationScore}/10`} />
            <Stat label="Rental demand" value={analysis.rentalDemand} />
            <Stat label="Time to let" value={analysis.timeToLet} />
          </>
        ) : (
          <>
            <Stat label="Est. deposit" value={gbp.format(analysis.deposit)} />
            <Stat label="Upfront costs" value={gbp.format(analysis.upfrontCosts)} />
            <Stat label="Commute" value={`${analysis.commuteScore}/10`} />
            <Stat label="Amenities" value={`${analysis.amenitiesScore}/10`} />
          </>
        )}
      </div>
      <p className="mt-2 text-[10px] italic text-brand-muted">
        AI analysis is an estimate only and does not constitute financial or legal advice.
      </p>
    </div>
  );
}

function InvestorListingCard({
  listing,
  canExpress,
  expressed,
  onExpress,
  interestedCount,
  analysis,
  onOpenProfile,
  isYours,
}: {
  listing: InvestorListing;
  canExpress: boolean;
  expressed: boolean;
  onExpress: () => void;
  interestedCount: number;
  analysis: Analysis | null;
  onOpenProfile: () => void;
  isYours: boolean;
}) {
  const owner = investorProfileFor(listing.id, listing.city);
  const rent = listing.monthlyRent;
  const [showAnalysis, setShowAnalysis] = useState(false);

  const portal = listing.portal ?? portalFromUrl(listing.url);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative h-52 w-full flex-shrink-0 overflow-hidden">
        <img
          src={listing.imageUrl ?? propertyImage(listing.id, listing.type)}
          alt={listing.type}
          loading="lazy"
          className="h-full w-full object-cover"
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

        <div className="mt-4 border-t border-brand-border pt-3">
          {isYours ? (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
              Listed by <span className="text-brand-ink">you</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenProfile}
              className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted"
            >
              Listed by{" "}
              <span className="text-brand-ink underline-offset-2 hover:underline">{owner.name}</span>
            </button>
          )}
        </div>

        {listing.accepts && listing.accepts.length > 0 && (
          <p className="mt-3 text-xs text-brand-muted">
            <span className="font-semibold text-brand-ink">Accepting:</span> {listing.accepts.join(", ")}
          </p>
        )}

        {listing.notes && <p className="mt-3 text-xs italic text-brand-muted">"{listing.notes}"</p>}

        {showAnalysis && analysis && <AnalysisPanel analysis={analysis} />}

        <div className="mt-auto pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            {!canExpress && (
              <span
                className={`text-[11px] font-semibold ${
                  interestedCount > 0 ? "text-emerald-700" : "text-brand-muted"
                }`}
              >
                {interestedCount > 0
                  ? `${interestedCount} tenant${interestedCount === 1 ? "" : "s"} interested`
                  : "No tenant interest yet"}
              </span>
            )}
            {analysis && (
              <button
                type="button"
                onClick={() => setShowAnalysis((v) => !v)}
                className="ml-auto text-[11px] font-bold uppercase tracking-wide text-brand-blue hover:underline"
              >
                {showAnalysis ? "Hide AI analysis" : "AI analysis"}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {listing.url && (
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl border border-brand-border px-4 py-2.5 text-center text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
              >
                {portal ? `View on ${portal} ↗` : "View listing ↗"}
              </a>
            )}
            {canExpress && (
              <button
                type="button"
                onClick={onExpress}
                disabled={expressed}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  expressed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-brand-blue text-white hover:bg-brand-blue-dark"
                }`}
              >
                {expressed ? "Interested ✓" : "Express interest"}
              </button>
            )}
          </div>

          {/* Registering interest used to look like nothing happened. It goes
              somewhere, so say where. */}
          {expressed && (
            <Link
              to="/app/matches"
              className="mt-2 block text-center text-[11px] font-semibold text-brand-blue hover:underline"
            >
              The investor has been told. Track it in Matches →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function TenantDemandCard({
  demand,
  canRespond,
  responded,
  onConnect,
  onOpenProfile,
}: {
  demand: TenantDemandEntry;
  canRespond: boolean;
  responded: boolean;
  onConnect: () => void;
  onOpenProfile: () => void;
}) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const poster = tenantProfileFor(demand.id, demand.city, demand.targetRentPerMonth, demand.minBeds);
  const a = demandAnalysis(demand);
  const portal = portalFromUrl(demand.url);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative h-52 w-full flex-shrink-0 overflow-hidden">
        <img
          src={propertyImage(demand.id, demand.propertyType)}
          alt={demand.propertyType}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <HeartButton id={demand.id} />
      </div>

      <div className="relative -mt-10 flex flex-1 flex-col rounded-3xl bg-white p-5">
        <p className="font-display text-2xl font-semibold tracking-tight text-brand-blue">
          {demand.targetPrice ? gbp.format(demand.targetPrice) : "Price on portal"}{" "}
          <span className="text-xs font-medium text-brand-muted">to buy</span>
        </p>
        <p className="mt-0.5 text-sm font-semibold text-brand-ink">
          {a.rent ? `${gbp.format(a.rent)}/mo` : "Budget flexible"}{" "}
          <span className="text-xs font-normal text-brand-muted">tenant will pay</span>
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
              value:
                demand.targetPrice && a.rent
                  ? `${(((a.rent * 12) / demand.targetPrice) * 100).toFixed(1)}% yield`
                  : demand.addedDaysAgo === 0
                    ? "Posted today"
                    : `${demand.addedDaysAgo}d ago`,
            },
          ]}
        />

        <div className="mt-4 border-t border-brand-border pt-3">
          <button
            type="button"
            onClick={onOpenProfile}
            className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted"
          >
            Posted by{" "}
            <span className="text-brand-ink underline-offset-2 hover:underline">{poster.name}</span>
          </button>
        </div>

        {demand.notes && <p className="mt-3 text-xs italic text-brand-muted">"{demand.notes}"</p>}

        {showAnalysis && (
          <div className="mt-3 rounded-lg bg-brand-surface p-3">
            <p className="text-xs text-brand-ink">{a.summary}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="Monthly rent" value={gbp.format(a.rent)} />
              <Stat label="Estimated deposit" value={gbp.format(a.deposit)} />
              <Stat label="Upfront costs" value={gbp.format(a.upfront)} />
              <Stat label="Commute score" value={`${a.commute}/10`} />
              <Stat label="Amenities score" value={`${a.amenities}/10`} />
              <Stat label="Value for money" value={a.value} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-emerald-700">Positives</p>
                <ul className="mt-1 space-y-0.5 text-xs text-brand-ink">
                  {a.positives.map((i) => (
                    <li key={i}>+ {i}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700">Consider</p>
                <ul className="mt-1 space-y-0.5 text-xs text-brand-ink">
                  {a.consider.map((i) => (
                    <li key={i}>− {i}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold text-brand-blue">Suggestions</p>
              <ul className="mt-1 space-y-0.5 text-xs text-brand-ink">
                {a.suggestions.map((i) => (
                  <li key={i}>→ {i}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="mb-2 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowAnalysis((v) => !v)}
              className="text-[11px] font-bold uppercase tracking-wide text-brand-blue hover:underline"
            >
              {showAnalysis ? "Hide AI analysis" : "AI analysis"}
            </button>
          </div>

          <div className="flex gap-2">
            {demand.url && (
              <a
                href={demand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl border border-brand-border px-4 py-2.5 text-center text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
              >
                {portal ? `View on ${portal} ↗` : "View listing ↗"}
              </a>
            )}
            {canRespond && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={responded}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  responded
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-brand-blue text-white hover:bg-brand-blue-dark"
                }`}
              >
                {responded ? "Request sent ✓" : "Connect"}
              </button>
            )}
          </div>

          {responded && (
            <Link
              to="/app/matches"
              className="mt-2 block text-center text-[11px] font-semibold text-brand-blue hover:underline"
            >
              The tenant has been told. Track it in Matches →
            </Link>
          )}
        </div>
      </div>

      {confirming && (
        <ConnectTenantModal
          propertyTitle={`${demand.minBeds} Bedroom ${demand.propertyType}`}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            onConnect();
            setConfirming(false);
          }}
        />
      )}
    </article>
  );
}

/** Renders one side of the marketplace and owns the profile panel, so a page
 *  only has to hand it the rows it wants shown. */
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
  const { role } = useRole();
  const isTenant = role === "tenant";
  const isInvestor = role === "investor";
  // Signed out, you still see every card and every button. Pressing one asks
  // you to join, then does what you pressed.
  const isGuest = !role;
  const { requireAccount } = useAuthGate();
  const {
    expressInterestInListing,
    hasExpressedInterest,
    interestedTenantsFor,
    respondToDemand,
    hasInvestorResponded,
    importedProperties,
  } = useListings();
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState<
    { profile: PartyProfile; context: string; connected: boolean; isYou: boolean; onConnect: () => void } | null
  >(null);

  const analysisFor = (id: string) => importedProperties.find((p) => p.id === id)?.analysis ?? null;
  const count = side === "investors" ? listings.length : demand.length;

  if (count === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {side === "investors"
          ? listings.map((listing) => (
              <InvestorListingCard
                key={listing.id}
                listing={listing}
                canExpress={isTenant || isGuest}
                expressed={hasExpressedInterest(listing.id)}
                onExpress={() =>
                  requireAccount({
                    title: "Register your interest",
                    message:
                      "Investors only see real demand from verified people, so registering interest needs an account.",
                    action: () => expressInterestInListing(listing.id),
                  })
                }
                interestedCount={interestedTenantsFor(listing.id).length}
                analysis={analysisFor(listing.id)}
                isYours={isInvestor && listing.source === "imported"}
                onOpenProfile={() =>
                  setOpenProfile({
                    profile: investorProfileFor(listing.id, listing.city, listing.accepts),
                    context: `${listing.address}, ${listing.city}`,
                    connected: hasExpressedInterest(listing.id),
                    isYou: isInvestor && listing.source === "imported",
                    onConnect: () =>
                      requireAccount({
                        title: "Register your interest",
                        message:
                          "Investors only see real demand from verified people, so registering interest needs an account.",
                        action: () => expressInterestInListing(listing.id),
                      }),
                  })
                }
              />
            ))
          : demand.map((d) => (
              <TenantDemandCard
                key={d.id}
                demand={d}
                canRespond={isInvestor || isGuest}
                responded={hasInvestorResponded(d.id)}
                onConnect={() =>
                  requireAccount({
                    title: "Connect with this tenant",
                    message:
                      "Buynidify introduces both sides once you have an account, so we know who we're introducing.",
                    action: () => respondToDemand(d.id),
                  })
                }
                onOpenProfile={() =>
                  setOpenProfile({
                    profile: tenantProfileFor(d.id, d.city, d.targetRentPerMonth, d.minBeds),
                    context: `${d.minBeds} Bedroom ${d.propertyType} wanted in ${d.city}`,
                    connected: hasInvestorResponded(d.id),
                    isYou: false,
                    onConnect: () =>
                      requireAccount({
                        title: "Connect with this tenant",
                        message:
                          "Buynidify introduces both sides once you have an account, so we know who we're introducing.",
                        action: () => respondToDemand(d.id),
                      }),
                  })
                }
              />
            ))}
      </div>

      {openProfile && (
        <ProfilePanel
          profile={openProfile.profile}
          contextLabel={openProfile.context}
          connected={openProfile.connected}
          isYou={openProfile.isYou}
          onViewYourListing={() => navigate("/app/my-properties")}
          onConnect={() => {
            openProfile.onConnect();
            setOpenProfile(null);
          }}
          onClose={() => setOpenProfile(null)}
        />
      )}
    </>
  );
}
