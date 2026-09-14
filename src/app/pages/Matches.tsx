import { Link } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { deals } from "../data/mockData";
import { useListings } from "../context/ListingsContext";

const stageLabel: Record<string, string> = {
  matched: "New match",
  "deposit-paid": "Deposit paid",
  "purchase-in-progress": "Purchase in progress",
  "lease-signed": "Lease signed",
};

export default function Matches() {
  const { role } = useRole();
  const isTenant = role === "tenant";
  const { matchesAsDeals } = useListings();
  const allDeals = [...matchesAsDeals, ...deals];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        {isTenant ? "Matched!" : "Mutual Matches"}
      </h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        {isTenant
          ? "When you and an investor both express interest in the same home, it shows up here. Each match opens into the full Deal Tracker."
          : "Tenants and investors who've both expressed interest in the same property. Each match opens into the full Deal Tracker."}
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {allDeals.length === 0 && (
          <p className="rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
            No matches yet. Show interest in properties you like - when the other side does too, it'll show up here.
          </p>
        )}
        {allDeals.map((deal) => (
          <Link
            key={deal.id}
            to="/app/deals"
            className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-white p-5 transition-colors hover:border-brand-blue sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-display text-lg font-semibold text-brand-ink">
                {deal.propertyAddress}
              </p>
              <p className="text-sm text-brand-muted">
                {deal.city} · Investor {deal.investorInitials} · Tenant {deal.tenantInitials}
              </p>
            </div>
            <span
              className={`flex-shrink-0 self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto ${
                deal.stage === "matched"
                  ? "bg-brand-gold/20 text-brand-gold-dark"
                  : deal.stage === "lease-signed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-brand-blue-light text-brand-blue"
              }`}
            >
              {stageLabel[deal.stage]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
