import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import {
  useListings,
  type ImportedProperty,
  type InterestedTenant,
} from "../context/ListingsContext";
import TenantProfileModal from "../components/TenantProfileModal";
import PublishModal from "../components/PublishModal";
import PublishDemandModal from "../components/PublishDemandModal";
import AgreementTimeline from "../components/AgreementTimeline";
import { buildInvestorAnalysis, buildBuyerAnalysis } from "../utils/analysis";
import { runAiAnalysis } from "../utils/aiAnalysis";
import { PurchaseAnalysisCard } from "../components/PurchaseAnalysisCard";
import type { AnalysisMetric } from "../components/AIAnalysisCard";
import { suggestedRent, marketFor } from "../../data/ukMarketData";
import { propertyDetailsFor } from "../utils/propertyDetails";
import { propertyImage } from "../utils/propertyImages";
import { useAuthGate } from "../context/AuthGateContext";
import Avatar from "../components/Avatar";
import { avatarFor } from "../utils/avatars";
import { selfProfile, profileFromInterestedTenant, type PartyProfile } from "../utils/profiles";

// My Properties is the investor's control room for properties they've already
// added. Adding one happens on Search, where you're looking for them anyway.
//
// The lifecycle follows PRODUCT.md: the investor has NOT bought the property,
// so there are no viewings. They test demand first, request to proceed with a
// tenant they like, and the Buynidify team takes it from there:
//
//   Added -> Analysed -> Published -> Interest -> Request sent -> Matched ->
//   Terms agreed -> Agreement signed -> Deposit secured -> Purchase ->
//   Tenancy prep -> Moved in

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

type Status = "draft" | "analysed" | "live" | "interest" | "agreement" | "let";

const statusMeta: Record<Status, { label: string; className: string }> = {
  draft: { label: "Not analysed", className: "bg-brand-surface text-brand-muted" },
  analysed: { label: "Not published", className: "bg-brand-gold/20 text-brand-gold-dark" },
  live: { label: "Live to tenants", className: "bg-brand-blue-light text-brand-blue" },
  interest: { label: "Tenants interested", className: "bg-emerald-100 text-emerald-700" },
  agreement: { label: "In progress", className: "bg-brand-ink text-white" },
  let: { label: "Tenanted", className: "bg-emerald-600 text-white" },
};

function statusOf(p: ImportedProperty, interestedCount: number): Status {
  if (p.agreement?.stage === "tenancy-active") return "let";
  if (p.agreement) return "agreement";
  if (p.published && interestedCount > 0) return "interest";
  if (p.published) return "live";
  if (p.analysis) return "analysed";
  return "draft";
}

/** The one thing to do next, or null when nothing is waiting on you. */
function nextAction(status: Status): string | null {
  switch (status) {
    case "draft":
      return "Run the AI analysis";
    case "analysed":
      return "Publish it to tenants";
    case "interest":
      return "Review interested tenants";
    case "agreement":
      return "Check progress";
    default:
      return null;
  }
}

const filters = [
  { id: "all", label: "All" },
  { id: "action", label: "Action needed" },
  { id: "draft", label: "Not published" },
  { id: "live", label: "Live" },
  { id: "interest", label: "With interest" },
  { id: "agreement", label: "Agreements" },
] as const;

type FilterId = (typeof filters)[number]["id"];

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-brand-surface px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-brand-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-brand-ink">{value}</p>
    </div>
  );
}

function TenantRow({
  tenant,
  canSelect,
  onOpen,
  onSelect,
}: {
  tenant: InterestedTenant;
  canSelect: boolean;
  onOpen: () => void;
  onSelect: () => void;
}) {
  const verified = tenant.referencing === "Verified";
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-brand-border py-3 last:border-0">
      <Avatar name={tenant.name} initials={tenant.initials} photoUrl={avatarFor(tenant.name)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-sm font-semibold text-brand-ink">{tenant.name}</p>
          {tenant.isYou && (
            <span className="rounded-full bg-brand-blue-light px-2 py-0.5 text-[10px] font-bold text-brand-blue">
              You
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              verified ? "bg-emerald-100 text-emerald-700" : "bg-brand-gold/20 text-brand-gold-dark"
            }`}
          >
            {verified ? "Referenced" : "Referencing in progress"}
          </span>
        </div>
        <p className="text-[11px] text-brand-muted">
          {tenant.occupation} · {tenant.household} · from {tenant.movingFrom} · interested{" "}
          {tenant.daysAgo === 0 ? "today" : `${tenant.daysAgo}d ago`}
        </p>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
        >
          Profile & message
        </button>
        {canSelect && (
          <button
            type="button"
            onClick={onSelect}
            className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Request to proceed
          </button>
        )}
      </div>
    </li>
  );
}

function PropertyCard({
  property,
  interested,
  onOpenTenant,
}: {
  property: ImportedProperty;
  interested: InterestedTenant[];
  onOpenTenant: (tenant: InterestedTenant) => void;
}) {
  const { updateImportedProperty, removeImportedProperty, advanceAgreement, acceptConnection } =
    useListings();
  const { namesByRole } = useRole();
  const { requireAccount } = useAuthGate();
  const [open, setOpen] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const status = statusOf(property, interested.length);
  const action = nextAction(status);
  const analysis = property.analysis?.kind === "investor" ? property.analysis : null;
  const rent = property.published?.rent ?? analysis?.monthlyRent;
  const verifiedCount = interested.filter((t) => t.referencing === "Verified").length;

  // The tenant side of the agreement panel: your own tenant persona when
  // that's who it is (the usual case, walking the demo end to end yourself),
  // otherwise built from whichever interested tenant was picked, so their
  // real details show instead of just a name and initials.
  const agreementTenant: PartyProfile | null = property.agreement
    ? property.agreement.tenantId === "you"
      ? selfProfile(`tenant-${property.id}`, namesByRole.tenant, "Tenant")
      : (() => {
          const match = interested.find((t) => t.id === property.agreement!.tenantId);
          return match
            ? profileFromInterestedTenant(match)
            : {
                id: `tenant-${property.agreement!.tenantId}`,
                name: property.agreement!.tenantName,
                initials: property.agreement!.tenantInitials,
                role: "Tenant" as const,
                location: "",
                memberSince: "",
                responseTime: "",
                responseRate: "",
                photoUrl: avatarFor(property.agreement!.tenantName),
                verified: { idCheck: true, referencing: true, funds: true },
                about: "",
                details: [],
              };
        })()
    : null;

  async function runAnalysis() {
    setAnalysing(true);
    // Tries the real model first (same call PropertyLinkImporter uses) and
    // only falls back to the researched estimate if no key is configured or
    // the call fails - before this, My Properties skipped straight to the
    // fallback every time, so "Run AI analysis" here never actually asked
    // the model anything.
    const result = await runAiAnalysis(property, "investor");
    const analysis = result.ok ? result.analysis : buildInvestorAnalysis(property);
    updateImportedProperty(property.id, { analysis, showAnalysis: true });
    setAnalysing(false);
    setOpen(true);
  }

  function requestToProceed(tenant: InterestedTenant) {
    updateImportedProperty(property.id, {
      agreement: {
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantInitials: tenant.initials,
        stage: "request-sent",
        startedAt: new Date().toISOString(),
      },
    });
    // This tenant's interest is exactly what's being accepted by starting
    // the agreement - without this, Mutual Matches kept showing it as still
    // "waiting for your reply" even after the deal had already moved on.
    acceptConnection(property.id);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-border bg-white">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <img
          src={property.imageUrl ?? propertyImage(property.id, property.type)}
          alt={property.type}
          loading="lazy"
          className="h-28 w-full flex-shrink-0 rounded-xl object-cover sm:h-20 sm:w-28"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusMeta[status].className}`}
            >
              {statusMeta[status].label}
            </span>
            <span className="text-[11px] text-brand-muted">via {property.portal}</span>
          </div>
          <h3 className="mt-1 font-display text-base font-semibold text-brand-ink">
            {property.title}
          </h3>
          <p className="text-sm text-brand-muted">
            {property.location} · {gbp.format(property.price)}
            {rent ? ` · ${gbp.format(rent)}/mo` : ""}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {action && (
            <span className="hidden text-[11px] font-semibold text-brand-gold-dark lg:block">
              {action}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
          >
            {open ? "Hide details" : "Details"}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-brand-border p-5">
          {/* Key figures */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="Asking price" value={gbp.format(property.price)} />
            <Metric label="Bedrooms" value={property.beds === 0 ? "Studio" : `${property.beds}`} />
            <Metric label="Type" value={property.type} />
            <Metric label="Monthly rent" value={rent ? `${gbp.format(rent)}/mo` : "Not set"} />
            {analysis && (
              <>
                <Metric label="Gross yield" value={`${analysis.grossYield.toFixed(1)}%`} />
                <Metric label="Net yield" value={`${analysis.netYield.toFixed(1)}%`} />
                <Metric label="Rental demand" value={analysis.rentalDemand} />
                <Metric label="Time to let" value={analysis.timeToLet} />
              </>
            )}
            {property.published && (
              <>
                <Metric label="Available from" value={property.published.availableFrom || "Now"} />
                <Metric label="Minimum tenancy" value={property.published.minTenancy} />
              </>
            )}
          </div>

          {property.published?.accepts && property.published.accepts.length > 0 && (
            <p className="mt-3 text-xs text-brand-muted">
              <span className="font-semibold text-brand-ink">Accepting:</span>{" "}
              {property.published.accepts.join(", ")}
            </p>
          )}
          {property.published?.notes && (
            <p className="mt-1 text-xs italic text-brand-muted">"{property.published.notes}"</p>
          )}

          {/* AI analysis */}
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wide text-brand-muted">
              AI analysis
            </h4>
            {analysis ? (
              <div className="mt-2">
                <PurchaseAnalysisCard
                  summary={analysis.summary}
                  source={analysis.source ?? "demo"}
                  price={property.price}
                  monthlyRent={analysis.monthlyRent}
                  sqft={propertyDetailsFor(property.id, property.beds, property.type).sqft}
                  cityLabel={property.location}
                  marketYieldRange={marketFor(property.location).yieldRange}
                  marketSummary={marketFor(property.location).summary}
                  positives={analysis.positives}
                  consider={analysis.consider}
                  suggestions={analysis.suggestions}
                  otherMetrics={
                    [
                      { key: "net", label: "Net yield", value: `${analysis.netYield.toFixed(1)}%`, icon: "scale" },
                      { key: "loc", label: "Location score", value: `${analysis.locationScore}/10`, icon: "pin" },
                      { key: "demand", label: "Rental demand", value: analysis.rentalDemand, icon: "users" },
                      { key: "let", label: "Time to let", value: analysis.timeToLet, icon: "clock" },
                      { key: "profile", label: "Tenant profile", value: analysis.tenantProfile, icon: "compass" },
                    ] satisfies AnalysisMetric[]
                  }
                />
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-brand-surface p-4">
                <p className="flex-1 text-sm text-brand-muted">
                  Not analysed yet. The analysis estimates the rent, yield and how quickly it is
                  likely to let.
                </p>
                <button
                  type="button"
                  onClick={runAnalysis}
                  disabled={analysing}
                  className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
                >
                  {analysing ? "Analysing..." : "Run AI analysis"}
                </button>
              </div>
            )}
          </div>

          {/* Interested tenants */}
          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-brand-muted">
                Interested tenants
              </h4>
              {interested.length > 0 && (
                <span className="text-[11px] text-brand-muted">
                  {interested.length} interested · {verifiedCount} fully referenced
                </span>
              )}
            </div>

            {!property.published ? (
              <p className="mt-2 rounded-xl bg-brand-surface p-4 text-sm text-brand-muted">
                Publish this property to tenants and interest will appear here.
              </p>
            ) : interested.length === 0 ? (
              <p className="mt-2 rounded-xl bg-brand-surface p-4 text-sm text-brand-muted">
                Live to tenants, no interest registered yet.
              </p>
            ) : (
              <ul className="mt-1">
                {interested.map((t) => (
                  <TenantRow
                    key={t.id}
                    tenant={t}
                    canSelect={!property.agreement}
                    onOpen={() => onOpenTenant(t)}
                    onSelect={() =>
                      requireAccount({
                        title: "Ask to proceed",
                        message:
                          "Buynidify contacts the tenant on your behalf, so we need your account and verification first.",
                        action: () => requestToProceed(t),
                      })
                    }
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Agreement */}
          {property.agreement && agreementTenant && (
            <div className="mt-5">
              <AgreementTimeline
                agreement={property.agreement}
                investor={selfProfile(`investor-${property.id}`, namesByRole.investor, "Investor")}
                tenant={agreementTenant}
                viewerRole="investor"
                onAdvance={(by) => advanceAgreement(property.id, by)}
                property={{
                  title: property.title,
                  location: property.location,
                  imageUrl: property.imageUrl,
                  price: property.price,
                }}
              />
              <button
                type="button"
                onClick={() => updateImportedProperty(property.id, { agreement: null })}
                className="mt-2 text-[11px] font-semibold text-brand-muted hover:text-red-600"
              >
                Withdraw this agreement
              </button>
            </div>
          )}

          {/* Property actions */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-brand-border pt-4">
            {!property.agreement && (
              <button
                type="button"
                onClick={() =>
                  requireAccount({
                    title: "Publish to tenants",
                    message:
                      "Publishing puts your proposal in front of real tenants, so it needs a verified account.",
                    action: () => setPublishing(true),
                  })
                }
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  property.published
                    ? "border border-brand-border text-brand-ink hover:border-brand-blue hover:text-brand-blue"
                    : "bg-brand-blue text-white hover:bg-brand-blue-dark"
                }`}
              >
                {property.published ? "Update terms" : "Publish to tenants"}
              </button>
            )}
            <a
              href={property.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              View on {property.portal} ↗
            </a>
            <button
              type="button"
              onClick={() => removeImportedProperty(property.id)}
              className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-brand-muted transition-colors hover:text-red-600"
            >
              Remove property
            </button>
          </div>
        </div>
      )}

      {publishing && (
        <PublishModal
          property={property}
          defaultRent={analysis?.monthlyRent ?? suggestedRent(property.location, property.beds)}
          existing={property.published}
          onCancel={() => setPublishing(false)}
          onPublish={(details) => {
            updateImportedProperty(property.id, { published: details });
            setPublishing(false);
            setOpen(true);
          }}
        />
      )}
    </article>
  );
}

function MyPropertiesInvestor() {
  const { role } = useRole();
  const { promptSignUp } = useAuthGate();
  const { importedProperties, interestedTenantsFor } = useListings();
  const [openTenant, setOpenTenant] = useState<
    { tenant: InterestedTenant; context: string; propertyId: string } | null
  >(null);
  const [filter, setFilter] = useState<FilterId>("all");
  // Signed out the search lives at /search rather than inside the portal, so
  // every link back to it has to follow.
  const searchPath = role ? "/app/search" : "/search";

  // Signed out, this page shows what you've analysed while browsing.
  const mine = useMemo(
    () => importedProperties.filter((p) => p.owner === (role ? "investor" : "guest")),
    [importedProperties, role]
  );

  const withStatus = useMemo(
    () =>
      mine.map((p) => {
        const interested = interestedTenantsFor(p.id);
        return { property: p, interested, status: statusOf(p, interested.length) };
      }),
    [mine, interestedTenantsFor]
  );

  const counts = {
    all: withStatus.length,
    action: withStatus.filter((x) => nextAction(x.status)).length,
    draft: withStatus.filter((x) => !x.property.published).length,
    live: withStatus.filter((x) => x.property.published && !x.property.agreement).length,
    interest: withStatus.filter((x) => x.interested.length > 0 && x.property.published).length,
    agreement: withStatus.filter((x) => !!x.property.agreement).length,
  };

  const shown = withStatus.filter((x) => {
    switch (filter) {
      case "action":
        return !!nextAction(x.status);
      case "draft":
        return !x.property.published;
      case "live":
        return !!x.property.published && !x.property.agreement;
      case "interest":
        return x.interested.length > 0 && !!x.property.published;
      case "agreement":
        return !!x.property.agreement;
      default:
        return true;
    }
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        My Properties
      </h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        Everything you've added, from first link to signed tenancy. Run the analysis, publish to
        tenants, then request to proceed with someone who's interested.
      </p>

      {!role && mine.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border bg-white p-4">
          <p className="text-sm text-brand-muted">
            You're browsing without an account. These are yours to keep, and publishing them to
            tenants is the only step that needs you to join.
          </p>
          <button
            type="button"
            onClick={promptSignUp}
            className="flex-shrink-0 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Create account
          </button>
        </div>
      )}

      <Link
        to={searchPath}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
      >
        + Add a property
      </Link>

      {/* Pipeline summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Properties" value={`${counts.all}`} />
        <Metric label="Live to tenants" value={`${counts.live}`} />
        <Metric label="With interest" value={`${counts.interest}`} />
        <Metric label="Agreements" value={`${counts.agreement}`} />
      </div>

      {/* Filters */}
      <nav className="mt-5 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-brand-border bg-white text-brand-muted hover:border-brand-blue hover:text-brand-blue"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${active ? "text-white/70" : "text-brand-muted"}`}>
                {counts[f.id]}
              </span>
            </button>
          );
        })}
      </nav>

      {shown.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
          {mine.length === 0 ? (
            <>
              No properties yet. Add one from{" "}
              <Link to={searchPath} className="font-semibold text-brand-blue hover:underline">
                Search Properties
              </Link>{" "}
              by pasting a Rightmove, Zoopla or OnTheMarket link.
            </>
          ) : (
            "Nothing in this view right now."
          )}
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          {shown.map(({ property, interested }) => (
            <PropertyCard
              key={property.id}
              property={property}
              interested={interested}
              onOpenTenant={(tenant) =>
                setOpenTenant({
                  tenant,
                  context: `${property.title}, ${property.location}`,
                  propertyId: property.id,
                })
              }
            />
          ))}
        </div>
      )}

      {openTenant && (
        <TenantProfileModal
          tenant={openTenant.tenant}
          context={openTenant.context}
          propertyId={openTenant.propertyId}
          onClose={() => setOpenTenant(null)}
        />
      )}
    </div>
  );
}

type DemandStatus = "draft" | "analysed" | "live" | "interest";

const demandStatusMeta: Record<DemandStatus, { label: string; className: string }> = {
  draft: { label: "Not analysed", className: "bg-brand-surface text-brand-muted" },
  analysed: { label: "Not published", className: "bg-brand-gold/20 text-brand-gold-dark" },
  live: { label: "Live to investors", className: "bg-brand-blue-light text-brand-blue" },
  interest: { label: "Investor interested", className: "bg-emerald-100 text-emerald-700" },
};

function demandStatusOf(p: ImportedProperty, responded: boolean): DemandStatus {
  if (p.published && responded) return "interest";
  if (p.published) return "live";
  if (p.analysis) return "analysed";
  return "draft";
}

function demandNextAction(status: DemandStatus): string | null {
  switch (status) {
    case "draft":
      return "Run the AI analysis";
    case "analysed":
      return "Publish it to investors";
    case "interest":
      return "An investor is interested";
    default:
      return null;
  }
}

const demandFilters = [
  { id: "all", label: "All" },
  { id: "action", label: "Action needed" },
  { id: "draft", label: "Not published" },
  { id: "live", label: "Live" },
  { id: "interest", label: "With interest" },
] as const;

type DemandFilterId = (typeof demandFilters)[number]["id"];

function TenantPropertyCard({ property }: { property: ImportedProperty }) {
  const { updateImportedProperty, removeImportedProperty, hasInvestorResponded } = useListings();
  const { requireAccount } = useAuthGate();
  const [open, setOpen] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const responded = hasInvestorResponded(property.id);
  const status = demandStatusOf(property, responded);
  const action = demandNextAction(status);
  const analysis = property.analysis?.kind === "buyer" ? property.analysis : null;
  const rent = property.published?.rent;

  async function runAnalysis() {
    setAnalysing(true);
    const result = await runAiAnalysis(property, "buyer");
    const analysis = result.ok ? result.analysis : buildBuyerAnalysis(property);
    updateImportedProperty(property.id, { analysis, showAnalysis: true });
    setAnalysing(false);
    setOpen(true);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-border bg-white">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <img
          src={property.imageUrl ?? propertyImage(property.id, property.type)}
          alt={property.type}
          loading="lazy"
          className="h-28 w-full flex-shrink-0 rounded-xl object-cover sm:h-20 sm:w-28"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${demandStatusMeta[status].className}`}
            >
              {demandStatusMeta[status].label}
            </span>
            <span className="text-[11px] text-brand-muted">via {property.portal}</span>
          </div>
          <h3 className="mt-1 font-display text-base font-semibold text-brand-ink">
            {property.title}
          </h3>
          <p className="text-sm text-brand-muted">
            {property.location} · {gbp.format(property.price)}
            {rent ? ` · target ${gbp.format(rent)}/mo` : ""}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {action && (
            <span className="hidden text-[11px] font-semibold text-brand-gold-dark lg:block">
              {action}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
          >
            {open ? "Hide details" : "Details"}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-brand-border p-5">
          {/* Key figures */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="Listed price" value={gbp.format(property.price)} />
            <Metric label="Bedrooms" value={property.beds === 0 ? "Studio" : `${property.beds}`} />
            <Metric label="Type" value={property.type} />
            <Metric label="Target rent" value={rent ? `${gbp.format(rent)}/mo` : "Not set"} />
            {property.published && (
              <>
                <Metric label="Move in from" value={property.published.availableFrom || "Now"} />
                <Metric label="Length of stay" value={property.published.minTenancy} />
              </>
            )}
          </div>

          {property.published?.householdType && (
            <p className="mt-3 text-xs text-brand-muted">
              <span className="font-semibold text-brand-ink">Household:</span>{" "}
              {property.published.householdType}
              {property.published.occupants
                ? ` · ${property.published.occupants} ${property.published.occupants === 1 ? "person" : "people"}`
                : ""}
              {` · ${property.published.pets ? "has pets" : "no pets"}`}
              {` · ${property.published.smoker ? "smoker" : "non-smoker"}`}
            </p>
          )}
          {property.published?.notes && (
            <p className="mt-1 text-xs italic text-brand-muted">"{property.published.notes}"</p>
          )}

          {/* AI analysis */}
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wide text-brand-muted">
              AI analysis
            </h4>
            {analysis ? (
              <div className="mt-2">
                <PurchaseAnalysisCard
                  summary={analysis.summary}
                  source={analysis.source ?? "demo"}
                  price={property.price}
                  monthlyRent={analysis.estimatedMonthlyRent}
                  sqft={propertyDetailsFor(property.id, property.beds, property.type).sqft}
                  cityLabel={property.location}
                  marketYieldRange={marketFor(property.location).yieldRange}
                  marketSummary={marketFor(property.location).summary}
                  positives={analysis.positives}
                  consider={analysis.consider}
                  suggestions={analysis.suggestions}
                  otherMetrics={
                    [
                      { key: "deposit", label: "Est. deposit", value: gbp.format(analysis.deposit), icon: "wallet" },
                      { key: "upfront", label: "Upfront costs", value: gbp.format(analysis.upfrontCosts), icon: "scale" },
                      { key: "commute", label: "Commute", value: `${analysis.commuteScore}/10`, icon: "compass" },
                      { key: "amenities", label: "Amenities", value: `${analysis.amenitiesScore}/10`, icon: "spark" },
                      { key: "value", label: "Value for money", value: analysis.valueForMoney, icon: "trend" },
                    ] satisfies AnalysisMetric[]
                  }
                />
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-brand-surface p-4">
                <p className="flex-1 text-sm text-brand-muted">
                  Not analysed yet. The analysis estimates affordability, deposit and upfront costs.
                </p>
                <button
                  type="button"
                  onClick={runAnalysis}
                  disabled={analysing}
                  className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
                >
                  {analysing ? "Analysing..." : "Run AI analysis"}
                </button>
              </div>
            )}
          </div>

          {/* Investor interest */}
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wide text-brand-muted">
              Investor interest
            </h4>
            {!property.published ? (
              <p className="mt-2 rounded-xl bg-brand-surface p-4 text-sm text-brand-muted">
                Publish this to investors and interest will appear here.
              </p>
            ) : responded ? (
              <p className="mt-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                An investor has responded to this home. Check Messages or Mutual Matches to follow up.
              </p>
            ) : (
              <p className="mt-2 rounded-xl bg-brand-surface p-4 text-sm text-brand-muted">
                Live to investors, no response yet.
              </p>
            )}
          </div>

          {/* Property actions */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-brand-border pt-4">
            <button
              type="button"
              onClick={() =>
                requireAccount({
                  title: "Publish to investors",
                  message:
                    "Publishing puts your search in front of real investors, so it needs a verified account.",
                  action: () => setPublishing(true),
                })
              }
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                property.published
                  ? "border border-brand-border text-brand-ink hover:border-brand-blue hover:text-brand-blue"
                  : "bg-brand-blue text-white hover:bg-brand-blue-dark"
              }`}
            >
              {property.published ? "Update terms" : "Publish to investors"}
            </button>
            <a
              href={property.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              View on {property.portal} ↗
            </a>
            <button
              type="button"
              onClick={() => removeImportedProperty(property.id)}
              className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-brand-muted transition-colors hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {publishing && (
        <PublishDemandModal
          property={property}
          defaultRent={analysis?.estimatedMonthlyRent ?? suggestedRent(property.location, property.beds)}
          existing={property.published}
          onCancel={() => setPublishing(false)}
          onPublish={(details) => {
            updateImportedProperty(property.id, { published: details });
            setPublishing(false);
            setOpen(true);
          }}
        />
      )}
    </article>
  );
}

function MyPropertiesTenant() {
  // Same shape as the investor's My Properties: homes you've found and are
  // proposing to investors, each with a status badge, a Details toggle, and
  // a publish flow - but every field reframed from the tenant's point of
  // view (target rent, move-in date, household). Agreements in progress
  // (someone actually committed to buy for you) are a separate, later stage
  // and stay in their own section below, same as before.
  const { role, namesByRole } = useRole();
  const { importedProperties, advanceAgreement, hasInvestorResponded } = useListings();
  const [filter, setFilter] = useState<DemandFilterId>("all");
  const searchPath = role ? "/app/search" : "/search";

  const mine = useMemo(
    () => importedProperties.filter((p) => p.owner === (role ? "tenant" : "guest")),
    [importedProperties, role]
  );

  const withStatus = useMemo(
    () =>
      mine.map((p) => {
        const responded = hasInvestorResponded(p.id);
        return { property: p, status: demandStatusOf(p, responded) };
      }),
    [mine, hasInvestorResponded]
  );

  const counts = {
    all: withStatus.length,
    action: withStatus.filter((x) => demandNextAction(x.status)).length,
    draft: withStatus.filter((x) => !x.property.published).length,
    live: withStatus.filter((x) => !!x.property.published).length,
    interest: withStatus.filter((x) => x.status === "interest").length,
  };

  const shown = withStatus.filter((x) => {
    switch (filter) {
      case "action":
        return !!demandNextAction(x.status);
      case "draft":
        return !x.property.published;
      case "live":
        return !!x.property.published;
      case "interest":
        return x.status === "interest";
      default:
        return true;
    }
  });

  const myDeals = useMemo(
    () => importedProperties.filter((p) => p.agreement && p.agreement.tenantId === "you"),
    [importedProperties]
  );
  const currentHome = myDeals.find((p) => p.agreement!.stage === "tenancy-active");
  const inProgress = myDeals.filter((p) => p.agreement!.stage !== "tenancy-active");

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        My Properties
      </h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        Every home you've added, from first link to signed tenancy. Run the analysis, publish to
        investors, then see who's interested in buying it for you.
      </p>

      <Link
        to={searchPath}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
      >
        + Add a home
      </Link>

      {/* Pipeline summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Homes" value={`${counts.all}`} />
        <Metric label="Live to investors" value={`${counts.live}`} />
        <Metric label="With interest" value={`${counts.interest}`} />
        <Metric label="Deals in progress" value={`${inProgress.length}`} />
      </div>

      {/* Filters */}
      <nav className="mt-5 flex flex-wrap gap-2">
        {demandFilters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-brand-border bg-white text-brand-muted hover:border-brand-blue hover:text-brand-blue"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${active ? "text-white/70" : "text-brand-muted"}`}>
                {counts[f.id]}
              </span>
            </button>
          );
        })}
      </nav>

      {shown.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
          {mine.length === 0 ? (
            <>
              No homes yet. Add one from{" "}
              <Link to={searchPath} className="font-semibold text-brand-blue hover:underline">
                Search Properties
              </Link>{" "}
              by pasting a Rightmove, Zoopla or OnTheMarket link.
            </>
          ) : (
            "Nothing in this view right now."
          )}
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          {shown.map(({ property }) => (
            <TenantPropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {currentHome && (
        <div className="mt-8 rounded-2xl border border-brand-blue bg-brand-blue-light p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Current home</p>
          <p className="mt-1 font-display text-lg font-semibold text-brand-ink">{currentHome.title}</p>
          <p className="text-sm text-brand-muted">{currentHome.location}</p>
        </div>
      )}

      {inProgress.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-brand-muted">
            Deals in progress
          </h2>
          <div className="mt-2 flex flex-col gap-4">
            {inProgress.map((p) => (
              <AgreementTimeline
                key={p.id}
                agreement={p.agreement!}
                investor={selfProfile(`investor-${p.id}`, namesByRole.investor, "Investor")}
                tenant={selfProfile(`tenant-${p.id}`, namesByRole.tenant, "Tenant")}
                viewerRole="tenant"
                onAdvance={(by) => advanceAgreement(p.id, by)}
                property={{
                  title: p.title,
                  location: p.location,
                  imageUrl: p.imageUrl,
                  price: p.price,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Link to="/app/deals" className="mt-4 inline-block text-sm font-semibold text-brand-blue hover:underline">
        Open the full Deal Tracker →
      </Link>
    </div>
  );
}

export default function MyProperties() {
  const { role } = useRole();
  // Guests see the same page: the properties they've analysed while browsing.
  return role === "tenant" ? <MyPropertiesTenant /> : <MyPropertiesInvestor />;
}
