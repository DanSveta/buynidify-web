import { useListings } from "../context/ListingsContext";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export default function TenantDemand() {
  const { tenantDemand, respondToDemand, hasInvestorResponded } = useListings();

  return (
    <div>
      <span className="mb-2 inline-block rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-semibold text-brand-gold-dark">
        New · Investor only
      </span>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        Tenant Demand
      </h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        Properties nobody owns yet, where a tenant has already shown real
        interest - including links tenants have pasted in themselves. This is
        the signal that's supposed to bring an investor in, respond fast to
        be first in line.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {tenantDemand.map((entry) => {
          const responded = hasInvestorResponded(entry.id);
          const totalInterested = entry.seedInterestedTenants + (entry.source === "imported" ? 1 : 0);
          return (
            <div
              key={entry.id}
              className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-semibold text-brand-ink">
                    {entry.city} · {entry.propertyType}
                  </p>
                  {totalInterested > 0 && (
                    <span className="rounded-full bg-brand-blue-light px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
                      {totalInterested} tenant{totalInterested === 1 ? "" : "s"} interested
                    </span>
                  )}
                  {entry.source === "imported" && (
                    <span className="rounded-full bg-brand-surface px-2 py-0.5 text-[11px] font-semibold text-brand-muted">
                      Pasted link
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-brand-muted">{entry.notes}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-muted">
                  {entry.targetPrice ? (
                    <span>
                      Target price: <strong className="text-brand-ink">{gbp.format(entry.targetPrice)}</strong>
                    </span>
                  ) : (
                    <span>
                      Target rent: <strong className="text-brand-ink">{gbp.format(entry.targetRentPerMonth ?? 0)}/mo</strong>
                    </span>
                  )}
                  <span>Min {entry.minBeds} bed</span>
                  <span>
                    Added {entry.addedDaysAgo === 0 ? "today" : `${entry.addedDaysAgo}d ago`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => respondToDemand(entry.id)}
                disabled={responded}
                className="flex-shrink-0 rounded-lg bg-brand-ink px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-black disabled:cursor-default disabled:bg-brand-blue disabled:opacity-100"
              >
                {responded ? "Response sent ✓" : "I'm interested in buying this"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-brand-border bg-brand-surface p-5">
        <p className="text-sm font-semibold text-brand-ink">
          Get alerted to new demand
        </p>
        <p className="mt-1 text-sm text-brand-muted">
          Premium and VIP members get notified the moment new tenant demand
          appears in the areas and price ranges they already care about.
        </p>
      </div>
    </div>
  );
}
