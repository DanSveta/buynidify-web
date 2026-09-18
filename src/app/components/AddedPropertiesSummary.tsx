import { Link } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { useListings, type ImportedProperty } from "../context/ListingsContext";

// Sits under the paste-a-link box on Search: a short receipt of what you've
// already added, so you can see the link landed without leaving the page.
// The detail lives on My Properties, and this links straight there.

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function stateOf(p: ImportedProperty, isInvestor: boolean) {
  if (p.agreement) return { label: "In progress", className: "bg-brand-ink text-white" };
  if (p.published)
    return isInvestor
      ? { label: "Live to tenants", className: "bg-brand-blue-light text-brand-blue" }
      : { label: "Sent to investors", className: "bg-brand-blue-light text-brand-blue" };
  if (p.analysis) return { label: "Analysed", className: "bg-brand-gold/20 text-brand-gold-dark" };
  return { label: "Not analysed", className: "bg-brand-surface text-brand-muted" };
}

export default function AddedPropertiesSummary() {
  const { role } = useRole();
  const { importedProperties } = useListings();
  const isInvestor = role === "investor";

  const mine = importedProperties.filter((p) =>
    isInvestor ? p.owner === "investor" : p.owner === "tenant"
  );

  if (mine.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-brand-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-brand-ink">
            {mine.length} propert{mine.length === 1 ? "y" : "ies"} added
          </h3>
          <p className="text-xs text-brand-muted">
            {isInvestor
              ? "Run the analysis and publish them to tenants from My Properties."
              : "Investors can see these and offer to buy them."}
          </p>
        </div>
        <Link
          to="/app/my-properties"
          className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
        >
          View all →
        </Link>
      </div>

      <ul className="mt-4 divide-y divide-brand-border">
        {mine.slice(0, 4).map((p) => {
          const state = stateOf(p, isInvestor);
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-brand-ink">{p.title}</span>
                <span className="block text-[11px] text-brand-muted">
                  {p.location} · {gbp.format(p.price)} · via {p.portal}
                </span>
              </span>
              <span
                className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${state.className}`}
              >
                {state.label}
              </span>
            </li>
          );
        })}
      </ul>

      {mine.length > 4 && (
        <Link
          to="/app/my-properties"
          className="mt-2 inline-block text-xs font-semibold text-brand-blue hover:underline"
        >
          and {mine.length - 4} more →
        </Link>
      )}
    </div>
  );
}
