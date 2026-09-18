import { Link } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { useListings, type ImportedProperty } from "../context/ListingsContext";
import { propertyImage } from "../utils/propertyImages";

// Sits under the paste-a-link box on Search: a short receipt of what you've
// already added, so you can see the link landed without leaving the page.
// The detail lives on My Properties, and this links straight there.

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function stateOf(p: ImportedProperty, isInvestor: boolean) {
  if (p.agreement) return { label: "In progress", className: "bg-brand-ink text-white", live: false };
  if (p.published)
    return isInvestor
      ? { label: "Live to tenants", className: "bg-emerald-100 text-emerald-700", live: true }
      : { label: "Sent to investors", className: "bg-emerald-100 text-emerald-700", live: true };
  if (p.analysis)
    return { label: "Analysed", className: "bg-brand-gold/20 text-brand-gold-dark", live: false };
  return { label: "Not analysed", className: "bg-brand-surface text-brand-muted", live: false };
}

export default function AddedPropertiesSummary() {
  const { role } = useRole();
  const { importedProperties } = useListings();
  const isInvestor = role === "investor";
  // Signed out you're still adding properties, they're just held as yours
  // until you join, so this shows them the same way.
  const myProperties = role ? "/app/my-properties" : "/my-properties";

  const mine = importedProperties.filter((p) =>
    role ? (isInvestor ? p.owner === "investor" : p.owner === "tenant") : p.owner === "guest"
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
            {role && !isInvestor
              ? "Investors can see these and offer to buy them."
              : "Run the analysis and publish them to tenants from My Properties."}
          </p>
        </div>
        <Link
          to={myProperties}
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
              <img
                src={p.imageUrl ?? propertyImage(p.id, p.type)}
                alt=""
                loading="lazy"
                className="h-12 w-16 flex-shrink-0 rounded-lg object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-brand-ink">{p.title}</span>
                <span className="block text-[11px] text-brand-muted">
                  {p.location} · {gbp.format(p.price)} · via {p.portal}
                </span>
              </span>
              <span
                className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${state.className}`}
              >
                {state.live && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />}
                {state.label}
              </span>
            </li>
          );
        })}
      </ul>

      {mine.length > 4 && (
        <Link
          to={myProperties}
          className="mt-2 inline-block text-xs font-semibold text-brand-blue hover:underline"
        >
          and {mine.length - 4} more →
        </Link>
      )}
    </div>
  );
}
