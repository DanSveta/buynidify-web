import type {
  BuyerAnalysis,
  ImportedProperty,
  InvestorAnalysis,
} from "../context/ListingsContext";
import { marketFor, suggestedRent } from "../../data/ukMarketData";

// The AI analysis a pasted link gets. Lives here rather than inside the
// importer because My Properties runs it too, and both sides must produce
// identical figures for the same property.

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

// Simplified England SDLT bands (standard residential rate) - a demo
// estimate only, flagged as such in the disclaimer below.
export function estimateStampDuty(price: number): number {
  const bands: [number, number][] = [
    [250000, 0],
    [925000, 0.05],
    [1500000, 0.1],
    [Infinity, 0.12],
  ];
  let duty = 0;
  let lower = 0;
  for (const [upper, rate] of bands) {
    if (price > lower) {
      duty += (Math.min(price, upper) - lower) * rate;
      lower = upper;
    }
  }
  return Math.round(duty / 100) * 100;
}

function seedFrom(url: string) {
  return Math.abs(url.split("").reduce((h, c) => (h << 5) - h + c.charCodeAt(0), 0));
}

export function buildInvestorAnalysis(p: ImportedProperty): InvestorAnalysis {
  const seed = seedFrom(p.url);
  const market = marketFor(p.location);
  // The rent suggestion is the middle of this city's real researched range
  // for this bedroom count, not a number pulled out of the price alone -
  // that's what makes it something worth pre-filling a publish form with.
  const monthlyRent = suggestedRent(p.location, p.beds);
  const grossYield = Math.round(((monthlyRent * 12) / p.price) * 1000) / 10;
  const netYield = Math.round((grossYield - 1.5) * 10) / 10;
  const locationScore = Math.round((6.5 + ((seed >> 3) % 30) / 10) * 10) / 10;
  const demandOptions: InvestorAnalysis["rentalDemand"][] = ["Moderate", "High", "Very high"];
  const rentalDemand = demandOptions[seed % demandOptions.length];
  const timeToLetOptions = ["1-2 weeks", "2-4 weeks", "3-6 weeks"];
  const profileOptions = ["Young professionals", "Professional sharers", "Families", "Students and graduates"];
  const [rentLow, rentHigh] = market.rentByBeds[Math.min(4, Math.max(1, Math.round(p.beds))) as 1 | 2 | 3 | 4];

  return {
    kind: "investor",
    source: "demo",
    summary: `This ${p.beds}-bedroom ${p.type.toLowerCase()} in ${p.location} presents a solid buy-to-let opportunity with estimated gross yields around ${grossYield.toFixed(1)}%. ${market.summary}`,
    monthlyRent,
    grossYield,
    netYield,
    locationScore,
    rentalDemand,
    timeToLet: timeToLetOptions[(seed >> 2) % timeToLetOptions.length],
    tenantProfile: profileOptions[(seed >> 4) % profileOptions.length],
    positives: [
      `Strong rental demand in ${p.location}`,
      `${p.beds} bedroom${p.beds > 1 ? "s" : ""} attract stable long-term tenants`,
      "Good transport connections likely",
      "Competitive asking price for the area",
    ],
    consider: [
      "Full due diligence needed on service charges",
      "Stamp duty surcharge applies (3% for investment)",
      "Verify EPC rating before purchase",
      `Budget around ${gbp.format(estimateStampDuty(p.price) + Math.round(p.price * 0.03))} in stamp duty`,
    ],
    suggestions: [
      `Target net yield of ${netYield.toFixed(1)}-${(netYield + 1).toFixed(1)}% for ${p.location}`,
      `${p.location} ${p.beds}-bed rents typically run ${gbp.format(rentLow)}-${gbp.format(rentHigh)}/month`,
      `Popular areas nearby: ${market.popularAreas.slice(0, 3).join(", ")}`,
      "Consider instructing a local letting agent for tenant referencing",
    ],
  };
}

export function buildBuyerAnalysis(p: ImportedProperty): BuyerAnalysis {
  const seed = seedFrom(p.url);
  const market = marketFor(p.location);
  const valueOptions: BuyerAnalysis["valueForMoney"][] = ["Fair", "Good", "Excellent"];
  const estimatedMonthlyRent = suggestedRent(p.location, p.beds);
  const [rentLow, rentHigh] = market.rentByBeds[Math.min(4, Math.max(1, Math.round(p.beds))) as 1 | 2 | 3 | 4];

  return {
    kind: "buyer",
    source: "demo",
    summary: `This ${p.beds}-bedroom ${p.type.toLowerCase()} in ${p.location} could suit your budget and search criteria - if an investor buys it for you, rent here typically runs ${gbp.format(rentLow)}-${gbp.format(rentHigh)}/month.`,
    deposit: Math.round(p.price * 0.1),
    upfrontCosts: estimateStampDuty(p.price) + 2500,
    estimatedMonthlyRent,
    commuteScore: Math.round((6 + (seed % 35) / 10) * 10) / 10,
    amenitiesScore: Math.round((6 + ((seed >> 3) % 35) / 10) * 10) / 10,
    valueForMoney: valueOptions[seed % valueOptions.length],
    positives: [
      `${p.beds} bedroom${p.beds > 1 ? "s" : ""} offer good space for your household`,
      `${p.location} has strong transport links`,
      "Property type suits long-term ownership",
      "Area has good local amenities",
    ],
    consider: [
      "Confirm whether it's freehold or leasehold",
      "Check the EPC rating and any planned energy works",
      "Ask about service charge and ground rent (if leasehold)",
      "Verify the local council tax band",
    ],
    suggestions: [
      `Typical rent here: ${gbp.format(rentLow)}-${gbp.format(rentHigh)}/month for ${p.beds} bed${p.beds > 1 ? "s" : ""}`,
      "Book a full structural survey before offering",
      "Request the property's EPC certificate",
      `Popular areas nearby: ${market.popularAreas.slice(0, 3).join(", ")}`,
    ],
  };
}

