import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { properties, tenantDemand as seedDemandData, type Deal } from "../data/mockData";
import { usePersistedState } from "../utils/usePersistedState";
import type { Portal } from "../utils/mockFromUrl";
import type { PartyProfile } from "../utils/profiles";
import { seedThreads } from "../data/seedThreads";
import { useRole } from "./RoleContext";

// Wires the two halves of the platform together across roles, which
// previously existed as disconnected, page-local mock state:
//   - Investor lists a property (seeded, or pasted as a link) -> tenants can
//     browse it and express interest -> investor sees who's interested.
//   - Tenant wants a property (seeded demand, or pasted as a link on Search /
//     My Properties) -> investors can see it and respond -> tenant sees an
//     investor is on it.
//   - When both sides have shown interest in the same one, that's a match.
// Everything here is still mock/local-only (no backend), but it now reacts
// to real actions instead of being static per-page state that resets on
// navigation.

// Interested tenants are people, not initials - the investor needs enough to
// decide whether to talk to them.
export type TenantProfile = {
  id: string;
  name: string;
  initials: string;
  occupation: string;
  household: string;
  movingFrom: string;
  referencing: "Verified" | "In progress";
};

const fakeTenants: Omit<TenantProfile, "id">[] = [
  { name: "James Okafor", initials: "JO", occupation: "Software engineer", household: "Couple, no pets", movingFrom: "Hackney, London", referencing: "Verified" },
  { name: "Maya Kaur", initials: "MK", occupation: "NHS doctor", household: "Single professional", movingFrom: "Leeds", referencing: "Verified" },
  { name: "Adam Reid", initials: "AR", occupation: "Architect", household: "Family of 3", movingFrom: "Bristol", referencing: "In progress" },
  { name: "Daniel Pereira", initials: "DP", occupation: "Finance analyst", household: "Two sharers", movingFrom: "Manchester", referencing: "Verified" },
  { name: "Sofia Lindqvist", initials: "SL", occupation: "UX designer", household: "Single professional", movingFrom: "Edinburgh", referencing: "Verified" },
  { name: "Chloe Bennett", initials: "CB", occupation: "Teacher", household: "Couple with baby", movingFrom: "Birmingham", referencing: "In progress" },
  { name: "Tom Nguyen", initials: "TN", occupation: "Consultant", household: "Single professional", movingFrom: "Relocating from Berlin", referencing: "Verified" },
  { name: "Elena Wright", initials: "EW", occupation: "Marketing lead", household: "Couple, one cat", movingFrom: "Reading", referencing: "Verified" },
];

// Deterministic "other people already interested" seeding, so numbers don't
// jump around on every render but still look like a real, busy platform.
function seedHash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export type InterestedTenant = TenantProfile & { daysAgo: number };

function seededInterestedTenants(id: string): InterestedTenant[] {
  const count = seedHash(id) % 4; // 0-3 other tenants already interested
  const list: InterestedTenant[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (seedHash(id + i) + i) % fakeTenants.length;
    const daysAgo = 1 + (seedHash(id + "d" + i) % 9);
    list.push({ ...fakeTenants[idx], id: `${id}-t${idx}`, daysAgo });
  }
  return list;
}

const youAsTenant: TenantProfile = {
  id: "you",
  name: "You",
  initials: "YOU",
  occupation: "Your profile",
  household: "-",
  movingFrom: "-",
  referencing: "Verified",
};

// Buynidify's cut: the investor is paid their asking rent, the tenant pays
// that plus a markup, and the platform keeps the difference. Shown openly on
// every marketplace card the way the live product does it.
export const TENANT_MARKUP = 0.04;

export function tenantPays(investorRent: number): number {
  return Math.round(investorRent * (1 + TENANT_MARKUP));
}

export type InvestorListing = {
  id: string;
  source: "seed" | "imported";
  url?: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  type: string;
  /** Terms set when the investor publishes to tenants. */
  monthlyRent?: number;
  minTenancy?: string;
  availableFrom?: string;
  portal?: string;
  notes?: string;
  accepts?: string[];
  /** The listing's own share image, referenced from the portal. */
  imageUrl?: string;
};

export type TenantDemandEntry = {
  id: string;
  source: "seed" | "imported";
  url?: string;
  city: string;
  propertyType: string;
  notes: string;
  minBeds: number;
  addedDaysAgo: number;
  seedInterestedTenants: number; // pre-existing count, only meaningful for seed entries
  targetRentPerMonth?: number; // seed entries (legacy rent-demand content)
  targetPrice?: number; // imported entries (sale, matches the rest of the app)
};

export type Message = {
  id: string;
  from: "me" | "them";
  body: string;
  sentAt: string;
};

export type MessageThread = {
  counterpartyId: string;
  counterpartyName: string;
  context: string;
  messages: Message[];
  /** Which side of the platform this conversation belongs to. Absent on
   *  threads you started yourself - those always show. */
  audience?: "investor" | "tenant";
  /** Snapshot of who you're talking to, captured when the conversation
   *  starts, so the Messages page can show their profile without having to
   *  guess who they were. Optional: threads from before this existed fall
   *  back to a minimal profile. */
  profile?: PartyProfile;
};

export type MatchEntry = {
  id: string;
  propertyAddress: string;
  city: string;
  investorLabel: string;
  tenantLabel: string;
};

// The paste-a-link cards. These live here rather than inside the importer
// component so the same set shows on Search and My Properties, and so they
// persist across a reload or a role switch.
export type InvestorAnalysis = {
  kind: "investor";
  summary: string;
  monthlyRent: number;
  grossYield: number;
  netYield: number;
  locationScore: number;
  rentalDemand: string;
  timeToLet: string;
  tenantProfile: string;
  positives: string[];
  consider: string[];
  suggestions: string[];
};

export type BuyerAnalysis = {
  kind: "buyer";
  summary: string;
  deposit: number;
  upfrontCosts: number;
  commuteScore: number;
  amenitiesScore: number;
  valueForMoney: string;
  positives: string[];
  consider: string[];
  suggestions: string[];
};

export type Analysis = InvestorAnalysis | BuyerAnalysis;

export type PublishDetails = {
  rent: number;
  availableFrom: string;
  minTenancy: string;
  notes: string;
  /** Who the investor is happy to let to - chosen at publish time. */
  accepts: string[];
};

/** The shared journey from PRODUCT.md section 14. The investor does NOT own
 *  the property yet: the tenant's commitment deposit is what gives them the
 *  confidence to buy it. That is why there are no viewings anywhere in this
 *  flow, and why the middle of it is run by the Buynidify team rather than by
 *  the two parties talking directly.
 *
 *  `actor` is who the step is waiting on, so the UI can say whether you're
 *  being asked to do something or simply being kept informed. */
export const agreementSteps = [
  {
    id: "request-sent",
    label: "Request sent",
    detail: "Buynidify is contacting the tenant to confirm they want to proceed.",
    actor: "Buynidify",
  },
  {
    id: "matched",
    label: "Matched",
    detail: "The tenant confirmed. You are both committed to exploring this property.",
    actor: "Buynidify",
  },
  {
    id: "terms-agreed",
    label: "Terms agreed",
    detail: "Rent, availability and tenancy length agreed between both sides.",
    actor: "Buynidify",
  },
  {
    id: "agreement-signed",
    label: "Agreement signed",
    detail: "Pre-purchase agreement signed. It sets out what happens if either side pulls out.",
    actor: "You and the tenant",
  },
  {
    id: "deposit-secured",
    label: "Deposit secured",
    detail: "The tenant's commitment deposit is received and protected. You can buy with confidence.",
    actor: "Tenant",
  },
  {
    id: "purchase",
    label: "Purchase in progress",
    detail: "You buy the property. Buynidify coordinates with your solicitor and the seller's agent.",
    actor: "You",
  },
  {
    id: "tenancy-prep",
    label: "Tenancy preparation",
    detail: "Right to Rent, referencing, tenancy documents and move-in arrangements.",
    actor: "Buynidify",
  },
  {
    id: "tenancy-active",
    label: "Lease signed, tenant moved in",
    detail: "The tenancy has started and rent is being collected.",
    actor: "Done",
  },
] as const;

export type AgreementStage = (typeof agreementSteps)[number]["id"];

export type Agreement = {
  tenantId: string;
  tenantName: string;
  tenantInitials: string;
  stage: AgreementStage;
  startedAt: string;
};

export type ImportedProperty = {
  id: string;
  /** Which side pasted it - an investor's link is stock, a tenant's is demand.
   *  "guest" means it was added by someone who hasn't registered yet: they can
   *  analyse it, but it doesn't reach the marketplace until they have an
   *  account and choose a side. */
  owner: "investor" | "tenant" | "guest";
  url: string;
  portal: Portal;
  title: string;
  location: string;
  price: number;
  beds: number;
  type: string;
  analysis: Analysis | null;
  showAnalysis: boolean;
  published: PublishDetails | null;
  /** True when the details were read off the real listing rather than
   *  generated from the URL. */
  sourced?: boolean;
  /** Why we fell back, when we did. */
  sourceNote?: string;
  baths?: number;
  postcode?: string;
  /** The agent marketing it, from the listing. */
  agent?: string;
  /** The listing's own share image, referenced by URL, never copied. */
  imageUrl?: string;
  /** Set when a tenant has been chosen. */
  agreement?: Agreement | null;
};

const listingPortals = [
  { name: "Rightmove", url: "https://www.rightmove.co.uk/properties/" },
  { name: "Zoopla", url: "https://www.zoopla.co.uk/for-sale/details/" },
  { name: "OnTheMarket", url: "https://www.onthemarket.com/details/" },
];

const seedInvestorListings: InvestorListing[] = properties
  .filter((p) => p.ownerListed)
  .map((p, i) => ({
    id: p.id,
    source: "seed",
    // Every card names its source - seeded listings had neither portal nor
    // url, so only imported ones were showing it.
    portal: listingPortals[i % listingPortals.length].name,
    url: `${listingPortals[i % listingPortals.length].url}${81000000 + i * 211}/`,
    address: p.address,
    city: p.city,
    price: p.price,
    beds: p.beds,
    type: p.type,
    // Seeded listings get a plausible rent (~5% gross) so they carry the
    // same rent/markup detail as anything published in-session.
    monthlyRent: Math.round((p.price * 0.05) / 12 / 5) * 5,
    minTenancy: "12 months",
  }));

const seedPortals = [
  { name: "Rightmove", url: "https://www.rightmove.co.uk/properties/" },
  { name: "Zoopla", url: "https://www.zoopla.co.uk/for-sale/details/" },
  { name: "OnTheMarket", url: "https://www.onthemarket.com/details/" },
];

const seedTenantDemand: TenantDemandEntry[] = seedDemandData.map((d, i) => ({
  id: d.id,
  source: "seed",
  // Seeded demand came from a portal too - without this the card had no
  // source name and no View listing link.
  url: `${seedPortals[i % seedPortals.length].url}${70000000 + i * 137}/`,
  city: d.city,
  propertyType: d.propertyType,
  notes: d.notes,
  minBeds: d.minBeds,
  addedDaysAgo: d.addedDaysAgo,
  seedInterestedTenants: d.interestedTenants,
  targetRentPerMonth: d.targetRentPerMonth,
  // The property is still for sale, so an investor needs its asking price to
  // judge the request. Derived from the rent at a plausible yield (4.8-6.4%)
  // so the two numbers always agree with each other.
  targetPrice: d.targetRentPerMonth
    ? Math.round((d.targetRentPerMonth * 12) / (0.048 + (seedHash(d.id) % 17) / 1000) / 5000) * 5000
    : undefined,
}));

type ListingsContextValue = {
  investorListings: InvestorListing[];
  tenantDemand: TenantDemandEntry[];
  interestedTenantsFor: (listingId: string) => InterestedTenant[];
  hasExpressedInterest: (listingId: string) => boolean;
  expressInterestInListing: (id: string) => void;
  hasInvestorResponded: (demandId: string) => boolean;
  respondToDemand: (id: string) => void;
  // Messaging between the two sides.
  threads: MessageThread[];
  threadFor: (counterpartyId: string) => MessageThread | undefined;
  /** A thread is unread while the latest message came from the other side and
   *  you haven't opened it. Keyed on that message, so a new reply to a
   *  conversation you'd already read makes it unread again. */
  isThreadUnread: (thread: MessageThread) => boolean;
  markThreadRead: (thread: MessageThread) => void;
  unreadThreadCount: number;
  sendMessage: (
    counterparty: { id: string; name: string; context?: string; profile?: PartyProfile },
    body: string
  ) => void;
  matches: MatchEntry[];
  matchesAsDeals: Deal[];
  // Paste-a-link cards, shared across pages and persisted.
  importedProperties: ImportedProperty[];
  addImportedProperty: (property: ImportedProperty) => void;
  updateImportedProperty: (id: string, patch: Partial<ImportedProperty>) => void;
  removeImportedProperty: (id: string) => void;
  claimGuestProperties: (owner: "investor" | "tenant") => void;
};

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const { role } = useRole();
  // All persisted, so a property added as an investor is still there after
  // signing out and back in as a tenant. Ids are kept as arrays because Sets
  // don't survive JSON.
  const [tenantInterestList, setTenantInterestList] = usePersistedState<string[]>(
    "buynidify:tenant-interest",
    []
  );
  const [investorResponseList, setInvestorResponseList] = usePersistedState<string[]>(
    "buynidify:investor-responses",
    []
  );
  const [importedProperties, setImportedProperties] = usePersistedState<ImportedProperty[]>(
    "buynidify:imported-properties",
    []
  );
  const [storedThreads, setThreads] = usePersistedState<MessageThread[]>("buynidify:threads", []);
  // Deliberately NOT persisted. Read state lives for one page load only, so
  // every refresh puts the unread messages back for the next demo run.
  // Property data is the thing that needs to survive a reload, not this.
  const [readThreadKeys, setReadThreadKeys] = useState<string[]>([]);

  useEffect(() => {
    // Clear the key an earlier version wrote, so a browser that already saved
    // read state doesn't stay permanently caught up.
    try {
      window.localStorage.removeItem("buynidify:read-threads");
    } catch {
      // Storage blocked; nothing to clean up.
    }
  }, []);

  // Seeded conversations are merged in rather than written to storage, so they
  // appear for someone who already has saved threads, and a seed that's been
  // replied to (now in storage) isn't shown twice. Threads are then filtered
  // to the side of the platform you're signed in as.
  const threads = useMemo(() => {
    const missing = seedThreads.filter(
      (s) => !storedThreads.some((t) => t.counterpartyId === s.counterpartyId)
    );
    return [...storedThreads, ...missing].filter(
      (t) => !t.audience || !role || t.audience === role
    );
  }, [storedThreads, role]);

  // Anything persisted by an earlier build can be missing fields added since.
  // Normalising on read means a schema change never crashes the app for
  // someone who already has data in localStorage - they just see the default.
  const safeImportedProperties = useMemo(
    () =>
      importedProperties.map((p) =>
        p.published && !p.published.accepts
          ? { ...p, published: { ...p.published, accepts: [] } }
          : p
      ),
    [importedProperties]
  );

  const tenantInterestIds = useMemo(() => new Set(tenantInterestList), [tenantInterestList]);
  const investorResponseIds = useMemo(() => new Set(investorResponseList), [investorResponseList]);

  // Derived, not stored. A property used to be written twice - once as an
  // imported link and once as a marketplace listing - and the two copies could
  // drift, which is how a published property could sit in My Properties while
  // never appearing on Platform listings. Now there is one record and the
  // marketplace is a view of it.
  const investorListings = useMemo<InvestorListing[]>(
    () => [
      ...safeImportedProperties
        .filter((p) => p.owner === "investor")
        .map((p) => ({
          id: p.id,
          source: "imported" as const,
          url: p.url,
          address: p.title,
          city: p.location,
          price: p.price,
          beds: p.beds,
          type: p.type,
          portal: p.portal,
          imageUrl: p.imageUrl,
          monthlyRent: p.published?.rent,
          minTenancy: p.published?.minTenancy,
          availableFrom: p.published?.availableFrom,
          notes: p.published?.notes,
          accepts: p.published?.accepts,
        })),
      ...seedInvestorListings,
    ],
    [safeImportedProperties]
  );

  const tenantDemand = useMemo<TenantDemandEntry[]>(
    () => [
      ...safeImportedProperties
        .filter((p) => p.owner === "tenant")
        .map((p) => ({
          id: p.id,
          source: "imported" as const,
          url: p.url,
          city: p.location,
          propertyType: p.type,
          notes: p.published?.notes || `Found via a pasted ${p.portal} link.`,
          minBeds: p.beds,
          addedDaysAgo: 0,
          seedInterestedTenants: 0,
          targetPrice: p.price,
        })),
      ...seedTenantDemand,
    ],
    [safeImportedProperties]
  );

  function interestedTenantsFor(listingId: string): InterestedTenant[] {
    const seeded = seededInterestedTenants(listingId);
    return tenantInterestIds.has(listingId)
      ? [...seeded, { ...youAsTenant, daysAgo: 0 }]
      : seeded;
  }

  function hasExpressedInterest(listingId: string) {
    return tenantInterestIds.has(listingId);
  }

  function expressInterestInListing(id: string) {
    setTenantInterestList((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function hasInvestorResponded(demandId: string) {
    return investorResponseIds.has(demandId);
  }

  function respondToDemand(id: string) {
    setInvestorResponseList((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function addImportedProperty(property: ImportedProperty) {
    setImportedProperties((list) => [property, ...list]);
  }

  function updateImportedProperty(id: string, patch: Partial<ImportedProperty>) {
    setImportedProperties((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  /** Registering claims everything you added while browsing as a guest. */
  function claimGuestProperties(owner: "investor" | "tenant") {
    setImportedProperties((list) =>
      list.map((p) => (p.owner === "guest" ? { ...p, owner } : p))
    );
  }

  function removeImportedProperty(id: string) {
    // One record, so retracting a link retracts it everywhere.
    setImportedProperties((list) => list.filter((p) => p.id !== id));
  }

  function threadFor(counterpartyId: string) {
    return threads.find((t) => t.counterpartyId === counterpartyId);
  }

  function threadKey(thread: MessageThread) {
    const last = thread.messages[thread.messages.length - 1];
    return `${thread.counterpartyId}:${last?.id ?? ""}`;
  }

  function isThreadUnread(thread: MessageThread) {
    const last = thread.messages[thread.messages.length - 1];
    return !!last && last.from === "them" && !readThreadKeys.includes(threadKey(thread));
  }

  function markThreadRead(thread: MessageThread) {
    const key = threadKey(thread);
    setReadThreadKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }

  const unreadThreadCount = threads.filter(isThreadUnread).length;

  function sendMessage(
    counterparty: { id: string; name: string; context?: string; profile?: PartyProfile },
    body: string
  ) {
    const text = body.trim();
    if (!text) return;
    setThreads((list) => {
      const existing = list.find((t) => t.counterpartyId === counterparty.id);
      const message = { id: `m-${Date.now()}`, from: "me" as const, body: text, sentAt: new Date().toISOString() };
      if (existing) {
        return list.map((t) =>
          t.counterpartyId === counterparty.id
            ? { ...t, messages: [...t.messages, message], profile: t.profile ?? counterparty.profile }
            : t
        );
      }
      // Replying to a seeded conversation: move it into storage with its
      // history intact rather than starting an empty thread alongside it.
      const seed = seedThreads.find((s) => s.counterpartyId === counterparty.id);
      if (seed) {
        return [{ ...seed, messages: [...seed.messages, message] }, ...list];
      }
      return [
        {
          counterpartyId: counterparty.id,
          counterpartyName: counterparty.name,
          context: counterparty.context ?? "",
          messages: [message],
          profile: counterparty.profile,
        },
        ...list,
      ];
    });
  }

  const matches = useMemo<MatchEntry[]>(() => {
    const fromListings = investorListings
      .filter((l) => tenantInterestIds.has(l.id))
      .map((l) => ({
        id: `match-listing-${l.id}`,
        propertyAddress: l.address,
        city: l.city,
        investorLabel: "Investor",
        tenantLabel: "You",
      }));
    const fromDemand = tenantDemand
      .filter((d) => investorResponseIds.has(d.id))
      .map((d) => ({
        id: `match-demand-${d.id}`,
        propertyAddress: `${d.propertyType} in ${d.city}`,
        city: d.city,
        investorLabel: "You",
        tenantLabel: d.source === "seed" ? seedDemandData.find((sd) => sd.id === d.id)?.tenantInitials ?? "Tenant" : "You",
      }));
    return [...fromListings, ...fromDemand];
  }, [investorListings, tenantDemand, tenantInterestIds, investorResponseIds]);

  // Fresh matches from this session, shaped to slot straight into the
  // existing (previously static) Deal Tracker / Matches UI alongside the
  // seeded deals - so express interest -> match -> deal tracker is one
  // real, visible loop instead of three disconnected mock pages.
  const matchesAsDeals = useMemo<Deal[]>(
    () =>
      matches.map((m) => ({
        id: m.id,
        propertyAddress: m.propertyAddress,
        city: m.city,
        investorInitials: m.investorLabel,
        tenantInitials: m.tenantLabel,
        stage: "matched",
        updatedDaysAgo: 0,
      })),
    [matches]
  );

  return (
    <ListingsContext.Provider
      value={{
        investorListings,
        tenantDemand,
        interestedTenantsFor,
        hasExpressedInterest,
        expressInterestInListing,
        hasInvestorResponded,
        respondToDemand,
        threads,
        threadFor,
        isThreadUnread,
        markThreadRead,
        unreadThreadCount,
        sendMessage,
        matches,
        matchesAsDeals,
        importedProperties: safeImportedProperties,
        addImportedProperty,
        updateImportedProperty,
        removeImportedProperty,
        claimGuestProperties,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within a ListingsProvider");
  return ctx;
}
