import { useState } from "react";
import { MetricIcon, type AnalysisMetric } from "./AIAnalysisCard";
import { allSdltScenarios, calculateSdlt } from "../../data/sdlt";

// The "beautiful, advanced" AI analysis Véta asked for after comparing the
// old card to a ChatGPT session: not just a summary and a grid of pills, but
// a real rental-return breakdown with a market comparison bar, an editable
// investment calculator (expenses/vacancy sliders, live gross/net yield),
// and a proper SDLT purchase-cost table with real government bands - not
// fabricated figures, an actual formula (see data/sdlt.ts) that would match
// a gov.uk calculator for the same price. Used for the two "you're buying
// this" analyses (investor and buyer/home-purchase); the tenant-demand
// analysis stays on the simpler AIAnalysisCard, since a tenant browsing a
// home to rent has no purchase price or SDLT to reason about.

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const gbpM = (n: number) => (n >= 1_000_000 ? `£${(n / 1_000_000).toFixed(2)}M` : gbp.format(n));

function Source({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-surface px-2 py-0.5 text-[10px] font-semibold text-brand-muted">
      {label}
    </span>
  );
}

export function PurchaseAnalysisCard({
  price,
  monthlyRent,
  sqft,
  cityLabel,
  marketYieldRange,
  marketSummary,
  summary,
  source,
  positives,
  consider,
  suggestions,
  otherMetrics,
}: {
  price: number;
  monthlyRent: number;
  sqft?: number;
  cityLabel: string;
  marketYieldRange: [number, number];
  marketSummary: string;
  summary: string;
  source: "ai" | "demo";
  positives: string[];
  consider: string[];
  suggestions?: string[];
  otherMetrics: AnalysisMetric[];
}) {
  const annualRent = monthlyRent * 12;
  const grossYield = price > 0 ? (annualRent / price) * 100 : 0;
  const marketAvgYield = (marketYieldRange[0] + marketYieldRange[1]) / 2;
  const belowMarket = grossYield < marketYieldRange[0];
  const pricePerSqft = sqft ? Math.round(price / sqft) : undefined;
  const standardSdlt = calculateSdlt(price, "standard");
  const scenarios = allSdltScenarios(price);

  // Collapsed by default - the full breakdown (rental return chart,
  // calculator, SDLT table, everything else) was a lot to scroll through
  // just to glance at a listing, so only the headline card + key metrics
  // show up front, and "View full analysis" reveals the rest on demand.
  const [expanded, setExpanded] = useState(false);

  // Calculator state - seeded from the property's own numbers but fully
  // editable, so this is a working tool, not a static readout of the same
  // two figures shown above it.
  const [calcPrice, setCalcPrice] = useState(price);
  const [calcRent, setCalcRent] = useState(monthlyRent);
  const [expensePct, setExpensePct] = useState(20);
  const [vacantMonths, setVacantMonths] = useState(1);

  const calcAnnualRent = calcRent * 12;
  const calcGrossYield = calcPrice > 0 ? (calcAnnualRent / calcPrice) * 100 : 0;
  const rentAfterVacancy = Math.max(0, calcAnnualRent - calcRent * vacantMonths);
  const operatingExpenses = rentAfterVacancy * (expensePct / 100);
  const operatingIncome = rentAfterVacancy - operatingExpenses;
  const calcNetYield = calcPrice > 0 ? (operatingIncome / calcPrice) * 100 : 0;

  function resetCalculator() {
    setCalcPrice(price);
    setCalcRent(monthlyRent);
    setExpensePct(20);
    setVacantMonths(1);
  }

  const headline = belowMarket
    ? "A strong property with a below-market rental return"
    : grossYield > marketYieldRange[1]
      ? "An above-market rental return for the area"
      : "A rental return in line with the local market";

  return (
    <div className="space-y-5">
      {/* Header banner + AI summary, same language as the rest of the app. */}
      <div className="overflow-hidden rounded-3xl border border-brand-border bg-white shadow-sm">
        <div className="bg-gradient-to-br from-brand-blue to-brand-blue-dark px-6 py-5 text-white sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <MetricIcon.spark className="h-4 w-4 text-brand-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/80">Buynidify AI analysis</span>
            <span
              className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                source === "ai" ? "bg-emerald-400/20 text-emerald-200" : "bg-white/15 text-white/70"
              }`}
            >
              {source === "ai" ? "AI-generated" : "Estimated"}
            </span>
          </div>
          <p className="mt-3 font-display text-lg font-semibold leading-snug text-white sm:text-xl">{headline}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/90">{summary}</p>
          <p className="mt-2 text-[11px] text-white/50">Based on advertised figures, not an independent valuation.</p>
        </div>

        <div className="grid grid-cols-2 gap-px bg-brand-border sm:grid-cols-3 lg:grid-cols-5">
          <div className="bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Gross rental yield</p>
            <p className="mt-1 text-xl font-bold text-brand-gold-dark">{grossYield.toFixed(2)}%</p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                belowMarket ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {belowMarket ? "Below market average" : "At or above market average"}
            </span>
          </div>
          {/* Missing from the collapsed view before - you had to expand the
              full analysis just to see the rent the yield above is even
              based on. Right after the yield now, since it's the number
              that number depends on. */}
          <div className="bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Est. monthly rent</p>
            <p className="mt-1 text-xl font-bold text-brand-ink">{gbp.format(monthlyRent)}</p>
            <p className="mt-1 text-[10px] text-brand-muted">Buynidify's estimate</p>
          </div>
          {pricePerSqft !== undefined && (
            <div className="bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Price per sq ft</p>
              <p className="mt-1 text-xl font-bold text-brand-ink">£{pricePerSqft.toLocaleString("en-GB")}</p>
              <p className="mt-1 text-[10px] text-brand-muted">Based on advertised area</p>
            </div>
          )}
          <div className="bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Est. purchase tax</p>
            <p className="mt-1 text-xl font-bold text-brand-ink">{gbpM(standardSdlt)}</p>
            <p className="mt-1 text-[10px] text-brand-muted">Standard SDLT scenario</p>
          </div>
          {otherMetrics.slice(0, 1).map((m) => {
            const Icon = MetricIcon[m.icon];
            return (
              <div key={m.key} className="flex items-start gap-2.5 bg-white p-4">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">{m.label}</p>
                  <p className="truncate text-sm font-bold text-brand-ink">{m.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-brand-border bg-white px-6 py-3 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-surface sm:px-7"
        >
          {expanded ? "Show less" : "View full analysis"}
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {!expanded && (
        <p className="text-center text-[11px] text-brand-muted">
          Rental-return chart, an interactive calculator and the full SDLT breakdown are in the full analysis.
        </p>
      )}

      {expanded && (
        <>
      {/* Rental return + market comparison. */}
      <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Rental return</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-brand-muted">Property price</p>
            <p className="mt-1 font-display text-2xl font-semibold text-brand-ink">{gbpM(price)}</p>
          </div>
          <div>
            <p className="text-sm text-brand-muted">Monthly rent</p>
            <p className="mt-1 font-display text-2xl font-semibold text-brand-ink">{gbp.format(monthlyRent)}</p>
          </div>
          <div>
            <p className="text-sm text-brand-muted">Annual rent</p>
            <p className="mt-1 font-display text-2xl font-semibold text-brand-ink">{gbp.format(annualRent)}</p>
          </div>
          <div>
            <p className="text-sm text-brand-muted">Gross rental yield</p>
            <p className="mt-1 font-display text-2xl font-semibold text-brand-gold-dark">{grossYield.toFixed(2)}%</p>
          </div>
        </div>

        <div className="mt-5 border-t border-brand-border pt-4">
          <p className="text-sm leading-relaxed text-brand-ink">
            For comparison, Buynidify's UK market research puts typical gross rental yield in {cityLabel} at{" "}
            {marketYieldRange[0].toFixed(1)}%-{marketYieldRange[1].toFixed(1)}%. {marketSummary}
          </p>
          <div className="mt-1">
            <Source label="Buynidify market research" />
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-ink">This property</span>
                <span className="font-semibold text-brand-ink">{grossYield.toFixed(2)}%</span>
              </div>
              <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-brand-surface">
                <div
                  className="h-full rounded-full bg-brand-gold"
                  style={{ width: `${Math.min(100, (grossYield / Math.max(grossYield, marketAvgYield, 1)) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-ink">{cityLabel} average</span>
                <span className="font-semibold text-brand-ink">{marketAvgYield.toFixed(2)}%</span>
              </div>
              <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-brand-surface">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, (marketAvgYield / Math.max(grossYield, marketAvgYield, 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive calculator. */}
      <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-7">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          Interactive investment calculator
        </span>
        <p className="mt-2 font-display text-lg font-semibold text-brand-ink">Calculate your rental return</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-brand-muted">Purchase price (£)</span>
            <input
              type="number"
              value={calcPrice}
              onChange={(e) => setCalcPrice(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-full border border-brand-border px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-brand-muted">Expected monthly rental income (£)</span>
            <input
              type="number"
              value={calcRent}
              onChange={(e) => setCalcRent(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-full border border-brand-border px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-blue"
            />
          </label>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-muted">
            <span>Annual operating expenses</span>
            <span className="text-brand-ink">{expensePct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={expensePct}
            onChange={(e) => setExpensePct(Number(e.target.value))}
            className="mt-1.5 w-full accent-brand-blue"
          />
          <div className="flex justify-between text-[10px] text-brand-muted">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
          <p className="mt-1 text-[11px] text-brand-muted">
            Illustrative costs for maintenance, management, insurance and other running expenses.
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-muted">
            <span>Vacant months per year</span>
            <span className="text-brand-ink">{vacantMonths}</span>
          </div>
          <input
            type="range"
            min={0}
            max={6}
            value={vacantMonths}
            onChange={(e) => setVacantMonths(Number(e.target.value))}
            className="mt-1.5 w-full accent-brand-blue"
          />
          <div className="flex justify-between text-[10px] text-brand-muted">
            <span>0</span>
            <span>3</span>
            <span>6</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-brand-surface p-4">
            <p className="text-xs text-brand-muted">Gross yield</p>
            <p className="mt-1 font-display text-2xl font-bold text-brand-ink">{calcGrossYield.toFixed(2)}%</p>
          </div>
          <div className="rounded-xl bg-brand-surface p-4">
            <p className="text-xs text-brand-muted">Illustrative net yield</p>
            <p className="mt-1 font-display text-2xl font-bold text-brand-ink">{calcNetYield.toFixed(2)}%</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between border-t border-brand-border pt-2">
            <span className="text-brand-muted">Annual rent at full occupancy</span>
            <span className="font-semibold text-brand-ink">{gbp.format(calcAnnualRent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Rental income after vacancy</span>
            <span className="font-semibold text-brand-ink">{gbp.format(rentAfterVacancy)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Operating expenses</span>
            <span className="font-semibold text-red-600">-{gbp.format(operatingExpenses)}</span>
          </div>
          <div className="flex justify-between border-t border-brand-border pt-2">
            <span className="text-brand-ink">Annual operating income</span>
            <span className="font-bold text-emerald-700">{gbp.format(operatingIncome)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={resetCalculator}
          className="mt-5 w-full rounded-full border border-brand-border px-4 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
        >
          Reset to example
        </button>

        <p className="mt-3 text-[11px] leading-relaxed text-brand-muted">
          Illustrative model. Excludes financing, acquisition costs, income tax, capital gains and appreciation. The
          {" "}{gbp.format(monthlyRent)} rent is Buynidify's estimate for this property, not an independently verified
          completed tenancy.
        </p>
      </div>

      {/* Purchase cost breakdown - real SDLT bands. */}
      <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-7">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-blue">
          Purchase cost breakdown
        </span>
        <p className="mt-2 font-display text-lg font-semibold text-brand-ink">Estimated total acquisition cost</p>
        <p className="mt-1 text-xs text-brand-muted">
          Example: individual buying their only UK residential property, without the non-resident surcharge.
        </p>

        <div className="mt-4 divide-y divide-brand-border text-sm">
          <div className="flex justify-between py-2.5">
            <span className="text-brand-muted">Asking price</span>
            <span className="font-semibold text-brand-ink">{gbp.format(price)}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-brand-muted">Stamp Duty Land Tax</span>
            <span className="font-semibold text-brand-ink">{gbp.format(standardSdlt)}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-brand-muted">Legal, survey and other fees</span>
            <span className="font-semibold text-brand-muted">To be quoted</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="font-bold text-brand-ink">Subtotal</span>
            <span className="font-bold text-brand-ink">{gbp.format(price + standardSdlt)}</span>
          </div>
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-wide text-brand-muted">Different buyer scenarios</p>
        <div className="mt-2 divide-y divide-brand-border text-sm">
          {scenarios.map((s) => (
            <div key={s.scenario} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2.5">
              <span className="text-brand-ink">{s.label}</span>
              <span className="flex-shrink-0 font-semibold text-brand-ink">{gbpM(s.amount)} SDLT</span>
            </div>
          ))}
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] leading-relaxed text-brand-muted">
          Calculated using current published England/NI SDLT rates, assuming the transaction qualifies for those
          rates. Corporate purchases, reliefs and special circumstances can change the calculation.
          <Source label="gov.uk" />
        </p>
      </div>

      {/* Everything else the analysis already covered. */}
      {otherMetrics.length > 1 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {otherMetrics.slice(1).map((m) => {
            const Icon = MetricIcon[m.icon];
            return (
              <div key={m.key} className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">{m.label}</p>
                  <p className="truncate text-sm font-semibold text-brand-ink">{m.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Positives
            </p>
            <ul className="mt-2 space-y-1.5">
              {positives.map((i) => (
                <li key={i} className="text-sm leading-snug text-brand-ink">{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Consider
            </p>
            <ul className="mt-2 space-y-1.5">
              {consider.map((i) => (
                <li key={i} className="text-sm leading-snug text-brand-ink">{i}</li>
              ))}
            </ul>
          </div>
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="mt-5 rounded-2xl bg-brand-blue-light/40 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-blue">Suggested next steps</p>
            <ul className="mt-2 space-y-1.5">
              {suggestions.map((i) => (
                <li key={i} className="text-sm leading-snug text-brand-ink">{i}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-5 border-t border-brand-border pt-3 text-[11px] italic text-brand-muted">
          An estimate only, not financial or legal advice. SDLT figures are England/NI rates - Scotland and Wales use
          separate LBTT/LTT systems.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="mx-auto flex items-center gap-1.5 rounded-full border border-brand-border px-4 py-2 text-xs font-semibold text-brand-muted transition-colors hover:border-brand-blue hover:text-brand-blue"
      >
        Show less
      </button>
        </>
      )}
    </div>
  );
}
