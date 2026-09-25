import { Link } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { useListings, type InvestorListing, type TenantDemandEntry } from "../context/ListingsContext";
import { useFavorites } from "../context/FavoritesContext";
import DashboardGreeting from "../components/DashboardGreeting";
import { propertyImage } from "../utils/propertyImages";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

type IconName = "property" | "people" | "income" | "match" | "heart" | "key" | "clock";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const shared = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  if (name === "people") {
    return <svg {...shared}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-4 2.2-6 5.5-6s5 2 5.5 6M16 5.5a3 3 0 0 1 0 5.8M16 14c2.7.2 4.1 1.8 4.5 5" /></svg>;
  }
  if (name === "income") {
    return <svg {...shared}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M7 12h10M10 9.5c0-1 1-1.5 2-1.5s2 .5 2 1.5-1 1.5-2 1.5-2 .5-2 1.5 1 1.5 2 1.5 2-.5 2-1.5M12 7v10" /></svg>;
  }
  if (name === "match") {
    return <svg {...shared}><path d="M8.5 12.5 11 15l5-6M20 12a8 8 0 1 1-4.2-7" /><path d="M16 4h4v4" /></svg>;
  }
  if (name === "heart") {
    return <svg {...shared}><path d="M12 20.5s-7.5-4.6-7.5-9.8A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 3.3c0 5.2-7.5 9.8-7.5 9.8Z" /></svg>;
  }
  if (name === "key") {
    return <svg {...shared}><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M16 7l2 2M14 9l2 2" /></svg>;
  }
  if (name === "clock") {
    return <svg {...shared}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  }
  return <svg {...shared}><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg>;
}

function StatCard({
  icon,
  label,
  value,
  detail,
  emphasis = false,
}: {
  icon: IconName;
  label: string;
  value: string;
  detail: string;
  emphasis?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ${emphasis ? "border-brand-blue bg-brand-blue text-white" : "border-brand-border bg-white"}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${emphasis ? "bg-white/15 text-brand-gold" : "bg-brand-blue-light text-brand-blue"}`}>
          <Icon name={icon} />
        </span>
        <p className={`text-sm font-semibold ${emphasis ? "text-white/80" : "text-brand-muted"}`}>{label}</p>
      </div>
      <p className={`mt-5 font-display text-3xl font-semibold tracking-tight ${emphasis ? "text-white" : "text-brand-ink"}`}>{value}</p>
      <p className={`mt-1 text-xs ${emphasis ? "text-white/65" : "text-brand-muted"}`}>{detail}</p>
      {emphasis && <span className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-brand-gold/15" />}
    </div>
  );
}

/** A horizontal bar per real number - not a fabricated multi-week "trend"
 *  (the previous chart invented 8 points of history with a hardcoded curve
 *  shape, which is exactly the "random numbers, make them right" Véta
 *  flagged: this demo has no actual day-by-day history to chart). Every
 *  value here is one already computed from real account data. */
function BreakdownBars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1.5 flex items-baseline justify-between text-xs">
            <span className="font-semibold text-brand-ink">{r.label}</span>
            <span className="text-brand-muted">{r.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-brand-border">
            <div
              className="h-full rounded-full bg-brand-blue"
              style={{ width: `${r.value === 0 ? 0 : Math.max(6, (r.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PipelineRing({ percent, title, detail }: { percent: number; title: string; detail: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-44 rounded-full" style={{ background: `conic-gradient(var(--color-brand-blue) 0 ${percent}%, var(--color-brand-gold) ${percent}% ${Math.min(100, percent + 8)}%, var(--color-brand-border) ${Math.min(100, percent + 8)}% 100%)` }}>
        <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-white text-center">
          <p className="font-display text-3xl font-semibold text-brand-blue">{percent}%</p>
          <p className="mt-1 text-xs text-brand-muted">{title}</p>
        </div>
      </div>
      <p className="mt-5 max-w-xs text-center text-sm text-brand-muted">{detail}</p>
    </div>
  );
}

function SectionTitle({ title, subtitle, to, link }: { title: string; subtitle?: string; to?: string; link?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-brand-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>}
      </div>
      {to && link && <Link to={to} className="text-xs font-semibold text-brand-blue hover:underline">{link} →</Link>}
    </div>
  );
}

function DemandCard({ demand, responded }: { demand: TenantDemandEntry; responded: boolean }) {
  const price = demand.targetPrice ? gbp.format(demand.targetPrice) : "Price on portal";
  return (
    <a
      href={`/property/${demand.id}?kind=demand`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-brand-border bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-36 overflow-hidden bg-brand-surface">
        <img src={demand.imageUrl ?? propertyImage(demand.id, demand.propertyType, 700)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-brand-blue shadow-sm backdrop-blur">Tenant demand</span>
      </div>
      <div className="p-4">
        <p className="font-display text-base font-semibold text-brand-ink">{demand.minBeds}-bed {demand.propertyType} in {demand.city}</p>
        <p className="mt-1 text-sm font-semibold text-brand-blue">{price}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-muted">{demand.notes}</p>
        <div className="mt-4 flex items-center justify-between border-t border-brand-border pt-3">
          <span className="text-xs text-brand-muted">{demand.targetRentPerMonth ? `${gbp.format(demand.targetRentPerMonth)}/mo target` : "Ready to connect"}</span>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${responded ? "bg-brand-blue-light text-brand-blue" : "bg-brand-gold/20 text-brand-gold-dark"}`}>{responded ? "Request sent" : "New opportunity"}</span>
        </div>
      </div>
    </a>
  );
}

function ListingSuggestion({ listing, saved }: { listing: InvestorListing; saved: boolean }) {
  return (
    <a
      href={`/property/${listing.id}?kind=listing`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-brand-border bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-36 overflow-hidden bg-brand-surface">
        <img src={listing.imageUrl ?? propertyImage(listing.id, listing.type, 700)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-brand-blue shadow-sm backdrop-blur">From an investor</span>
      </div>
      <div className="p-4">
        <p className="font-display text-base font-semibold text-brand-ink">{listing.address}</p>
        <p className="text-sm text-brand-muted">{listing.city} · {listing.beds} bed {listing.type.toLowerCase()}</p>
        <p className="mt-3 font-display text-xl font-semibold text-brand-blue">{listing.monthlyRent ? `${gbp.format(listing.monthlyRent)}/mo` : "Rent on request"}</p>
        <div className="mt-4 flex items-center justify-between border-t border-brand-border pt-3">
          <span className="text-xs text-brand-muted">{listing.minTenancy ?? "12 months"} minimum</span>
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${saved ? "bg-brand-gold/20 text-brand-gold-dark" : "bg-brand-blue-light text-brand-blue"}`}><Icon name="heart" className="h-3 w-3" />{saved ? "Saved" : "Available"}</span>
        </div>
      </div>
    </a>
  );
}

function EmptyAction({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-brand-border bg-brand-surface p-4 text-sm text-brand-muted">{children}</div>;
}

function InvestorOverview() {
  const {
    investorListings,
    tenantDemand,
    importedProperties,
    connections,
    matches,
    interestedTenantsFor,
    hasInvestorResponded,
  } = useListings();

  const mine = importedProperties.filter((property) => property.owner === "investor");
  const live = mine.filter((property) => property.published);
  const agreements = mine.filter((property) => property.agreement);
  const tenantSignals = investorListings.reduce((sum, listing) => sum + interestedTenantsFor(listing.id).length, 0);
  const mutualMatches = matches.length + connections.filter((connection) => connection.accepted).length;
  const projectedRent = investorListings.reduce((sum, listing) => sum + (listing.monthlyRent ?? Math.round((listing.price * 0.05) / 12 / 5) * 5), 0);
  const portfolioValue = investorListings.reduce((sum, listing) => sum + listing.price, 0);
  const readyScore = mine.length === 0
    ? 0
    : Math.min(100, Math.round(((live.length + agreements.length * 2 + tenantSignals) / Math.max(1, mine.length * 3 + 2)) * 100));
  const needsAnalysis = mine.filter((property) => !property.analysis);
  const needsPublishing = mine.filter((property) => property.analysis && !property.published);
  const incoming = connections.filter((connection) => connection.kind === "listing" && connection.by === "tenant" && !connection.accepted);

  return (
    <div>
      <DashboardGreeting
        subtitle="A live view of your property opportunities, tenant demand and next actions."
        action={<Link to="/app/search" className="rounded-xl bg-brand-cta px-4 py-2.5 text-sm font-semibold text-brand-cta-text shadow-sm transition-transform hover:-translate-y-0.5">+ Add a property</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="property" label="Property opportunities" value={`${investorListings.length}`} detail={`${live.length} published by you`} />
        <StatCard icon="people" label="Tenant signals" value={`${tenantSignals}`} detail={`${incoming.length} waiting for your reply`} />
        <StatCard icon="income" label="Projected monthly rent" value={gbp.format(projectedRent)} detail={`${gbp.format(portfolioValue)} total opportunity value`} emphasis />
        <StatCard icon="match" label="Mutual matches" value={`${mutualMatches}`} detail={`${agreements.length} agreement${agreements.length === 1 ? "" : "s"} in progress`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
        <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
          <SectionTitle title="Portfolio breakdown" subtitle="Where your own properties actually stand right now." to="/app/my-properties" link="Open portfolio" />
          <div className="mt-6">
            <BreakdownBars
              rows={[
                { label: "Your properties", value: mine.length },
                { label: "Published to tenants", value: live.length },
                { label: "Tenant signals", value: tenantSignals },
                { label: "Agreements in progress", value: agreements.length },
              ]}
            />
          </div>
        </section>
        <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
          <SectionTitle title="Pipeline readiness" subtitle="How close your own properties are to a secured tenancy." />
          <div className="mt-7"><PipelineRing percent={readyScore} title="ready to proceed" detail={`${live.length} live · ${tenantSignals} tenant signals · ${agreements.length} agreements`} /></div>
          <Link to="/app/my-properties" className="mt-6 block rounded-xl bg-brand-surface px-4 py-3 text-center text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue-light">Review your pipeline →</Link>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
          <SectionTitle title="Needs your attention" subtitle="The fastest actions to move an opportunity forward." />
          <div className="mt-4 space-y-3">
            {incoming.length > 0 && <Link to="/app/matches" className="flex items-center gap-3 rounded-xl border border-brand-border p-4 transition-colors hover:border-brand-blue hover:bg-brand-surface"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/20 text-brand-gold-dark"><Icon name="people" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-brand-ink">Review {incoming.length} tenant request{incoming.length === 1 ? "" : "s"}</span><span className="block text-xs text-brand-muted">Tenants are waiting for your response.</span></span><span className="text-brand-blue">→</span></Link>}
            {needsAnalysis.length > 0 && <Link to="/app/my-properties" className="flex items-center gap-3 rounded-xl border border-brand-border p-4 transition-colors hover:border-brand-blue hover:bg-brand-surface"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue"><Icon name="income" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-brand-ink">Analyse {needsAnalysis.length} added propert{needsAnalysis.length === 1 ? "y" : "ies"}</span><span className="block text-xs text-brand-muted">Estimate rent, yield and tenant demand.</span></span><span className="text-brand-blue">→</span></Link>}
            {needsPublishing.length > 0 && <Link to="/app/my-properties" className="flex items-center gap-3 rounded-xl border border-brand-border p-4 transition-colors hover:border-brand-blue hover:bg-brand-surface"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue"><Icon name="property" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-brand-ink">Publish {needsPublishing.length} analysed propert{needsPublishing.length === 1 ? "y" : "ies"}</span><span className="block text-xs text-brand-muted">Start validating real tenant interest.</span></span><span className="text-brand-blue">→</span></Link>}
            {incoming.length === 0 && needsAnalysis.length === 0 && needsPublishing.length === 0 && <EmptyAction>You are all caught up. Explore tenant demand to find your next opportunity.</EmptyAction>}
          </div>
        </section>

        <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
          <SectionTitle title="Recent activity" subtitle="The latest movement across your account." to="/app/matches" link="View matches" />
          <div className="mt-4 divide-y divide-brand-border">
            {connections.slice(-3).reverse().map((connection) => (
              <div key={connection.id} className="flex items-center gap-3 py-3.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue"><Icon name={connection.accepted ? "match" : "clock"} className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-brand-ink">{connection.accepted ? "A mutual match was created" : connection.by === "tenant" ? "A tenant registered interest" : "You approached a tenant request"}</span><span className="block truncate text-xs text-brand-muted">Property reference {connection.id}</span></span><span className="text-[11px] text-brand-muted">Recent</span></div>
            ))}
            {connections.length === 0 && <div className="py-4"><EmptyAction>Your activity will appear here after you publish or approach a tenant request.</EmptyAction></div>}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <SectionTitle title="Properties tenants already want" subtitle="Demand-led opportunities where a tenant is waiting for an investor." to="/listings" link="Explore all demand" />
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tenantDemand.slice(0, 3).map((demand) => <DemandCard key={demand.id} demand={demand} responded={hasInvestorResponded(demand.id)} />)}
        </div>
      </section>
    </div>
  );
}

function TenantOverview() {
  const {
    investorListings,
    importedProperties,
    connections,
    matches,
    hasExpressedInterest,
  } = useListings();
  const { favoriteIds } = useFavorites();

  const requests = importedProperties.filter((property) => property.owner === "tenant");
  const investorResponses = connections.filter((connection) => connection.kind === "demand" && connection.by === "investor");
  const tenantInterest = connections.filter((connection) => connection.kind === "listing" && connection.by === "tenant");
  const mutualMatches = matches.length + connections.filter((connection) => connection.accepted).length;
  // Deals where you're the tenant and it isn't a finished tenancy yet - the
  // real agreement data an investor starts from their side, not a mock list
  // that never reflected what actually happened in this account.
  const activeDeals = importedProperties.filter(
    (property) =>
      property.agreement && property.agreement.tenantId === "you" && property.agreement.stage !== "tenancy-active"
  ).length;
  const readiness = requests.length === 0 ? 50 : Math.min(100, 55 + requests.filter((property) => property.analysis).length * 12 + mutualMatches * 15);

  return (
    <div>
      <DashboardGreeting
        subtitle="Your home search, investor interest and next steps in one place."
        action={<Link to="/app/search" className="rounded-xl bg-brand-cta px-4 py-2.5 text-sm font-semibold text-brand-cta-text shadow-sm transition-transform hover:-translate-y-0.5">Find a home</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="property" label="Homes requested" value={`${requests.length}`} detail="For-sale homes you want to rent" />
        <StatCard icon="people" label="Investors interested" value={`${investorResponses.length}`} detail="Responses to your requests" />
        <StatCard icon="heart" label="Saved and approached" value={`${favoriteIds.size + tenantInterest.length}`} detail={`${favoriteIds.size} saved · ${tenantInterest.length} interest sent`} emphasis />
        <StatCard icon="key" label="Active journeys" value={`${activeDeals + mutualMatches}`} detail={`${mutualMatches} mutual match${mutualMatches === 1 ? "" : "es"}`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
        <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
          <SectionTitle title="Search breakdown" subtitle="Where your home search actually stands right now." to="/app/search" link="Continue searching" />
          <div className="mt-6">
            <BreakdownBars
              rows={[
                { label: "Homes available to browse", value: investorListings.length },
                { label: "Homes requested", value: requests.length },
                { label: "Interest sent", value: tenantInterest.length },
                { label: "Investor responses", value: investorResponses.length },
              ]}
            />
          </div>
        </section>
        <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
          <SectionTitle title="Ready to move" subtitle="Your progress toward a confident application." />
          <div className="mt-7"><PipelineRing percent={readiness} title="search ready" detail={`${requests.length} requests · ${investorResponses.length} investor responses · ${mutualMatches} matches`} /></div>
          <Link to="/app/profile" className="mt-6 block rounded-xl bg-brand-surface px-4 py-3 text-center text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue-light">Complete your profile →</Link>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
          <SectionTitle title="Your next steps" subtitle="Keep your home search moving." />
          <div className="mt-4 space-y-3">
            {investorResponses.length > 0 && <Link to="/app/matches" className="flex items-center gap-3 rounded-xl border border-brand-border p-4 transition-colors hover:border-brand-blue hover:bg-brand-surface"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/20 text-brand-gold-dark"><Icon name="people" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-brand-ink">Review investor interest</span><span className="block text-xs text-brand-muted">An investor may be ready to buy a home you requested.</span></span><span className="text-brand-blue">→</span></Link>}
            <a href="/listings" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-brand-border p-4 transition-colors hover:border-brand-blue hover:bg-brand-surface"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue"><Icon name="property" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-brand-ink">Browse investor opportunities</span><span className="block text-xs text-brand-muted">See homes investors are considering buying.</span></span><span className="text-brand-blue">↗</span></a>
            <Link to="/app/search" className="flex items-center gap-3 rounded-xl border border-brand-border p-4 transition-colors hover:border-brand-blue hover:bg-brand-surface"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue"><Icon name="heart" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-brand-ink">Add a home you found for sale</span><span className="block text-xs text-brand-muted">Ask the investor community to buy it for you to rent.</span></span><span className="text-brand-blue">→</span></Link>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
          <SectionTitle title="Journey snapshot" subtitle="Where your current opportunities stand." to="/app/matches" link="Open matches" />
          <div className="mt-5 space-y-5">
            {[
              ["Homes saved", favoriteIds.size, Math.max(1, favoriteIds.size + tenantInterest.length + mutualMatches)],
              ["Interest registered", tenantInterest.length, Math.max(1, tenantInterest.length + mutualMatches)],
              ["Mutual matches", mutualMatches, Math.max(1, mutualMatches + 2)],
            ].map(([label, value, total]) => (
              <div key={String(label)}><div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-brand-ink">{label}</span><span className="text-brand-muted">{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-brand-border"><div className="h-full rounded-full bg-brand-blue" style={{ width: `${Math.max(Number(value) > 0 ? 12 : 0, (Number(value) / Number(total)) * 100)}%` }} /></div></div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <SectionTitle title="Homes that may interest you" subtitle="Properties investors have published and are looking to match with a tenant." to="/listings" link="Browse all homes" />
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {investorListings.slice(0, 3).map((listing) => <ListingSuggestion key={listing.id} listing={listing} saved={favoriteIds.has(listing.id) || hasExpressedInterest(listing.id)} />)}
        </div>
      </section>
    </div>
  );
}

export default function Overview() {
  const { role } = useRole();
  return role === "investor" ? <InvestorOverview /> : <TenantOverview />;
}
