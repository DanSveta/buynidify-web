import { useState } from "react";
import { useListings } from "../context/ListingsContext";
import { buildMockPropertyFromUrl, type Portal } from "../utils/mockFromUrl";

// Replicates the live buynidify.eu "My Properties" paste-a-link + AI
// analysis flow (verified live, Sept 2026: paste box -> mock property card
// -> "Run AI analysis" -> expandable summary/deposit/costs/scores/
// positives/consider/suggestions), adapted to buy-only language. Importing
// here also registers the property as tenant demand in ListingsContext, so
// investors can see it (Tenant Demand) and respond - and this card then
// shows whether one has.

type Analysis = {
  summary: string;
  deposit: number;
  upfrontCosts: number;
  commuteScore: number;
  amenitiesScore: number;
  valueForMoney: "Fair" | "Good" | "Excellent";
  positives: string[];
  consider: string[];
  suggestions: string[];
};

type ImportedProperty = {
  id: string;
  url: string;
  portal: Portal;
  title: string;
  location: string;
  price: number;
  beds: number;
  type: string;
  analysis: Analysis | null;
  showAnalysis: boolean;
};

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

function buildAnalysis(p: ImportedProperty): Analysis {
  const seed = Math.abs(p.url.split("").reduce((h, c) => (h << 5) - h + c.charCodeAt(0), 0));
  const deposit = Math.round(p.price * 0.1);
  const upfrontCosts = estimateStampDuty(p.price) + 2500; // + legal fees & survey estimate
  const commuteScore = Math.round((6 + (seed % 35) / 10) * 10) / 10;
  const amenitiesScore = Math.round((6 + ((seed >> 3) % 35) / 10) * 10) / 10;
  const valueOptions: Analysis["valueForMoney"][] = ["Fair", "Good", "Excellent"];

  return {
    summary: `This ${p.beds}-bedroom ${p.type.toLowerCase()} in ${p.location} could suit your budget and search criteria.`,
    deposit,
    upfrontCosts,
    commuteScore,
    amenitiesScore,
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

export default function PropertyLinkImporter() {
  const { addTenantDemand, hasInvestorResponded } = useListings();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [imports, setImports] = useState<ImportedProperty[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

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

    setImports((list) => [
      {
        id,
        url: parsed.toString(),
        portal: mock.portal,
        title: `${mock.beds} Bedroom ${mock.type}`,
        location: mock.city,
        price: mock.price,
        beds: mock.beds,
        type: mock.type,
        analysis: null,
        showAnalysis: false,
      },
      ...list,
    ]);

    // Also registers as tenant demand, so investors can see this and
    // respond - previously this card was invisible outside Search.
    addTenantDemand({
      id,
      url: parsed.toString(),
      city: mock.city,
      propertyType: mock.type,
      targetPrice: mock.price,
      minBeds: mock.beds,
      notes: `Found via a pasted ${mock.portal} link.`,
    });

    setUrl("");
  }

  function runAnalysis(id: string) {
    setAnalyzingId(id);
    setTimeout(() => {
      setImports((list) => list.map((p) => (p.id === id ? { ...p, analysis: buildAnalysis(p), showAnalysis: true } : p)));
      setAnalyzingId(null);
    }, 700);
  }

  function toggleAnalysis(id: string) {
    setImports((list) => list.map((p) => (p.id === id ? { ...p, showAnalysis: !p.showAnalysis } : p)));
  }

  function remove(id: string) {
    setImports((list) => list.filter((p) => p.id !== id));
  }

  return (
    <div className="mt-6 rounded-2xl border border-brand-border bg-brand-surface p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
          ✨
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-brand-ink">Found one you like? Add the link</p>
          <p className="text-xs text-brand-muted">
            Paste a link from Rightmove, Zoopla, OnTheMarket or PrimeLocation, run an AI check, and investors can see
            you're interested
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
                    {hasInvestorResponded(p.id) && (
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
                        <div className="rounded-lg bg-white px-2 py-2">
                          <p className="text-[10px] uppercase text-brand-muted">Est. deposit (10%)</p>
                          <p className="text-sm font-semibold text-brand-ink">{gbp.format(p.analysis.deposit)}</p>
                        </div>
                        <div className="rounded-lg bg-white px-2 py-2">
                          <p className="text-[10px] uppercase text-brand-muted">Upfront costs</p>
                          <p className="text-sm font-semibold text-brand-ink">{gbp.format(p.analysis.upfrontCosts)}</p>
                        </div>
                        <div className="rounded-lg bg-white px-2 py-2">
                          <p className="text-[10px] uppercase text-brand-muted">Value for money</p>
                          <p className="text-sm font-semibold text-brand-ink">{p.analysis.valueForMoney}</p>
                        </div>
                        <div className="rounded-lg bg-white px-2 py-2">
                          <p className="text-[10px] uppercase text-brand-muted">Commute score</p>
                          <p className="text-sm font-semibold text-brand-ink">{p.analysis.commuteScore}/10</p>
                        </div>
                        <div className="rounded-lg bg-white px-2 py-2">
                          <p className="text-[10px] uppercase text-brand-muted">Amenities score</p>
                          <p className="text-sm font-semibold text-brand-ink">{p.analysis.amenitiesScore}/10</p>
                        </div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
