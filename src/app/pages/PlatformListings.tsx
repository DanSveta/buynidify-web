import { useMemo, useState } from "react";
import { useRole } from "../context/RoleContext";
import {
  useListings,
  type Analysis,
  type InvestorListing,
  type TenantDemandEntry,
} from "../context/ListingsContext";
import { propertyImage } from "../utils/propertyImages";
import ConnectTenantModal from "../components/ConnectTenantModal";
import ProfilePanel from "../components/ProfilePanel";
import { investorProfileFor, tenantProfileFor, type PartyProfile } from "../utils/profiles";
import { useNavigate } from "react-router-dom";

// Mirrors the live product's /marketplace page: one place showing both
// sides of the platform - what investors have published, and what tenants
// are looking for. Every card says where it came from, links out to the
// original portal listing, and can expand the AI analysis that was run on it.

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const bedroomFilters = ["Any bedrooms", "1+", "2+", "3+", "4+"];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-brand-surface px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-brand-muted">{label}</p>
      <p className="text-sm font-semibold text-brand-ink">{value}</p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-brand-surface px-2.5 py-1 text-[11px] font-medium text-brand-muted">
      {children}
    </span>
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

// Photo header shared by both card types: image matched to the property
// type, side badge for who posted it, and the source portal named on the
// image itself so you can always tell where a listing came from.
function CardPhoto({
  id,
  type,
  side,
  portal,
  yours,
}: {
  id: string;
  type: string;
  side: "Investor" | "Tenant";
  portal: string | null;
  yours?: boolean;
}) {
  return (
    <div className="relative h-40 w-full overflow-hidden bg-brand-surface">
      <img
        src={propertyImage(id, type)}
        alt={type}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <span
        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${
          side === "Investor" ? "bg-brand-blue text-white" : "bg-brand-gold text-brand-ink"
        }`}
      >
        {side}
      </span>
      {portal && (
        <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          via {portal}
        </span>
      )}
      {yours && (
        <span className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-brand-blue shadow">
          Your listing
        </span>
      )}
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

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardPhoto
        id={listing.id}
        type={listing.type}
        side="Investor"
        portal={listing.portal ?? portalFromUrl(listing.url)}
        yours={isYours}
      />
      <div className="p-5">
        <h3 className="font-display text-base font-semibold text-brand-ink">{listing.address}</h3>
        <p className="text-sm text-brand-muted">{listing.city}, UK</p>

        <button
          type="button"
          onClick={onOpenProfile}
          className="mt-3 flex w-full items-center gap-2 rounded-lg bg-brand-surface p-2 text-left transition-colors hover:bg-brand-blue-light"
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white">
            {isYours ? "YOU" : owner.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-brand-ink">
              {isYours ? "Your listing" : owner.name}
            </span>
            <span className="block text-[11px] text-brand-muted">
              {isYours ? "Tap to manage" : `${owner.role} · view profile`}
            </span>
          </span>
        </button>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Beds" value={listing.beds === 0 ? "Studio" : `${listing.beds} bed`} />
          <Stat label="Monthly rent" value={rent ? `${gbp.format(rent)}/mo` : "On request"} />
          <Stat label="Type" value={listing.type} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip>{listing.type}</Chip>
          {listing.minTenancy && <Chip>Min {listing.minTenancy}</Chip>}
          {listing.availableFrom && <Chip>From {listing.availableFrom}</Chip>}
        </div>

        {listing.accepts && listing.accepts.length > 0 && (
          <p className="mt-3 text-xs text-brand-muted">
            <span className="font-semibold text-brand-ink">Accepting:</span> {listing.accepts.join(", ")}
          </p>
        )}

        {listing.notes && <p className="mt-3 text-xs italic text-brand-muted">"{listing.notes}"</p>}

        {analysis && (
          <button
            type="button"
            onClick={() => setShowAnalysis((v) => !v)}
            className="mt-3 text-xs font-semibold text-brand-blue hover:underline"
          >
            {showAnalysis ? "Hide AI analysis" : "View AI analysis"}
          </button>
        )}
        {showAnalysis && analysis && <AnalysisPanel analysis={analysis} />}

        <div className="mt-4 flex flex-col gap-2">
          {listing.url && (
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-lg border border-brand-border px-4 py-2.5 text-center text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              View listing ↗
            </a>
          )}
          {canExpress ? (
            <button
              type="button"
              onClick={onExpress}
              disabled={expressed}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                expressed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-brand-blue text-white hover:bg-brand-blue-dark"
              }`}
            >
              {expressed ? "Interest registered ✓" : "Express interest"}
            </button>
          ) : (
            <p className="text-xs font-medium text-brand-muted">
              {interestedCount > 0
                ? `${interestedCount} tenant${interestedCount === 1 ? "" : "s"} interested`
                : "No tenant interest yet"}
            </p>
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
    <article className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardPhoto id={demand.id} type={demand.propertyType} side="Tenant" portal={portal} />
      <div className="p-5">
        <h3 className="font-display text-base font-semibold text-brand-ink">
          {demand.minBeds} Bedroom {demand.propertyType}
        </h3>
        <p className="text-sm text-brand-muted">{demand.city}, UK</p>

        <button
          type="button"
          onClick={onOpenProfile}
          className="mt-3 flex w-full items-center gap-2 rounded-lg bg-brand-surface p-2 text-left transition-colors hover:bg-brand-blue-light"
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-ink">
            {poster.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-brand-ink">{poster.name}</span>
            <span className="block text-[11px] text-brand-muted">Tenant · view profile</span>
          </span>
        </button>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Beds" value={demand.minBeds === 0 ? "Studio" : `${demand.minBeds} bed`} />
          <Stat label="Budget" value={a.rent ? `${gbp.format(a.rent)}/mo` : "Flexible"} />
          <Stat label="Type" value={demand.propertyType} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip>{demand.propertyType}</Chip>
          <Chip>Tenant looking</Chip>
          <Chip>Added {demand.addedDaysAgo === 0 ? "today" : `${demand.addedDaysAgo}d ago`}</Chip>
        </div>

        {demand.notes && <p className="mt-3 text-xs italic text-brand-muted">"{demand.notes}"</p>}

        <button
          type="button"
          onClick={() => setShowAnalysis((v) => !v)}
          className="mt-3 text-xs font-semibold text-brand-blue hover:underline"
        >
          {showAnalysis ? "Hide AI analysis" : "View AI analysis"}
        </button>

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

        <div className="mt-4 flex flex-col gap-2">
          {demand.url && (
            <a
              href={demand.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-lg border border-brand-border px-4 py-2.5 text-center text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              View listing ↗
            </a>
          )}
          {canRespond && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={responded}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                responded
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-brand-blue text-white hover:bg-brand-blue-dark"
              }`}
            >
              {responded ? "Connection request sent ✓" : "Connect via Buynidify"}
            </button>
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

export default function PlatformListings() {
  const { role } = useRole();
  const isTenant = role === "tenant";
  const isInvestor = role === "investor";
  const {
    investorListings,
    tenantDemand,
    expressInterestInListing,
    hasExpressedInterest,
    interestedTenantsFor,
    respondToDemand,
    hasInvestorResponded,
    importedProperties,
  } = useListings();

  // The AI analysis that was run when the link was pasted, keyed by id so
  // either side can expand it from the marketplace card.
  const analysisFor = (id: string) => importedProperties.find((p) => p.id === id)?.analysis ?? null;

  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState<
    { profile: PartyProfile; context: string; connected: boolean; isYou: boolean; onConnect: () => void } | null
  >(null);
  const [tab, setTab] = useState<"investors" | "tenants">("investors");
  const [query, setQuery] = useState("");
  const [bedFilter, setBedFilter] = useState(bedroomFilters[0]);

  const minBeds = bedFilter === bedroomFilters[0] ? 0 : parseInt(bedFilter, 10);
  const q = query.trim().toLowerCase();

  const filteredListings = useMemo(
    () =>
      investorListings.filter((l) => {
        if (l.beds < minBeds) return false;
        if (!q) return true;
        return `${l.address} ${l.city} ${l.type}`.toLowerCase().includes(q);
      }),
    [investorListings, minBeds, q]
  );

  const filteredDemand = useMemo(
    () =>
      tenantDemand.filter((d) => {
        if (d.minBeds < minBeds) return false;
        if (!q) return true;
        return `${d.city} ${d.propertyType} ${d.notes}`.toLowerCase().includes(q);
      }),
    [tenantDemand, minBeds, q]
  );

  const shown = tab === "investors" ? filteredListings.length : filteredDemand.length;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">Platform listings</h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        Browse properties published by investors and rental requirements from tenants. Express your
        interest and Buynidify coordinates the rest.
      </p>

      {/* Both sides of the marketplace, with live counts. */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setTab("investors")}
          className={`rounded-xl border px-4 py-3 text-left transition-colors ${
            tab === "investors"
              ? "border-brand-blue bg-brand-blue-light"
              : "border-brand-border bg-white hover:border-brand-blue"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
            From investors
            <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[11px] font-bold text-white">
              {investorListings.length}
            </span>
          </span>
          <span className="block text-xs text-brand-muted">Properties available to rent</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("tenants")}
          className={`rounded-xl border px-4 py-3 text-left transition-colors ${
            tab === "tenants"
              ? "border-brand-blue bg-brand-blue-light"
              : "border-brand-border bg-white hover:border-brand-blue"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
            From tenants
            <span className="rounded-full bg-brand-gold px-2 py-0.5 text-[11px] font-bold text-brand-ink">
              {tenantDemand.length}
            </span>
          </span>
          <span className="block text-xs text-brand-muted">What people are looking for</span>
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by location or property name..."
          className="flex-1 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
        />
        <select
          value={bedFilter}
          onChange={(e) => setBedFilter(e.target.value)}
          className="rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue sm:w-48"
        >
          {bedroomFilters.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-sm text-brand-muted">
        {shown} listing{shown === 1 ? "" : "s"} found
      </p>

      {shown === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
          Nothing matches that search yet.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tab === "investors"
            ? filteredListings.map((listing) => (
                <InvestorListingCard
                  key={listing.id}
                  listing={listing}
                  canExpress={isTenant}
                  expressed={hasExpressedInterest(listing.id)}
                  onExpress={() => expressInterestInListing(listing.id)}
                  interestedCount={interestedTenantsFor(listing.id).length}
                  analysis={analysisFor(listing.id)}
                  isYours={isInvestor && listing.source === "imported"}
                  onOpenProfile={() =>
                    setOpenProfile({
                      profile: investorProfileFor(listing.id, listing.city, listing.accepts),
                      context: `${listing.address}, ${listing.city}`,
                      connected: hasExpressedInterest(listing.id),
                      isYou: isInvestor && listing.source === "imported",
                      onConnect: () => expressInterestInListing(listing.id),
                    })
                  }
                />
              ))
            : filteredDemand.map((demand) => (
                <TenantDemandCard
                  key={demand.id}
                  demand={demand}
                  canRespond={isInvestor}
                  responded={hasInvestorResponded(demand.id)}
                  onConnect={() => respondToDemand(demand.id)}
                  onOpenProfile={() =>
                    setOpenProfile({
                      profile: tenantProfileFor(demand.id, demand.city, demand.targetRentPerMonth, demand.minBeds),
                      context: `${demand.minBeds} Bedroom ${demand.propertyType} wanted in ${demand.city}`,
                      connected: hasInvestorResponded(demand.id),
                      isYou: false,
                      onConnect: () => respondToDemand(demand.id),
                    })
                  }
                />
              ))}
        </div>
      )}

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
    </div>
  );
}
