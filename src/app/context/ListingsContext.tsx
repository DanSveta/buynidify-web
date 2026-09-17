import { createContext, useContext, useMemo, type ReactNode } from "react";
import { properties, tenantDemand as seedDemandData, type Deal } from "../data/mockData";
import { usePersistedState } from "../utils/usePersistedState";
import type { Portal } from "../utils/mockFromUrl";

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

export type ImportedProperty = {
  id: string;
  /** Which side pasted it - an investor's link is stock, a tenant's is demand. */
  owner: "investor" | "tenant";
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
}));

type ListingsContextValue = {
  investorListings: InvestorListing[];
  tenantDemand: TenantDemandEntry[];
  interestedTenantsFor: (listingId: string) => InterestedTenant[];
  hasExpressedInterest: (listingId: string) => boolean;
  expressInterestInListing: (id: string) => void;
  hasInvestorResponded: (demandId: string) => boolean;
  respondToDemand: (id: string) => void;
  addInvestorListing: (input: { id: string; url: string; address: string; city: string; price: number; beds: number; type: string; monthlyRent?: number; minTenancy?: string; availableFrom?: string; portal?: string; notes?: string; accepts?: string[] }) => void;
  addTenantDemand: (input: { id: string; url: string; city: string; propertyType: string; targetPrice: number; minBeds: number; notes?: string }) => void;
  updateInvestorListing: (id: string, patch: Partial<InvestorListing>) => void;
  // Messaging between the two sides.
  threads: MessageThread[];
  threadFor: (counterpartyId: string) => MessageThread | undefined;
  sendMessage: (counterparty: { id: string; name: string; context?: string }, body: string) => void;
  matches: MatchEntry[];
  matchesAsDeals: Deal[];
  // Paste-a-link cards, shared across pages and persisted.
  importedProperties: ImportedProperty[];
  addImportedProperty: (property: ImportedProperty) => void;
  updateImportedProperty: (id: string, patch: Partial<ImportedProperty>) => void;
  removeImportedProperty: (id: string) => void;
};

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: ReactNode }) {
  // All persisted, so a property added as an investor is still there after
  // signing out and back in as a tenant. Ids are kept as arrays because Sets
  // don't survive JSON.
  const [importedListings, setImportedListings] = usePersistedState<InvestorListing[]>(
    "buynidify:investor-listings",
    []
  );
  const [importedDemand, setImportedDemand] = usePersistedState<TenantDemandEntry[]>(
    "buynidify:tenant-demand",
    []
  );
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
  const [threads, setThreads] = usePersistedState<MessageThread[]>("buynidify:threads", []);

  const tenantInterestIds = useMemo(() => new Set(tenantInterestList), [tenantInterestList]);
  const investorResponseIds = useMemo(() => new Set(investorResponseList), [investorResponseList]);

  const investorListings = useMemo(
    () => [...importedListings, ...seedInvestorListings],
    [importedListings]
  );
  const tenantDemand = useMemo(
    () => [...importedDemand, ...seedTenantDemand],
    [importedDemand]
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

  function removeImportedProperty(id: string) {
    setImportedProperties((list) => list.filter((p) => p.id !== id));
    // Also retract whatever that link put into the marketplace / demand feed.
    setImportedListings((list) => list.filter((l) => l.id !== id));
    setImportedDemand((list) => list.filter((d) => d.id !== id));
  }

  function addInvestorListing(input: { id: string; url: string; address: string; city: string; price: number; beds: number; type: string; monthlyRent?: number; minTenancy?: string; availableFrom?: string; portal?: string; notes?: string; accepts?: string[] }) {
    setImportedListings((list) => [{ ...input, source: "imported" }, ...list]);
  }

  function updateInvestorListing(id: string, patch: Partial<InvestorListing>) {
    setImportedListings((list) => list.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function threadFor(counterpartyId: string) {
    return threads.find((t) => t.counterpartyId === counterpartyId);
  }

  function sendMessage(counterparty: { id: string; name: string; context?: string }, body: string) {
    const text = body.trim();
    if (!text) return;
    setThreads((list) => {
      const existing = list.find((t) => t.counterpartyId === counterparty.id);
      const message = { id: `m-${Date.now()}`, from: "me" as const, body: text, sentAt: new Date().toISOString() };
      if (existing) {
        return list.map((t) =>
          t.counterpartyId === counterparty.id ? { ...t, messages: [...t.messages, message] } : t
        );
      }
      return [
        {
          counterpartyId: counterparty.id,
          counterpartyName: counterparty.name,
          context: counterparty.context ?? "",
          messages: [message],
        },
        ...list,
      ];
    });
  }

  function addTenantDemand(input: { id: string; url: string; city: string; propertyType: string; targetPrice: number; minBeds: number; notes?: string }) {
    setImportedDemand((list) => [
      {
        id: input.id,
        source: "imported",
        url: input.url,
        city: input.city,
        propertyType: input.propertyType,
        notes: input.notes ?? "Added from a pasted link — looking to buy.",
        minBeds: input.minBeds,
        addedDaysAgo: 0,
        seedInterestedTenants: 0,
        targetPrice: input.targetPrice,
      },
      ...list,
    ]);
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
        addInvestorListing,
        addTenantDemand,
        updateInvestorListing,
        threads,
        threadFor,
        sendMessage,
        matches,
        matchesAsDeals,
        importedProperties,
        addImportedProperty,
        updateImportedProperty,
        removeImportedProperty,
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
