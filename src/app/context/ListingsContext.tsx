import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { properties, tenantDemand as seedDemandData, type Deal } from "../data/mockData";

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

const fakeTenantInitials = ["J.O.", "M.K.", "A.R.", "D.P.", "S.L.", "C.B.", "T.N.", "E.W."];

// Deterministic "other people already interested" seeding, so numbers don't
// jump around on every render but still look like a real, busy platform.
function seedHash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function seededInterestedTenants(id: string): { label: string; daysAgo: number }[] {
  const count = seedHash(id) % 4; // 0-3 other tenants already interested
  const list: { label: string; daysAgo: number }[] = [];
  for (let i = 0; i < count; i++) {
    const nameIdx = (seedHash(id + i) + i) % fakeTenantInitials.length;
    const daysAgo = 1 + (seedHash(id + "d" + i) % 9);
    list.push({ label: fakeTenantInitials[nameIdx], daysAgo });
  }
  return list;
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

export type MatchEntry = {
  id: string;
  propertyAddress: string;
  city: string;
  investorLabel: string;
  tenantLabel: string;
};

const seedInvestorListings: InvestorListing[] = properties
  .filter((p) => p.ownerListed)
  .map((p) => ({
    id: p.id,
    source: "seed",
    address: p.address,
    city: p.city,
    price: p.price,
    beds: p.beds,
    type: p.type,
  }));

const seedTenantDemand: TenantDemandEntry[] = seedDemandData.map((d) => ({
  id: d.id,
  source: "seed",
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
  interestedTenantsFor: (listingId: string) => { label: string; daysAgo: number }[];
  hasExpressedInterest: (listingId: string) => boolean;
  expressInterestInListing: (id: string) => void;
  hasInvestorResponded: (demandId: string) => boolean;
  respondToDemand: (id: string) => void;
  addInvestorListing: (input: { id: string; url: string; address: string; city: string; price: number; beds: number; type: string }) => void;
  addTenantDemand: (input: { id: string; url: string; city: string; propertyType: string; targetPrice: number; minBeds: number; notes?: string }) => void;
  matches: MatchEntry[];
  matchesAsDeals: Deal[];
};

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [importedListings, setImportedListings] = useState<InvestorListing[]>([]);
  const [importedDemand, setImportedDemand] = useState<TenantDemandEntry[]>([]);
  const [tenantInterestIds, setTenantInterestIds] = useState<Set<string>>(new Set());
  const [investorResponseIds, setInvestorResponseIds] = useState<Set<string>>(new Set());

  const investorListings = useMemo(
    () => [...importedListings, ...seedInvestorListings],
    [importedListings]
  );
  const tenantDemand = useMemo(
    () => [...importedDemand, ...seedTenantDemand],
    [importedDemand]
  );

  function interestedTenantsFor(listingId: string) {
    const seeded = seededInterestedTenants(listingId);
    return tenantInterestIds.has(listingId) ? [...seeded, { label: "You", daysAgo: 0 }] : seeded;
  }

  function hasExpressedInterest(listingId: string) {
    return tenantInterestIds.has(listingId);
  }

  function expressInterestInListing(id: string) {
    setTenantInterestIds((prev) => new Set(prev).add(id));
  }

  function hasInvestorResponded(demandId: string) {
    return investorResponseIds.has(demandId);
  }

  function respondToDemand(id: string) {
    setInvestorResponseIds((prev) => new Set(prev).add(id));
  }

  function addInvestorListing(input: { id: string; url: string; address: string; city: string; price: number; beds: number; type: string }) {
    setImportedListings((list) => [{ ...input, source: "imported" }, ...list]);
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
        matches,
        matchesAsDeals,
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
