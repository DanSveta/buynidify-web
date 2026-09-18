import { useMemo, useState } from "react";
import { useRole } from "../context/RoleContext";
import { useListings, type Agreement } from "../context/ListingsContext";
import { selfProfile } from "../utils/profiles";
import { propertyImage } from "../utils/propertyImages";
import Avatar from "../components/Avatar";
import DealDetailPanel, { fallbackTenantProfile, type DealCard } from "../components/DealDetailPanel";
import { exampleDeal } from "../data/exampleDeal";

// The Deal Tracker used to read a disconnected mock array that had no
// relationship to anything either persona actually did - a running demo
// couldn't produce a deal that showed up here. It now reads real agreements
// off the properties themselves (the same `agreement` an investor starts
// from My Properties), plus one fully worked example so there's always at
// least one deal that walks all the way from request sent to tenant moved
// in, to show what the finished shape looks like.

export default function Deals() {
  const { role, namesByRole } = useRole();
  const { importedProperties, advanceAgreement } = useListings();
  const viewerRole: "investor" | "tenant" = role === "tenant" ? "tenant" : "investor";
  const [tab, setTab] = useState<"progress" | "running">("progress");
  const [openId, setOpenId] = useState<string | null>(null);

  const deals = useMemo<DealCard[]>(() => {
    const real = importedProperties
      .filter((p): p is typeof p & { agreement: Agreement } => !!p.agreement)
      // An investor sees every property they've put into an agreement. A
      // tenant only sees the ones where THEY are the tenant on it - not
      // every stranger who happens to be mid-deal on someone's listing.
      .filter((p) => (viewerRole === "investor" ? p.owner === "investor" : p.agreement.tenantId === "you"))
      .map((p): DealCard => ({
        id: p.id,
        title: p.title,
        location: p.location,
        imageUrl: p.imageUrl ?? propertyImage(p.id, p.type),
        price: p.price,
        agreement: p.agreement,
        investor: selfProfile(`investor-${p.id}`, namesByRole.investor, "Investor"),
        tenant:
          p.agreement.tenantId === "you"
            ? selfProfile(`tenant-${p.id}`, namesByRole.tenant, "Tenant")
            : fallbackTenantProfile(p.agreement),
        isExample: false,
        onAdvance: (by) => advanceAgreement(p.id, by),
      }));

    const example: DealCard = {
      id: exampleDeal.id,
      title: exampleDeal.title,
      location: exampleDeal.address,
      imageUrl: exampleDeal.imageUrl,
      price: exampleDeal.price,
      agreement: exampleDeal.agreement,
      investor: exampleDeal.investor,
      tenant: exampleDeal.tenant,
      isExample: true,
    };

    return [...real, example];
  }, [importedProperties, viewerRole, namesByRole, advanceAgreement]);

  const inProgress = deals.filter((d) => d.agreement.stage !== "tenancy-active");
  const running = deals.filter((d) => d.agreement.stage === "tenancy-active");
  const shown = tab === "progress" ? inProgress : running;
  const open = deals.find((d) => d.id === openId) ?? null;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">Deal Tracker</h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        Every step from match to tenant moved in, visible to both sides. Steps in{" "}
        <span className="font-semibold text-red-600">red</span> are handled by the Buynidify team, not
        by you or the other side - you're kept informed, not asked to act.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("progress")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "progress"
              ? "border-brand-blue bg-brand-blue text-white"
              : "border-brand-border bg-white text-brand-muted hover:border-brand-blue hover:text-brand-blue"
          }`}
        >
          In progress
          <span className={`ml-1.5 ${tab === "progress" ? "text-white/70" : "text-brand-muted"}`}>
            {inProgress.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("running")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "running"
              ? "border-brand-blue bg-brand-blue text-white"
              : "border-brand-border bg-white text-brand-muted hover:border-brand-blue hover:text-brand-blue"
          }`}
        >
          Signed &amp; running
          <span className={`ml-1.5 ${tab === "running" ? "text-white/70" : "text-brand-muted"}`}>
            {running.length}
          </span>
        </button>
      </nav>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
          Nothing here yet. A deal starts once {viewerRole === "investor" ? "you request to proceed with an interested tenant from My Properties" : "an investor agrees to proceed with your interest"}.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((deal) => {
            const current = deal.agreement.stage;
            const stageLabel =
              current === "tenancy-active"
                ? "Tenant moved in"
                : current.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
            return (
              <button
                key={deal.id}
                type="button"
                onClick={() => setOpenId(deal.id)}
                className={`flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  deal.isExample ? "border-dashed border-brand-gold" : "border-brand-border"
                }`}
              >
                <div className="relative h-36 w-full flex-shrink-0">
                  <img src={deal.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {deal.isExample && (
                    <span className="absolute left-3 top-3 rounded-full bg-brand-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-ink">
                      Worked example
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center -space-x-2">
                    <Avatar
                      name={deal.investor.name}
                      initials={deal.investor.initials}
                      photoUrl={deal.investor.photoUrl}
                      size="xs"
                      ring="ring-2 ring-white"
                    />
                    <Avatar
                      name={deal.tenant.name}
                      initials={deal.tenant.initials}
                      photoUrl={deal.tenant.photoUrl}
                      size="xs"
                      ring="ring-2 ring-white"
                    />
                  </div>
                  <h3 className="mt-2 font-display text-base font-semibold leading-snug text-brand-ink">
                    {deal.title}
                  </h3>
                  <p className="mt-0.5 truncate text-sm text-brand-muted">{deal.location}</p>
                  <span
                    className={`mt-3 self-start rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      current === "tenancy-active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-brand-blue-light text-brand-blue"
                    }`}
                  >
                    {stageLabel}
                  </span>
                  <span className="mt-3 text-[11px] font-semibold text-brand-blue">
                    View full timeline →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && <DealDetailPanel deal={open} viewerRole={viewerRole} onClose={() => setOpenId(null)} />}
    </div>
  );
}
