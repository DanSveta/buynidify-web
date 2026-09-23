import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import {
  agoLabel,
  useListings,
  type ConnectionRecord,
  type AgreementActor,
  type ImportedProperty,
} from "../context/ListingsContext";
import {
  investorProfileFor,
  tenantProfileFor,
  selfProfile,
  type PartyProfile,
} from "../utils/profiles";
import { propertyImage } from "../utils/propertyImages";
import ProfileBody, { ProfileHeader } from "../components/ProfileBody";
import Avatar from "../components/Avatar";
import AgreementTimeline from "../components/AgreementTimeline";
import DealDetailPanel, { fallbackTenantProfile, type DealCard } from "../components/DealDetailPanel";
import { exampleDeal } from "../data/exampleDeal";

// Matches is where an approach either turns into a deal or dies quietly, so
// this page has to show all three states, not just the happy one:
//
//   Waiting on them  - you reached out, nobody has answered. Chase it.
//   Waiting on you   - someone reached out about your property. Answer it.
//   Matched          - both sides said yes. It moves to the deal tracker.
//
// A match is both sides agreeing. Registering interest is the tenant's half;
// the investor accepting is the other. Until then it is an open approach, and
// pretending otherwise is what made this page look broken.
//
// Each row is deliberately light - a photo, a headline, who it's with, one
// status word. Everything else (verification, the full property, what to do
// next) lives behind a click, in the same detail panel used to open a
// profile everywhere else on the platform.

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

type Row = {
  connection: ConnectionRecord;
  title: string;
  address: string;
  city: string;
  price: number;
  priceLabel: string;
  beds: number;
  propertyType: string;
  imageUrl: string;
  sourceUrl?: string;
  portal?: string;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyRole: "investor" | "tenant";
  profile: PartyProfile;
  context: string;
  /** The counterparty shown here is actually your own other persona - the
   *  same browser playing both sides of the demo. */
  yours: boolean;
  /** Both sides of the relationship, regardless of who's viewing - needed
   *  to show the deal timeline (which always needs both) once matched,
   *  rather than just whichever side counts as "the counterparty" here. */
  investorProfile: PartyProfile;
  tenantProfile: PartyProfile;
};

function StatusChip({ connection }: { connection: ConnectionRecord }) {
  if (connection.accepted) {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
        Mutual match
      </span>
    );
  }
  if (connection.nudges > 0) {
    return (
      <span className="rounded-full bg-brand-gold/20 px-3 py-1 text-[11px] font-bold text-brand-gold-dark">
        Chased {connection.nudges}
        {connection.nudges === 1 ? " time" : " times"}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-brand-surface px-3 py-1 text-[11px] font-bold text-brand-muted">
      Awaiting reply
    </span>
  );
}

/** The full picture behind one row: the property, then who it's with, then
 *  what to do about it. Same slide-in shape as every other profile panel on
 *  the platform, with a property summary added above it. */
function MatchDetailPanel({
  row,
  tab,
  interestedCount,
  dealProperty,
  viewerRole,
  onAdvanceDeal,
  onClose,
  onAccept,
  onNudge,
  onMessage,
  onWithdraw,
}: {
  row: Row;
  tab: "matched" | "outgoing" | "incoming";
  interestedCount: number;
  /** Set once this match has moved into a real agreement - shows the live
   *  timeline right here instead of sending you off to look it up again. */
  dealProperty?: ImportedProperty;
  viewerRole: "investor" | "tenant";
  onAdvanceDeal: (by: AgreementActor) => void;
  onClose: () => void;
  onAccept: () => void;
  onNudge: () => void;
  onMessage: () => void;
  onWithdraw: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-brand-border p-5">
          <p className="font-display text-lg font-semibold text-brand-ink">Match details</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-brand-muted hover:text-brand-ink">
            ✕
          </button>
        </div>

        <div className="grid flex-1 gap-0 overflow-y-auto sm:grid-cols-2">
          {/* The property */}
          <div className="border-b border-brand-border p-5 sm:border-b-0 sm:border-r">
            <div className="overflow-hidden rounded-2xl border border-brand-border">
              <img src={row.imageUrl} alt="" className="h-48 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <StatusChip connection={row.connection} />
                  <span className="text-[11px] text-brand-muted">
                    {row.connection.by === "tenant" ? "Interest registered" : "Request sent"}{" "}
                    {agoLabel(row.connection.at)}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-brand-ink">
                  {row.title}
                </h3>
                <p className="text-sm text-brand-muted">{row.address}, {row.city}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-brand-surface px-2 py-2">
                    <p className="text-[10px] uppercase text-brand-muted">Price</p>
                    <p className="text-sm font-semibold text-brand-ink">{row.priceLabel}</p>
                  </div>
                  <div className="rounded-lg bg-brand-surface px-2 py-2">
                    <p className="text-[10px] uppercase text-brand-muted">Beds</p>
                    <p className="text-sm font-semibold text-brand-ink">
                      {row.beds === 0 ? "Studio" : row.beds}
                    </p>
                  </div>
                  <div className="rounded-lg bg-brand-surface px-2 py-2">
                    <p className="text-[10px] uppercase text-brand-muted">Type</p>
                    <p className="truncate text-sm font-semibold text-brand-ink">{row.propertyType}</p>
                  </div>
                </div>
                {interestedCount > 1 && (
                  <p className="mt-2 text-[11px] text-brand-muted">
                    {interestedCount} tenants interested in this property in total.
                  </p>
                )}
                {row.sourceUrl && (
                  <a
                    href={row.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-[11px] font-semibold text-brand-blue hover:underline"
                  >
                    View original listing{row.portal ? ` on ${row.portal}` : ""} ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Who it's with */}
          <div className="p-5">
            <ProfileHeader profile={row.profile} isYou={row.yours} />
            <div className="mt-4">
              <ProfileBody profile={row.profile} />
            </div>
          </div>
        </div>

        {/* Once matched and moved into an agreement, the deal's real
         *  progress lives right here - no second click to another page to
         *  see the same card again. */}
        {dealProperty?.agreement && (
          <div className="border-t border-brand-border p-5">
            <AgreementTimeline
              agreement={dealProperty.agreement}
              investor={row.investorProfile}
              tenant={row.tenantProfile}
              viewerRole={viewerRole}
              onAdvance={onAdvanceDeal}
              compact
            />
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-brand-border p-5 sm:flex-row">
          {row.connection.accepted ? null : tab === "incoming" ? (
            <button
              type="button"
              onClick={onAccept}
              className="flex-1 rounded-lg bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              Accept and proceed
            </button>
          ) : (
            <button
              type="button"
              onClick={onNudge}
              className="flex-1 rounded-lg bg-brand-gold px-4 py-3 text-sm font-semibold text-brand-ink transition-colors hover:brightness-95"
            >
              {row.connection.nudges > 0 ? "Nudge again" : "Nudge them"}
            </button>
          )}
          <button
            type="button"
            onClick={onMessage}
            className="flex-1 rounded-lg border border-brand-border px-4 py-3 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
          >
            Message
          </button>
          {!row.connection.accepted && (
            <button
              type="button"
              onClick={onWithdraw}
              className="flex-shrink-0 text-center text-[11px] font-semibold text-brand-muted hover:text-red-600 sm:self-center"
            >
              Withdraw this {tab === "incoming" ? "request" : "interest"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Matches() {
  const { role, namesByRole } = useRole();
  const isTenant = role === "tenant";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    connections,
    investorListings,
    tenantDemand,
    interestedTenantsFor,
    acceptConnection,
    nudgeConnection,
    withdrawConnection,
    importedProperties,
    updateImportedProperty,
    advanceAgreement,
    sendMessage,
  } = useListings();

  const viewerRole: "investor" | "tenant" = isTenant ? "tenant" : "investor";

  const [tab, setTab] = useState<"matched" | "outgoing" | "incoming">("matched");
  const [openRow, setOpenRow] = useState<Row | null>(null);
  const [composing, setComposing] = useState<Row | null>(null);
  const [draft, setDraft] = useState("");
  const [openDeal, setOpenDeal] = useState<DealCard | null>(null);

  // Switching tabs while a panel is open is how cards got stuck open before -
  // the panel stayed mounted with stale row data from the previous tab. Any
  // open panel closes the moment you change tabs, and Escape always works.
  useEffect(() => {
    setOpenRow(null);
    setComposing(null);
    setOpenDeal(null);
  }, [tab]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpenRow(null);
      setComposing(null);
      setOpenDeal(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Every connection, resolved against the property it is about, and against
  // who's actually looking at it right now.
  //
  // A listing-interest connection can only ever be created by this browser's
  // own tenant persona (that's the only button that makes one), so the
  // tenant side is always you. Likewise a demand-response connection can
  // only be created by this browser's own investor persona, so the investor
  // side is always you there. What varies by viewer is which side counts as
  // "the counterparty": an investor looking at interest on their own listing
  // needs to see the tenant (you); a tenant looking at the same listing from
  // the outside needs to see the investor who owns it.
  const rows = useMemo<Row[]>(
    () =>
      connections
        .map((connection): Row | null => {
          if (connection.kind === "listing") {
            const listing = investorListings.find((l) => l.id === connection.id);
            if (!listing) return null;
            const ownerIsYou = listing.source === "imported";
            const ownerProfile = ownerIsYou
              ? selfProfile(`investor-${listing.id}`, namesByRole.investor, "Investor")
              : investorProfileFor(listing.id, listing.city, listing.accepts);
            const initiatorProfile = selfProfile(`tenant-${listing.id}`, namesByRole.tenant, "Tenant");
            const viewingAsOwner = !isTenant;
            const profile = viewingAsOwner ? initiatorProfile : ownerProfile;
            const counterpartyRole: "investor" | "tenant" = viewingAsOwner ? "tenant" : "investor";
            const yours = viewingAsOwner ? true : ownerIsYou;
            return {
              connection,
              title: `${listing.beds === 0 ? "Studio" : `${listing.beds}-bedroom`} ${listing.type.toLowerCase()}`,
              address: listing.address,
              city: listing.city,
              price: listing.price,
              priceLabel: listing.monthlyRent
                ? `${gbp.format(listing.monthlyRent)}/mo`
                : gbp.format(listing.price),
              beds: listing.beds,
              propertyType: listing.type,
              imageUrl: listing.imageUrl ?? propertyImage(listing.id, listing.type),
              sourceUrl: listing.url,
              portal: listing.portal,
              counterpartyId: `investor-${listing.id}`,
              counterpartyName: profile.name,
              counterpartyRole,
              profile,
              context: `${listing.address}, ${listing.city}`,
              yours,
              investorProfile: ownerProfile,
              tenantProfile: initiatorProfile,
            };
          }
          const demand = tenantDemand.find((d) => d.id === connection.id);
          if (!demand) return null;
          const ownerIsYou = demand.source === "imported";
          const ownerProfile = ownerIsYou
            ? selfProfile(`tenant-${demand.id}`, namesByRole.tenant, "Tenant")
            : tenantProfileFor(demand.id, demand.city, demand.targetRentPerMonth, demand.minBeds);
          const initiatorProfile = selfProfile(`investor-${demand.id}`, namesByRole.investor, "Investor");
          const viewingAsOwner = isTenant;
          const profile = viewingAsOwner ? initiatorProfile : ownerProfile;
          const counterpartyRole: "investor" | "tenant" = viewingAsOwner ? "investor" : "tenant";
          const yours = viewingAsOwner ? true : ownerIsYou;
          return {
            connection,
            title: `${demand.minBeds === 0 ? "Studio" : `${demand.minBeds}-bedroom`} ${demand.propertyType.toLowerCase()} wanted`,
            address: "Requested",
            city: demand.city,
            price: demand.targetPrice ?? 0,
            priceLabel: demand.targetPrice ? `${gbp.format(demand.targetPrice)} to buy` : "Price on portal",
            beds: demand.minBeds,
            propertyType: demand.propertyType,
            imageUrl: demand.imageUrl ?? propertyImage(demand.id, demand.propertyType),
            sourceUrl: demand.url,
            counterpartyId: `tenant-${demand.id}`,
            counterpartyName: profile.name,
            counterpartyRole,
            profile,
            context: `${demand.minBeds} bedroom ${demand.propertyType} wanted in ${demand.city}`,
            yours,
            investorProfile: initiatorProfile,
            tenantProfile: ownerProfile,
          };
        })
        .filter((r): r is Row => r !== null),
    [connections, investorListings, tenantDemand, namesByRole, isTenant]
  );

  const matched = rows.filter((r) => r.connection.accepted);
  // What you sent: tenants approach listings, investors approach demand.
  const outgoing = rows.filter(
    (r) =>
      !r.connection.accepted &&
      (isTenant ? r.connection.by === "tenant" : r.connection.by === "investor")
  );
  // What landed on you: someone approached a property you added.
  const incoming = rows.filter(
    (r) =>
      !r.connection.accepted &&
      r.yours &&
      (isTenant ? r.connection.by === "investor" : r.connection.by === "tenant")
  );

  // A notification (a new match, someone interested) links here as
  // /app/matches?open=<connectionId> - find that row once it's available and
  // open it straight away, in whichever tab it actually lives in, instead of
  // making you go hunt for it.
  useEffect(() => {
    const wanted = searchParams.get("open");
    if (!wanted) return;
    const row = rows.find((r) => r.connection.id === wanted);
    if (!row) return;
    setTab(matched.includes(row) ? "matched" : incoming.includes(row) ? "incoming" : "outgoing");
    setOpenRow(row);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("open");
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, searchParams]);

  // Real deals already under way - a matched connection becomes one once the
  // investor requests to proceed with a tenant, which is when it gets an
  // `agreement`. The one worked example is always shown alongside them,
  // clearly marked, so there's always at least one deal to look at end to
  // end even on a brand new account.
  const realDeals = useMemo(
    () => importedProperties.filter((p) => !!p.agreement),
    [importedProperties]
  );
  const dealsCount = realDeals.length + 1;

  // The same cards as the standalone Deal Tracker, built here too so opening
  // one is a click, not a trip to another page.
  const dealCards = useMemo<DealCard[]>(() => {
    const real = realDeals.map((p): DealCard => ({
      id: p.id,
      title: p.title,
      location: p.location,
      imageUrl: p.imageUrl ?? propertyImage(p.id, p.type),
      price: p.price,
      agreement: p.agreement!,
      investor: selfProfile(`investor-${p.id}`, namesByRole.investor, "Investor"),
      tenant:
        p.agreement!.tenantId === "you"
          ? selfProfile(`tenant-${p.id}`, namesByRole.tenant, "Tenant")
          : fallbackTenantProfile(p.agreement!),
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
  }, [realDeals, namesByRole, advanceAgreement]);

  // A "deal moved forward" notification links here as
  // /app/matches?deal=<propertyId> - open that deal card directly.
  useEffect(() => {
    const wanted = searchParams.get("deal");
    if (!wanted) return;
    const deal = dealCards.find((d) => d.id === wanted);
    if (!deal) return;
    setOpenDeal(deal);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("deal");
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealCards, searchParams]);

  // When an already-matched connection's property has moved into a real
  // agreement, the match panel shows its live timeline instead of sending
  // you off to look it up again on another page.
  const openRowDealProperty: ImportedProperty | undefined = useMemo(() => {
    if (!openRow || openRow.connection.kind !== "listing") return undefined;
    return importedProperties.find((p) => p.id === openRow.connection.id && !!p.agreement);
  }, [openRow, importedProperties]);

  const tabs = [
    { id: "matched" as const, label: "Mutual matches", count: matched.length + dealsCount },
    {
      id: "outgoing" as const,
      label: isTenant ? "Interest you've sent" : "Requests you've sent",
      count: outgoing.length,
    },
    {
      id: "incoming" as const,
      label: isTenant ? "Investors interested" : "Interest received",
      count: incoming.length,
    },
  ];

  /** Saying yes. For an investor accepting a tenant, the property also enters
   *  the agreement flow, so My Properties and the Deal Tracker pick it up
   *  where this leaves off. The interested tenant is always this browser's
   *  own tenant persona, so the agreement is tagged "you" the same way
   *  My Properties tags it when it starts the agreement instead. */
  function accept(row: Row) {
    acceptConnection(row.connection.id);
    const property = importedProperties.find((p) => p.id === row.connection.id);
    if (property && !property.agreement && row.connection.kind === "listing" && row.counterpartyRole === "tenant") {
      updateImportedProperty(property.id, {
        agreement: {
          tenantId: "you",
          tenantName: row.profile.name,
          tenantInitials: row.profile.initials,
          stage: "matched",
          startedAt: new Date().toISOString(),
        },
      });
    }
    setOpenRow(null);
  }

  function openMessage(row: Row) {
    setOpenRow(null);
    setComposing(row);
    setDraft("");
  }

  function send() {
    if (!composing || !draft.trim()) return;
    sendMessage(
      {
        id: composing.counterpartyId,
        name: composing.counterpartyName,
        context: composing.context,
        profile: composing.profile,
        // Talking to yourself across personas stays visible from both sides;
        // talking to a real or seeded counterparty stays in this persona's
        // inbox only.
        audience: composing.yours ? undefined : role === "investor" || role === "tenant" ? role : undefined,
        selfDealing: composing.yours,
      },
      draft
    );
    setComposing(null);
    setDraft("");
    navigate("/app/messages");
  }

  const shown = tab === "matched" ? matched : tab === "outgoing" ? outgoing : incoming;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        {isTenant ? "Matched!" : "Mutual Matches"}
      </h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        {isTenant
          ? "A match happens when you register interest in a property and the investor agrees to proceed. Until they answer, the approach sits here so you can chase it."
          : "A match happens when a tenant registers interest in one of your properties and you agree to proceed. Anything still waiting on either side is here too."}
      </p>

      <nav className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-brand-border bg-white text-brand-muted hover:border-brand-blue hover:text-brand-blue"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 ${active ? "text-white/70" : "text-brand-muted"}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </nav>

      {shown.length === 0 && tab !== "matched" ? (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
          {tab === "outgoing" ? (
            isTenant ? (
              "You haven't registered interest in anything yet."
            ) : (
              "You haven't approached any tenant requests yet."
            )
          ) : (
            "Nobody has approached your properties yet."
          )}
        </div>
      ) : (
        // A light grid of minimal cards - photo, headline, who and how it's
        // going - each one opening the full detail panel on click, rather
        // than trying to fit everything onto the card itself.
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((row) => (
            <button
              key={row.connection.id}
              type="button"
              onClick={() => setOpenRow(row)}
              className="flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative h-40 w-full flex-shrink-0">
                <img src={row.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3">
                  <StatusChip connection={row.connection} />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-base font-semibold leading-snug text-brand-ink">
                  {row.title}
                </h3>
                <p className="mt-0.5 text-sm text-brand-muted">{row.city} · {row.priceLabel}</p>
                <div className="mt-3 flex items-center gap-2 border-t border-brand-border pt-3">
                  <Avatar
                    name={row.profile.name}
                    initials={row.profile.initials}
                    photoUrl={row.profile.photoUrl}
                    size="xs"
                  />
                  <span className="min-w-0 flex-1 truncate text-xs text-brand-muted">
                    {row.counterpartyRole === "investor" ? "Investor" : "Tenant"}{" "}
                    <span className="font-semibold text-brand-ink">{row.counterpartyName}</span>
                    {row.yours && " (you)"}
                  </span>
                </div>
                <span className="mt-3 text-[11px] font-semibold text-brand-blue">
                  View full details →
                </span>
              </div>
            </button>
          ))}

          {tab === "matched" &&
            dealCards.map((deal) => {
              const running = deal.agreement.stage === "tenancy-active";
              const stageLabel = running
                ? "Tenant moved in"
                : deal.agreement.stage.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
              return (
                <button
                  key={deal.id}
                  type="button"
                  onClick={() => setOpenDeal(deal)}
                  className={`flex flex-col gap-3 rounded-2xl border bg-white p-5 text-left transition-colors hover:border-brand-blue ${
                    deal.isExample ? "border-dashed border-brand-gold" : "border-brand-border"
                  }`}
                >
                  <div className="flex items-center -space-x-2">
                    <Avatar
                      name={deal.investor.name}
                      initials={deal.investor.initials}
                      photoUrl={deal.investor.photoUrl}
                      size="sm"
                      ring="ring-2 ring-white"
                    />
                    <Avatar
                      name={deal.tenant.name}
                      initials={deal.tenant.initials}
                      photoUrl={deal.tenant.photoUrl}
                      size="sm"
                      ring="ring-2 ring-white"
                    />
                  </div>
                  <span
                    className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${
                      deal.isExample
                        ? "bg-brand-gold/20 text-brand-gold-dark"
                        : running
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-brand-blue-light text-brand-blue"
                    }`}
                  >
                    {deal.isExample ? "Worked example" : stageLabel}
                  </span>
                  <p className="font-display text-base font-semibold text-brand-ink">{deal.title}</p>
                  <p className="text-sm text-brand-muted">
                    {deal.location} · with {deal.tenant.name}
                  </p>
                </button>
              );
            })}
        </div>
      )}

      {openRow && (
        <MatchDetailPanel
          row={openRow}
          tab={tab}
          interestedCount={
            openRow.connection.kind === "listing" ? interestedTenantsFor(openRow.connection.id).length : 0
          }
          dealProperty={openRowDealProperty}
          viewerRole={viewerRole}
          onAdvanceDeal={(by) => openRowDealProperty && advanceAgreement(openRowDealProperty.id, by)}
          onClose={() => setOpenRow(null)}
          onAccept={() => accept(openRow)}
          onNudge={() => nudgeConnection(openRow.connection.id)}
          onMessage={() => openMessage(openRow)}
          onWithdraw={() => {
            withdrawConnection(openRow.connection.id);
            setOpenRow(null);
          }}
        />
      )}

      {openDeal && (
        <DealDetailPanel deal={openDeal} viewerRole={viewerRole} onClose={() => setOpenDeal(null)} />
      )}

      {composing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <h2 className="font-display text-lg font-semibold text-brand-ink">
              Message {composing.counterpartyName}
            </h2>
            <p className="mt-0.5 text-xs text-brand-muted">{composing.context}</p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              autoFocus
              placeholder="Keep it short. Buynidify passes messages between both sides."
              className="mt-3 w-full rounded-xl border border-brand-border p-3 text-sm text-brand-ink outline-none focus:border-brand-blue"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setComposing(null)}
                className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={send}
                disabled={!draft.trim()}
                className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
