import { useRole } from "../context/RoleContext";
import { dealStages, deals, type DealStage } from "../data/mockData";
import { useListings } from "../context/ListingsContext";

function stageIndex(stage: DealStage) {
  return dealStages.findIndex((s) => s.id === stage);
}

export default function Deals() {
  const { role } = useRole();
  const { matchesAsDeals } = useListings();
  const allDeals = [...matchesAsDeals, ...deals];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        Deal Tracker
      </h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        Every step from match to signed lease, visible to both sides. Right
        now a Buynidify coordinator handles the handoff personally after each
        match, this view is built to hold real in-app messaging later without
        a redesign.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {allDeals.map((deal) => {
          const current = stageIndex(deal.stage);
          return (
            <div
              key={deal.id}
              className="rounded-2xl border border-brand-border bg-white p-5"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-semibold text-brand-ink">
                    {deal.propertyAddress}
                  </p>
                  <p className="text-sm text-brand-muted">
                    {deal.city} · Investor {deal.investorInitials} · Tenant{" "}
                    {deal.tenantInitials}
                  </p>
                </div>
                <span className="text-xs text-brand-muted">
                  Updated {deal.updatedDaysAgo === 0 ? "today" : `${deal.updatedDaysAgo}d ago`}
                </span>
              </div>

              <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
                {dealStages.map((stage, i) => {
                  const done = i <= current;
                  const isCurrent = i === current;
                  return (
                    <li
                      key={stage.id}
                      className="flex flex-1 items-start gap-3 sm:flex-col sm:items-stretch"
                    >
                      <div className="flex items-center sm:w-full">
                        <span
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                            done
                              ? "bg-brand-blue text-white"
                              : "bg-brand-border text-brand-muted"
                          }`}
                        >
                          {i + 1}
                        </span>
                        {i < dealStages.length - 1 && (
                          <span
                            className={`hidden h-0.5 flex-1 sm:block ${
                              i < current ? "bg-brand-blue" : "bg-brand-border"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-4 sm:pb-0 sm:pt-2">
                        <p
                          className={`text-sm font-semibold ${
                            isCurrent ? "text-brand-blue" : "text-brand-ink"
                          }`}
                        >
                          {stage.label}
                        </p>
                        <p className="text-xs text-brand-muted">
                          {stage.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {role === "tenant" && current < dealStages.length - 1 && (
                <p className="mt-3 rounded-lg bg-brand-surface p-3 text-xs text-brand-muted">
                  A Buynidify coordinator will contact you with next steps for
                  this stage.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
