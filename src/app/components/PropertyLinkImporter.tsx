import { useState } from "react";
import { useRole } from "../context/RoleContext";
import {
  useListings,
  type PublishDetails,
} from "../context/ListingsContext";
import { fetchPropertyFromUrl, type Portal } from "../utils/mockFromUrl";
import { buildBuyerAnalysis, buildInvestorAnalysis } from "../utils/analysis";
import PublishModal from "./PublishModal";
import { useAuthGate } from "../context/AuthGateContext";

// Paste-a-link + AI analysis, matching the flow on the live buynidify.eu
// demo. Two variants, because the two roles ask different questions of the
// same link:
//
//   Investor - "will this let, and for how much?" -> rent/yield/demand
//              analysis, then Publish to tenants (rent, availability,
//              minimum tenancy, notes) which puts it in the marketplace.
//   Tenant   - "can I afford it, and is it a good buy?" -> deposit,
//              upfront costs, commute/amenities, and the link registers as
//              tenant demand so investors can respond.

// Types live in ListingsContext now - the cards are shared state, not this
// component's private state, so they show on both Search and My Properties
// and survive a reload or a role switch.

const MAX_IMPORTS = 5;

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

const portalBadgeClass: Record<Portal, string> = {
  Rightmove: "bg-emerald-100 text-emerald-700",
  Zoopla: "bg-purple-100 text-purple-700",
  OnTheMarket: "bg-orange-100 text-orange-700",
  PrimeLocation: "bg-amber-100 text-amber-700",
  Unknown: "bg-brand-surface text-brand-muted",
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-brand-muted">{label}</p>
      <p className="text-sm font-semibold text-brand-ink">{value}</p>
    </div>
  );
}

export default function PropertyLinkImporter({
  inputOnly = false,
  listOnly = false,
}: {
  /** Just the paste box (Search). */
  inputOnly?: boolean;
  /** Just the cards for links already added (My Properties). */
  listOnly?: boolean;
}) {
  const { role } = useRole();
  const isInvestor = role === "investor";
  const {
    hasInvestorResponded,
    importedProperties,
    addImportedProperty,
    updateImportedProperty,
    removeImportedProperty,
  } = useListings();

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const { requireAccount } = useAuthGate();

  // Each role only manages the links it pasted itself.
  const imports = importedProperties.filter((p) =>
    role ? (isInvestor ? p.owner === "investor" : p.owner === "tenant") : p.owner === "guest"
  );
  const publishing = imports.find((p) => p.id === publishingId) ?? null;

  async function handleImport() {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (imports.length >= MAX_IMPORTS) {
      setError(`You've reached the ${MAX_IMPORTS}-link limit for this demo.`);
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      setError("That doesn't look like a valid link. Paste the full property page URL.");
      return;
    }
    setError("");
    setFetching(true);
    const id = `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    // Reads the real listing. Falls back to a generated preview if the portal
    // blocks the request, and says so on the card either way.
    const mock = await fetchPropertyFromUrl(parsed.toString());
    setFetching(false);

    addImportedProperty({
      id,
      // A guest can analyse anything; it becomes theirs when they join.
      owner: role ? (isInvestor ? "investor" : "tenant") : "guest",
      url: parsed.toString(),
      portal: mock.portal,
      title: `${mock.beds} Bedroom ${mock.type}`,
      location: mock.city,
      price: mock.price,
      beds: mock.beds,
      type: mock.type,
      analysis: null,
      showAnalysis: false,
      published: null,
      sourced: mock.real,
      sourceNote: mock.note,
      baths: mock.baths,
      postcode: mock.postcode,
      agent: mock.agent,
      imageUrl: mock.imageUrl,
    });

    setUrl("");
  }

  function runAnalysis(id: string) {
    const property = imports.find((p) => p.id === id);
    if (!property) return;
    setAnalyzingId(id);
    setTimeout(() => {
      updateImportedProperty(id, {
        // Signed out we don't know which side you're on yet, so you get the
        // investment analysis - the one the platform is built around.
        analysis: isInvestor || !role ? buildInvestorAnalysis(property) : buildBuyerAnalysis(property),
        showAnalysis: true,
      });
      setAnalyzingId(null);
    }, 700);
  }

  function toggleAnalysis(id: string) {
    const property = imports.find((p) => p.id === id);
    if (!property) return;
    updateImportedProperty(id, { showAnalysis: !property.showAnalysis });
  }

  function remove(id: string) {
    removeImportedProperty(id);
  }

  function publish(details: PublishDetails) {
    if (!publishing) return;
    // Publishing sets the terms on the one record; Platform listings reads
    // them straight from it.
    updateImportedProperty(publishing.id, { published: details });
    setPublishingId(null);
  }

  return (
    <div className="mt-6 rounded-2xl border border-brand-border bg-brand-surface p-5">
      {!listOnly && (
        <>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
          ✨
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-brand-ink">
            {isInvestor ? "Bought or found a property? Add the link" : "Found one you like? Add the link"}
          </p>
          <p className="text-xs text-brand-muted">
            {isInvestor
              ? "Paste a link from Rightmove, Zoopla, OnTheMarket or PrimeLocation, run a rental-yield analysis, then publish it to tenants"
              : "Paste a link from Rightmove, Zoopla, OnTheMarket or PrimeLocation, run an AI check, and investors can see you're interested"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleImport()}
          placeholder="https://www.rightmove.co.uk/properties/12345678"
          className="w-full flex-1 rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={fetching}
          className="flex-shrink-0 rounded-lg bg-brand-blue px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-ink disabled:opacity-60"
        >
          {fetching ? "Reading listing..." : "Add property"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
      <p className="mt-2 text-[11px] text-brand-muted">
        {MAX_IMPORTS - imports.length} of {MAX_IMPORTS} link slots remaining · Details are read from the listing
        itself. The AI analysis is an estimate only, not financial or legal advice.
      </p>
        </>
      )}

      {!inputOnly && imports.length > 0 && (
        <div className="mt-5 flex flex-col gap-4">
          {imports.map((p) => (
            <div key={p.id} className="rounded-xl border border-brand-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    loading="lazy"
                    className="h-20 w-28 flex-shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${portalBadgeClass[p.portal]}`}>
                      {p.portal}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        p.sourced
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-brand-gold/20 text-brand-gold-dark"
                      }`}
                      title={p.sourceNote}
                    >
                      {p.sourced ? "✓ Read from listing" : "Estimated preview"}
                    </span>
                    {p.published && (
                      <span className="rounded-full bg-brand-blue-light px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
                        Live to tenants
                      </span>
                    )}
                    {!isInvestor && hasInvestorResponded(p.id) && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        An investor is interested ✓
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-display text-base font-semibold text-brand-ink">{p.title}</p>
                  <p className="text-sm text-brand-muted">
                    {p.location}
                    {p.postcode ? ` · ${p.postcode}` : ""}
                  </p>
                  {p.agent && (
                    <p className="text-[11px] text-brand-muted">Marketed by {p.agent}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label="Remove"
                  className="flex-shrink-0 text-brand-muted hover:text-brand-ink"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-brand-surface px-2 py-2">
                  <p className="text-[10px] uppercase text-brand-muted">Beds</p>
                  <p className="text-sm font-semibold text-brand-ink">{p.beds}</p>
                </div>
                <div className="rounded-lg bg-brand-surface px-2 py-2">
                  <p className="text-[10px] uppercase text-brand-muted">Price</p>
                  <p className="text-sm font-semibold text-brand-ink">{gbp.format(p.price)}</p>
                </div>
                <div className="rounded-lg bg-brand-surface px-2 py-2">
                  <p className="text-[10px] uppercase text-brand-muted">Type</p>
                  <p className="truncate text-sm font-semibold text-brand-ink">{p.type}</p>
                </div>
              </div>

              <p className="mt-2 truncate text-xs text-brand-muted" title={p.url}>
                {p.url}
              </p>

              {!p.analysis ? (
                <button
                  type="button"
                  onClick={() => runAnalysis(p.id)}
                  disabled={analyzingId === p.id}
                  className="mt-3 rounded-lg border border-brand-blue px-3 py-1.5 text-xs font-semibold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white disabled:opacity-50"
                >
                  {analyzingId === p.id ? "Running AI analysis…" : "✨ Run AI analysis"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => toggleAnalysis(p.id)}
                    className="mt-3 text-xs font-semibold text-brand-blue hover:underline"
                  >
                    {p.showAnalysis ? "Hide AI analysis" : "View AI analysis"}
                  </button>

                  {p.showAnalysis && (
                    <div className="mt-3 rounded-lg bg-brand-surface p-4">
                      <p className="text-sm text-brand-ink">{p.analysis.summary}</p>

                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {p.analysis.kind === "investor" ? (
                          <>
                            <Metric label="Estimated monthly rent" value={`${gbp.format(p.analysis.monthlyRent)}`} />
                            <Metric label="Gross yield" value={`${p.analysis.grossYield.toFixed(1)}%`} />
                            <Metric label="Net yield estimate" value={`${p.analysis.netYield.toFixed(1)}%`} />
                            <Metric label="Location score" value={`${p.analysis.locationScore}/10`} />
                            <Metric label="Rental demand" value={p.analysis.rentalDemand} />
                            <Metric label="Time to let" value={p.analysis.timeToLet} />
                            <Metric label="Tenant profile" value={p.analysis.tenantProfile} />
                          </>
                        ) : (
                          <>
                            <Metric label="Est. deposit (10%)" value={gbp.format(p.analysis.deposit)} />
                            <Metric label="Upfront costs" value={gbp.format(p.analysis.upfrontCosts)} />
                            <Metric label="Value for money" value={p.analysis.valueForMoney} />
                            <Metric label="Commute score" value={`${p.analysis.commuteScore}/10`} />
                            <Metric label="Amenities score" value={`${p.analysis.amenitiesScore}/10`} />
                          </>
                        )}
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold text-emerald-700">Positives</p>
                          <ul className="mt-1 space-y-0.5 text-xs text-brand-ink">
                            {p.analysis.positives.map((item) => (
                              <li key={item}>+ {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-700">Consider</p>
                          <ul className="mt-1 space-y-0.5 text-xs text-brand-ink">
                            {p.analysis.consider.map((item) => (
                              <li key={item}>− {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-semibold text-brand-blue">Suggestions</p>
                        <ul className="mt-1 space-y-0.5 text-xs text-brand-ink">
                          {p.analysis.suggestions.map((item) => (
                            <li key={item}>→ {item}</li>
                          ))}
                        </ul>
                      </div>

                      <p className="mt-3 text-[11px] italic text-brand-muted">
                        AI analysis is an estimate only and does not constitute financial or legal advice.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Investor actions - publishing is what makes the property
                  visible to tenants in the marketplace. */}
              {(isInvestor || !role) && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-border pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      requireAccount({
                        title: "Publish to tenants",
                        message:
                          "Publishing puts your proposal in front of real tenants, so it needs a verified account.",
                        action: () => setPublishingId(p.id),
                      })
                    }
                    className="rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
                  >
                    {p.published ? "Update listing" : "Publish to tenants"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="rounded-lg border border-brand-border px-4 py-2 text-xs font-semibold text-brand-muted transition-colors hover:border-brand-ink hover:text-brand-ink"
                  >
                    Remove interest
                  </button>
                  {p.published && (
                    <div className="w-full rounded-lg bg-emerald-50 p-3">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <Metric label="Monthly rent" value={`${gbp.format(p.published.rent)}/mo`} />
                        <Metric label="Min tenancy" value={p.published.minTenancy} />
                        <Metric label="Available" value={p.published.availableFrom || "Now"} />
                        <Metric label="Status" value="Live to tenants" />
                      </div>
                      {/* Optional chaining matters here: properties published
                          before this field existed are still in localStorage
                          with no `accepts` at all. */}
                      {(p.published.accepts?.length ?? 0) > 0 && (
                        <p className="mt-2 text-[11px] text-brand-ink">
                          <span className="font-semibold">Accepting:</span>{" "}
                          {p.published.accepts.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {publishing && (
        <PublishModal
          property={publishing}
          defaultRent={
            publishing.analysis?.kind === "investor"
              ? publishing.analysis.monthlyRent
              : Math.round((publishing.price * 0.05) / 12 / 5) * 5
          }
          existing={publishing.published}
          onCancel={() => setPublishingId(null)}
          onPublish={publish}
        />
      )}
    </div>
  );
}


