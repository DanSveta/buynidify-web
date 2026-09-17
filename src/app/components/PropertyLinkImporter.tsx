import { useState } from "react";
import { useRole } from "../context/RoleContext";
import {
  useListings,
  type BuyerAnalysis,
  type ImportedProperty,
  type InvestorAnalysis,
  type PublishDetails,
} from "../context/ListingsContext";
import { buildMockPropertyFromUrl, type Portal } from "../utils/mockFromUrl";

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

// Simplified England SDLT bands (standard residential rate) - a demo
// estimate only, flagged as such in the disclaimer below.
function estimateStampDuty(price: number): number {
  const bands: [number, number][] = [
    [250000, 0],
    [925000, 0.05],
    [1500000, 0.1],
    [Infinity, 0.12],
  ];
  let duty = 0;
  let lower = 0;
  for (const [upper, rate] of bands) {
    if (price > lower) {
      duty += (Math.min(price, upper) - lower) * rate;
      lower = upper;
    }
  }
  return Math.round(duty / 100) * 100;
}

function seedFrom(url: string) {
  return Math.abs(url.split("").reduce((h, c) => (h << 5) - h + c.charCodeAt(0), 0));
}

function buildInvestorAnalysis(p: ImportedProperty): InvestorAnalysis {
  const seed = seedFrom(p.url);
  // Gross yield 4.5-7.4%, then the monthly rent is derived from it so the
  // two figures always agree with each other.
  const grossYield = Math.round((4.5 + (seed % 30) / 10) * 10) / 10;
  const monthlyRent = Math.round((p.price * (grossYield / 100)) / 12 / 5) * 5;
  const netYield = Math.round((grossYield - 1.5) * 10) / 10;
  const locationScore = Math.round((6.5 + ((seed >> 3) % 30) / 10) * 10) / 10;
  const demandOptions: InvestorAnalysis["rentalDemand"][] = ["Moderate", "High", "Very high"];
  const rentalDemand = demandOptions[seed % demandOptions.length];
  const timeToLetOptions = ["1-2 weeks", "2-4 weeks", "3-6 weeks"];
  const profileOptions = ["Young professionals", "Professional sharers", "Families", "Students and graduates"];

  return {
    kind: "investor",
    summary: `This ${p.beds}-bedroom ${p.type.toLowerCase()} in ${p.location} presents a solid buy-to-let opportunity with estimated gross yields around ${grossYield.toFixed(1)}%.`,
    monthlyRent,
    grossYield,
    netYield,
    locationScore,
    rentalDemand,
    timeToLet: timeToLetOptions[(seed >> 2) % timeToLetOptions.length],
    tenantProfile: profileOptions[(seed >> 4) % profileOptions.length],
    positives: [
      `Strong rental demand in ${p.location}`,
      `${p.beds} bedroom${p.beds > 1 ? "s" : ""} attract stable long-term tenants`,
      "Good transport connections likely",
      "Competitive asking price for the area",
    ],
    consider: [
      "Full due diligence needed on service charges",
      "Stamp duty surcharge applies (3% for investment)",
      "Verify EPC rating before purchase",
      `Budget around ${gbp.format(estimateStampDuty(p.price) + Math.round(p.price * 0.03))} in stamp duty`,
    ],
    suggestions: [
      `Target net yield of ${netYield.toFixed(1)}-${(netYield + 1).toFixed(1)}% for ${p.location}`,
      `Market rent likely ${gbp.format(Math.round(monthlyRent * 0.95))}-${gbp.format(Math.round(monthlyRent * 1.05))}/month`,
      "Consider instructing a local letting agent for tenant referencing",
    ],
  };
}

function buildBuyerAnalysis(p: ImportedProperty): BuyerAnalysis {
  const seed = seedFrom(p.url);
  const valueOptions: BuyerAnalysis["valueForMoney"][] = ["Fair", "Good", "Excellent"];

  return {
    kind: "buyer",
    summary: `This ${p.beds}-bedroom ${p.type.toLowerCase()} in ${p.location} could suit your budget and search criteria.`,
    deposit: Math.round(p.price * 0.1),
    upfrontCosts: estimateStampDuty(p.price) + 2500,
    commuteScore: Math.round((6 + (seed % 35) / 10) * 10) / 10,
    amenitiesScore: Math.round((6 + ((seed >> 3) % 35) / 10) * 10) / 10,
    valueForMoney: valueOptions[seed % valueOptions.length],
    positives: [
      `${p.beds} bedroom${p.beds > 1 ? "s" : ""} offer good space for your household`,
      `${p.location} has strong transport links`,
      "Property type suits long-term ownership",
      "Area has good local amenities",
    ],
    consider: [
      "Confirm whether it's freehold or leasehold",
      "Check the EPC rating and any planned energy works",
      "Ask about service charge and ground rent (if leasehold)",
      "Verify the local council tax band",
    ],
    suggestions: [
      "Book a full structural survey before offering",
      "Request the property's EPC certificate",
      "Ask about chain length and the seller's timeline",
      "Get a mortgage Agreement in Principle before you offer",
    ],
  };
}

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

export default function PropertyLinkImporter() {
  const { role } = useRole();
  const isInvestor = role === "investor";
  const {
    addTenantDemand,
    addInvestorListing,
    updateInvestorListing,
    hasInvestorResponded,
    importedProperties,
    addImportedProperty,
    updateImportedProperty,
    removeImportedProperty,
  } = useListings();

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Each role only manages the links it pasted itself.
  const imports = importedProperties.filter((p) =>
    isInvestor ? p.owner === "investor" : p.owner === "tenant"
  );
  const publishing = imports.find((p) => p.id === publishingId) ?? null;

  function handleImport() {
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
    const id = `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const mock = buildMockPropertyFromUrl(parsed.toString());

    addImportedProperty({
      id,
      owner: isInvestor ? "investor" : "tenant",
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
    });

    // A tenant's link is a demand signal investors can respond to. An
    // investor's link isn't public until they actively publish it, so
    // nothing is registered here for them.
    if (isInvestor) {
      // Visible on Platform listings straight away - publishing then fills in
      // the rent and terms rather than being what puts it there.
      addInvestorListing({
        id,
        url: parsed.toString(),
        address: `${mock.beds} Bedroom ${mock.type}`,
        city: mock.city,
        price: mock.price,
        beds: mock.beds,
        type: mock.type,
        portal: mock.portal,
      });
    } else {
      addTenantDemand({
        id,
        url: parsed.toString(),
        city: mock.city,
        propertyType: mock.type,
        targetPrice: mock.price,
        minBeds: mock.beds,
        notes: `Found via a pasted ${mock.portal} link.`,
      });
    }

    setUrl("");
  }

  function runAnalysis(id: string) {
    const property = imports.find((p) => p.id === id);
    if (!property) return;
    setAnalyzingId(id);
    setTimeout(() => {
      updateImportedProperty(id, {
        analysis: isInvestor ? buildInvestorAnalysis(property) : buildBuyerAnalysis(property),
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
    // Only add to the marketplace the first time - republishing just
    // updates the terms on the card.
    updateInvestorListing(publishing.id, {
      monthlyRent: details.rent,
      minTenancy: details.minTenancy,
      availableFrom: details.availableFrom,
      notes: details.notes,
      accepts: details.accepts,
    });
    updateImportedProperty(publishing.id, { published: details });
    setPublishingId(null);
  }

  return (
    <div className="mt-6 rounded-2xl border border-brand-border bg-brand-surface p-5">
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
          className="flex-shrink-0 rounded-lg bg-brand-blue px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-ink"
        >
          Add property
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
      <p className="mt-2 text-[11px] text-brand-muted">
        {MAX_IMPORTS - imports.length} of {MAX_IMPORTS} link slots remaining · Demo platform: previews are generated from
        the link, no real portal data is fetched, and AI analysis is an estimate only, not financial or legal advice.
      </p>

      {imports.length > 0 && (
        <div className="mt-5 flex flex-col gap-4">
          {imports.map((p) => (
            <div key={p.id} className="rounded-xl border border-brand-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${portalBadgeClass[p.portal]}`}>
                      {p.portal}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      ✓ Verified
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
                  <p className="text-sm text-brand-muted">{p.location}</p>
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
              {isInvestor && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-border pt-3">
                  <button
                    type="button"
                    onClick={() => setPublishingId(p.id)}
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

const tenancyOptions = ["6 months", "12 months", "18 months", "24 months"];

// Who the investor will let to. Kept to the choices that actually change who
// applies, rather than a long form nobody fills in.
const tenantPreferences = [
  "Professionals",
  "Families",
  "Students",
  "Sharers",
  "Couples",
  "Pets considered",
  "Housing benefit considered",
  "Non-smokers only",
];

function PublishModal({
  property,
  defaultRent,
  existing,
  onCancel,
  onPublish,
}: {
  property: ImportedProperty;
  defaultRent: number;
  existing: PublishDetails | null;
  onCancel: () => void;
  onPublish: (details: PublishDetails) => void;
}) {
  const [rent, setRent] = useState(String(existing?.rent ?? defaultRent));
  const [availableFrom, setAvailableFrom] = useState(existing?.availableFrom ?? "");
  const [minTenancy, setMinTenancy] = useState(existing?.minTenancy ?? "12 months");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [accepts, setAccepts] = useState<string[]>(existing?.accepts ?? ["Professionals"]);
  const [touched, setTouched] = useState(false);

  function toggleAccept(option: string) {
    setAccepts((list) =>
      list.includes(option) ? list.filter((o) => o !== option) : [...list, option]
    );
  }

  const rentNumber = Number(rent);
  const rentValid = rent.trim() !== "" && Number.isFinite(rentNumber) && rentNumber > 0;

  function submit() {
    setTouched(true);
    if (!rentValid) return;
    onPublish({ rent: rentNumber, availableFrom, minTenancy, notes, accepts });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-brand-ink">Publish property</h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-brand-muted hover:text-brand-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-brand-surface p-3">
          <p className="text-sm font-semibold text-brand-ink">{property.title}</p>
          <p className="text-xs text-brand-muted">{property.location}</p>
        </div>

        <label className="mt-4 block text-xs font-semibold text-brand-muted">
          Target monthly rent (£)
          <input
            type="text"
            inputMode="numeric"
            value={rent}
            onChange={(e) => setRent(e.target.value.replace(/[^\d]/g, ""))}
            className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
          />
        </label>
        {touched && !rentValid && (
          <p className="mt-1 text-xs font-medium text-red-600">Enter a monthly rent first</p>
        )}

        <label className="mt-3 block text-xs font-semibold text-brand-muted">
          Available from
          <input
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
          />
        </label>

        <label className="mt-3 block text-xs font-semibold text-brand-muted">
          Minimum tenancy
          <select
            value={minTenancy}
            onChange={(e) => setMinTenancy(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
          >
            {tenancyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4">
          <p className="text-xs font-semibold text-brand-muted">Who would you let to?</p>
          <p className="mt-0.5 text-[11px] text-brand-muted">
            Shown on your listing so the right tenants apply. Pick any that fit.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tenantPreferences.map((option) => {
              const on = accepts.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleAccept(option)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    on
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-brand-border bg-white text-brand-muted hover:border-brand-blue hover:text-brand-blue"
                  }`}
                >
                  {on ? "✓ " : ""}
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-3 block text-xs font-semibold text-brand-muted">
          Notes for tenants (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Parking available, pets considered, etc."
            className="mt-1 w-full resize-none rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
          />
        </label>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-brand-border px-4 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex-1 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
