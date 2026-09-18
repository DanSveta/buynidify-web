import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PropertyLinkImporter from "../components/PropertyLinkImporter";
import { useRole } from "../context/RoleContext";
import { deals } from "../data/mockData";
import {
  agreementSteps,
  useListings,
  type AgreementStage,
  type ImportedProperty,
  type InterestedTenant,
} from "../context/ListingsContext";
import TenantProfileModal from "../components/TenantProfileModal";
import PublishModal from "../components/PublishModal";
import { buildInvestorAnalysis } from "../utils/analysis";
import { propertyImage } from "../utils/propertyImages";
import { useAuthGate } from "../context/AuthGateContext";

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

function ProgressTracker({
  property,
  onAdvance,
  onCancel,
}: {
  property: ImportedProperty;
  onAdvance: (stage: AgreementStage) => void;
  onCancel: () => void;
}) {
  const agreement = property.agreement;
  if (!agreement) return null;
  const current = agreementSteps.findIndex((s) => s.id === agreement.stage);
  const next = agreementSteps[current + 1];
  const step = agreementSteps[current];

  return (
    <div className="mt-4 rounded-xl bg-brand-ink p-5 text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">
            Progress with {agreement.tenantName}
          </p>
          <p className="mt-1 font-display text-lg font-semibold">{step.label}</p>
          <p className="mt-0.5 max-w-md text-xs text-white/70">{step.detail}</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold">
          {step.actor === "Done" ? "Complete" : `With ${step.actor.toLowerCase()}`}
        </span>
      </div>

      <ol className="mt-5 space-y-2.5">
        {agreementSteps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.id} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  done
                    ? "bg-white/20 text-white"
                    : active
                      ? "bg-brand-cta text-brand-cta-text"
                      : "bg-white/10 text-white/40"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-sm ${
                    active ? "font-semibold" : done ? "text-white/80" : "text-white/40"
                  }`}
                >
                  {s.label}
                </span>
                {(active || done) && (
                  <span className="block text-[11px] text-white/50">{s.detail}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      {next ? (
        <button
          type="button"
          onClick={() => onAdvance(next.id)}
          className="mt-5 w-full rounded-lg bg-brand-cta px-4 py-2.5 text-sm font-semibold text-brand-cta-text"
        >
          Advance to {next.label.toLowerCase()}
        </button>
      ) : (
        <p className="mt-5 rounded-lg bg-white/10 px-4 py-2.5 text-center text-sm font-semibold">
          Tenancy active
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[10px] text-white/50">
          Buynidify coordinates the steps between you and the tenant. You are not negotiating
          directly, and you only buy once the deposit is secured.
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="flex-shrink-0 text-[11px] font-semibold text-white/50 hover:text-white"
        >
          Withdraw
        </button>
      </div>
      <p className="mt-2 text-[10px] text-white/40">
        Demo note: in the real product these steps advance as the team completes them. The button
        is here so you can walk through the flow.
      </p>
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
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
        {tenant.initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-sm font-semibold text-brand-ink">{tenant.name}</p>
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
  const { updateImportedProperty, removeImportedProperty } = useListings();
  const { requireAccount } = useAuthGate();
  const [open, setOpen] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const status = statusOf(property, interested.length);
  const action = nextAction(status);
  const analysis = property.analysis?.kind === "investor" ? property.analysis : null;
  const rent = property.published?.rent ?? analysis?.monthlyRent;
  const verifiedCount = interested.filter((t) => t.referencing === "Verified").length;

  function runAnalysis() {
    setAnalysing(true);
    window.setTimeout(() => {
      updateImportedProperty(property.id, {
        analysis: buildInvestorAnalysis(property),
        showAnalysis: true,
      });
      setAnalysing(false);
      setOpen(true);
    }, 700);
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
              <div className="mt-2 rounded-xl bg-brand-surface p-4">
                <p className="text-sm text-brand-ink">{analysis.summary}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">In its favour</p>
                    <ul className="mt-1 space-y-0.5 text-xs text-brand-ink">
                      {analysis.positives.map((i) => (
                        <li key={i}>+ {i}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-700">Check before you commit</p>
                    <ul className="mt-1 space-y-0.5 text-xs text-brand-ink">
                      {analysis.consider.map((i) => (
                        <li key={i}>− {i}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-blue">Suggested</p>
                    <ul className="mt-1 space-y-0.5 text-xs text-brand-ink">
                      {analysis.suggestions.map((i) => (
                        <li key={i}>→ {i}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-[10px] italic text-brand-muted">
                  An estimate only, not financial or legal advice.
                </p>
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
          {property.agreement && (
            <ProgressTracker
              property={property}
              onAdvance={(stage) =>
                updateImportedProperty(property.id, {
                  agreement: { ...property.agreement!, stage },
                })
              }
              onCancel={() => updateImportedProperty(property.id, { agreement: null })}
            />
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
          defaultRent={analysis?.monthlyRent ?? Math.round((property.price * 0.05) / 12 / 5) * 5}
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
  const [openTenant, setOpenTenant] = useState<{ tenant: InterestedTenant; context: string } | null>(
    null
  );
  const [filter, setFilter] = useState<FilterId>("all");

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
        to="/app/search"
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
              <Link to="/app/search" className="font-semibold text-brand-blue hover:underline">
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
                setOpenTenant({ tenant, context: `${property.title}, ${property.location}` })
              }
            />
          ))}
        </div>
      )}

      {openTenant && (
        <TenantProfileModal
          tenant={openTenant.tenant}
          context={openTenant.context}
          onClose={() => setOpenTenant(null)}
        />
      )}
    </div>
  );
}

function MyPropertiesTenant() {
  // Current tenancy (if a lease exists) + any properties in an active deal
  // (deposit paid or purchase in progress), plus the paste-a-link + AI
  // analysis flow (same as the live product's My Properties page).
  const myDeals = deals.filter((d) => d.stage !== "matched");
  const currentHome = myDeals.find((d) => d.stage === "lease-signed");

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">My Properties</h1>
      <p className="mt-1 text-brand-muted">
        The homes you've asked investors to buy, and anything moving through a deal right now.
      </p>

      <Link
        to="/app/search"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
      >
        + Add a home
      </Link>

      <PropertyLinkImporter listOnly />

      {currentHome && (
        <div className="mt-8 rounded-2xl border border-brand-blue bg-brand-blue-light p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Current home</p>
          <p className="mt-1 font-display text-lg font-semibold text-brand-ink">{currentHome.propertyAddress}</p>
          <p className="text-sm text-brand-muted">{currentHome.city}</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {myDeals
          .filter((d) => d.stage !== "lease-signed")
          .map((deal) => (
            <div key={deal.id} className="flex items-center justify-between rounded-2xl border border-brand-border bg-white p-5">
              <div>
                <p className="font-display text-base font-semibold text-brand-ink">{deal.propertyAddress}</p>
                <p className="text-sm text-brand-muted">{deal.city}</p>
              </div>
              <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-ink">
                {deal.stage === "deposit-paid" ? "Deposit paid" : "Purchase in progress"}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function MyProperties() {
  const { role } = useRole();
  // Guests see the same page: the properties they've analysed while browsing.
  return role === "tenant" ? <MyPropertiesTenant /> : <MyPropertiesInvestor />;
}
