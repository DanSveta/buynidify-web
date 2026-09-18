import type { InvestorListing, TenantDemandEntry } from "../context/ListingsContext";
import { properties as staticProperties } from "../data/mockData";

// One place that decides what a heart actually resolves to, used by both the
// Shortlist page and the sidebar badge. They used to compute this two
// different ways - the page walked the real marketplace data, the badge just
// read favoriteIds.size - so a stale id (something favourited, then removed)
// inflated the badge without ever showing up as a card, and the two numbers
// disagreed.
export function resolveSavedProperties(
  favoriteIds: Set<string>,
  investorListings: InvestorListing[],
  tenantDemand: TenantDemandEntry[]
) {
  const savedListings = investorListings.filter((l) => favoriteIds.has(l.id));
  const savedDemand = tenantDemand.filter((d) => favoriteIds.has(d.id));
  const covered = new Set([
    ...savedListings.map((l) => l.id),
    ...savedDemand.map((d) => d.id),
  ]);
  const savedProperties = staticProperties.filter(
    (p) => favoriteIds.has(p.id) && !covered.has(p.id)
  );
  return {
    savedListings,
    savedDemand,
    savedProperties,
    total: savedListings.length + savedDemand.length + savedProperties.length,
  };
}
