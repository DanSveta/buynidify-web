import { useMemo, useState } from "react";
import { useRole } from "../context/RoleContext";
import { properties, type PropertyType } from "../data/mockData";
import PropertyCard from "../components/PropertyCard";
import MapPlaceholder from "../components/MapPlaceholder";
import PropertyLinkImporter from "../components/PropertyLinkImporter";
import {
  portalPropertyTypeOptions,
  type PortalPropertyType,
} from "../../lib/propertyTypes";

// Furnished is the only extra filter - checked live against Rightmove,
// Zoopla and OnTheMarket's own For Sale filter panels (Sept 2026): none of
// the three expose a furnished/unfurnished/part-furnished filter for
// buying, only for renting, so this can't be wired into the portal
// deep-links. It stays as a filter on Buynidify's own listings only.
type Filters = {
  furnished: boolean;
};

const defaultFilters: Filters = {
  furnished: false,
};

const bedroomOptions = ["Any", "1", "2", "3", "4+"];

// The 18 UK cities Buynidify's own "Search Real UK Listings" widget offers
// (verified live, Sept 2026), plus a free-text fallback via the "Enter
// custom location" toggle - mirrors the live product's UX exactly.
const ukCities = [
  "London", "Manchester", "Birmingham", "Leeds", "Bristol", "Reading",
  "Liverpool", "Sheffield", "Edinburgh", "Glasgow", "Cardiff", "Brighton",
  "Oxford", "Cambridge", "Nottingham", "Leicester", "Newcastle", "York",
];

// The property-type list (imported above from ../../lib/propertyTypes,
// shared with the landing page) drives both the portal deep-links and (via
// portalTypeToMockType below) our own listing filter, matching the exact
// 7-option pill set Rightmove, Zoopla and OnTheMarket each show on their
// own site (checked live on all three, Sept 2026). No generic "House" or
// "Studio" catch-all - none of the three real portals expose those as a
// single button, so we don't invent one either.

// Maps the granular portal type down to our own (narrower) mock listing
// taxonomy, so the one dropdown can still filter Buynidify's own listings
// sensibly. Land/park homes have no equivalent in our mock inventory, so
// they just don't narrow the internal results (portal links still work).
const portalTypeToMockTypes: Record<PortalPropertyType, PropertyType[] | null> = {
  Any: null,
  detached: ["House"],
  "semi-detached": ["House"],
  terraced: ["House"],
  bungalow: ["House"],
  flat: ["Apartment", "Studio"],
  land: null,
  "park-home": null,
};

type PortalSearchParams = {
  transactionType: "rent" | "sale";
  location: string;
  priceMin: string;
  priceMax: string;
  bedrooms: string; // "Any" | "1" | "2" | "3" | "4+"
  propertyType: PortalPropertyType;
};

// Rightmove needs its own internal numeric region ID to load a real results
// page - free text alone won't resolve. These were captured live by
// clicking "Search on Rightmove" from buynidify.eu for each of the 18
// cities and reading the resulting rightmove.co.uk URL, then cross-checked
// against Rightmove's own public location lookup
// (los.rightmove.co.uk/typeahead). Two of buynidify's own live IDs turned
// out to be wrong - Reading resolved to Oxford, and Liverpool resolved to
// Loanhead (near Edinburgh) - so these below are the corrected, verified
// values, not a copy of their table.
const rightmoveLocationIds: Record<string, number> = {
  London: 93917,
  Manchester: 904,
  Birmingham: 162,
  Leeds: 787,
  Bristol: 219,
  Reading: 1114,
  Liverpool: 813,
  Sheffield: 1195,
  Edinburgh: 475,
  Glasgow: 550,
  Cardiff: 281,
  Brighton: 93554,
  Oxford: 1036,
  Cambridge: 274,
  Nottingham: 1019,
  Leicester: 789,
  Newcastle: 984,
  York: 1498,
};

// All 7 slugs below were confirmed live by operating each portal's own
// filter panel directly (not buynidify's links) and reading the resulting
// URL - not guessed or pattern-matched. Rightmove: one param, comma-joined.
const rightmovePropertyType: Record<PortalPropertyType, string | null> = {
  Any: null,
  detached: "detached",
  "semi-detached": "semi-detached",
  terraced: "terraced",
  bungalow: "bungalow",
  flat: "flat",
  land: "land",
  "park-home": "park-home",
};

// Zoopla splits these across TWO different query params, confirmed by
// operating their own filter panel: the 5 residential types use
// property_type; Land/Farm and Park home use a separate property_sub_type
// param instead (repeated key for multiple values). zooplaPropertySubType
// is used only for the two that need it.
const zooplaPropertyType: Record<PortalPropertyType, string | null> = {
  Any: null,
  detached: "detached-house",
  "semi-detached": "semi-detached-house",
  terraced: "terraced-house",
  bungalow: "bungalow",
  flat: "flats",
  land: null,
  "park-home": null,
};

const zooplaPropertySubType: Record<PortalPropertyType, string | null> = {
  Any: null,
  detached: null,
  "semi-detached": null,
  terraced: null,
  bungalow: null,
  flat: null,
  land: "farms_land",
  "park-home": "park_home",
};

// OnTheMarket: every type goes through the SAME param, "prop-types"
// (repeated key), confirmed live for all 7. Their own generated links use
// a different, legacy "property-type" param (singular key,
// "terraced-houses" style values) that we discovered is silently IGNORED -
// a real bug on their live search results, not something to copy.
const onTheMarketPropertyType: Record<PortalPropertyType, string | null> = {
  Any: null,
  detached: "detached",
  "semi-detached": "semi-detached",
  terraced: "terraced",
  bungalow: "bungalows",
  flat: "flats-apartments",
  land: "farms-land",
  "park-home": "mobile-park-homes",
};

function minBedsFromOption(bedrooms: string): number | null {
  if (bedrooms === "Any") return null;
  if (bedrooms === "4+") return 4;
  return Number(bedrooms);
}

function locationSlug(location: string) {
  return location
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

// Query param formats below were captured live by clicking each "Search on
// X" button from buynidify.eu's own search page (both To Rent and For Sale)
// and reading the resulting portal URL - not guessed from documentation.
function portalUrl(portal: "rightmove" | "zoopla" | "onthemarket", p: PortalSearchParams) {
  const minBeds = minBedsFromOption(p.bedrooms);

  if (portal === "rightmove") {
    const path = p.transactionType === "rent" ? "property-to-rent" : "property-for-sale";
    const params = new URLSearchParams();
    const locationId = rightmoveLocationIds[p.location];
    if (locationId) params.set("locationIdentifier", `REGION^${locationId}`);
    params.set("searchType", p.transactionType === "rent" ? "RENT" : "SALE");
    params.set("index", "0");
    if (minBeds !== null) params.set("minBedrooms", String(minBeds));
    // Rightmove uses minRent/maxRent for lettings, minPrice/maxPrice for sales.
    const priceMinKey = p.transactionType === "rent" ? "minRent" : "minPrice";
    const priceMaxKey = p.transactionType === "rent" ? "maxRent" : "maxPrice";
    if (p.priceMin) params.set(priceMinKey, p.priceMin);
    if (p.priceMax) params.set(priceMaxKey, p.priceMax);
    const type = rightmovePropertyType[p.propertyType];
    if (type) params.set("propertyTypes", type);
    return `https://www.rightmove.co.uk/${path}/find.html?${params.toString()}`;
  }

  if (portal === "zoopla") {
    const path = p.transactionType === "rent" ? "to-rent" : "for-sale";
    const params = new URLSearchParams();
    params.set("q", p.location);
    params.set("results_sort", "newest_listings");
    params.set("search_source", "refine");
    if (minBeds !== null) params.set("beds_min", String(minBeds));
    if (p.priceMin) params.set("price_min", p.priceMin);
    if (p.priceMax) params.set("price_max", p.priceMax);
    const type = zooplaPropertyType[p.propertyType];
    if (type) params.set("property_type", type);
    const subType = zooplaPropertySubType[p.propertyType];
    if (subType) params.set("property_sub_type", subType);
    return `https://www.zoopla.co.uk/${path}/property/${locationSlug(p.location)}/?${params.toString()}`;
  }

  const path = p.transactionType === "rent" ? "to-rent" : "for-sale";
  const params = new URLSearchParams();
  if (minBeds !== null) params.set("min-bedrooms", String(minBeds));
  if (p.priceMin) params.set("min-price", p.priceMin);
  if (p.priceMax) params.set("max-price", p.priceMax);
  const type = onTheMarketPropertyType[p.propertyType];
  if (type) params.set("prop-types", type);
  const query = params.toString();
  return `https://www.onthemarket.com/${path}/property/${locationSlug(p.location)}/${query ? `?${query}` : ""}`;
}

function openAllPortals(p: PortalSearchParams) {
  (["rightmove", "zoopla", "onthemarket"] as const).forEach((portal) => {
    window.open(portalUrl(portal, p), "_blank", "noopener,noreferrer");
  });
}

// Small logo-mark badges only (initial on a brand-tinted circle) - kept
// tiny and consistent with our own card styling instead of painting the
// whole row in each brand's color.
const portalMeta = {
  rightmove: { label: "Rightmove", initial: "R", badge: "bg-emerald-600" },
  zoopla: { label: "Zoopla", initial: "Z", badge: "bg-purple-600" },
  onthemarket: { label: "OnTheMarket", initial: "O", badge: "bg-orange-600" },
} as const;

export default function Search() {
  const { role } = useRole();
  const isInvestor = role === "investor";

  // Buynidify only deals in properties to buy - there is no rental search.
  const transactionType = "sale" as const;
  const [location, setLocation] = useState("London");
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [bedrooms, setBedrooms] = useState("Any");
  const [portalPropertyType, setPortalPropertyType] = useState<PortalPropertyType>("Any");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [view, setView] = useState<"list" | "map">("list");

  const effectiveLocation = useCustomLocation ? customLocation : location;
  const mockTypes = portalTypeToMockTypes[portalPropertyType];

  const minBeds = bedrooms === "Any" ? 0 : parseInt(bedrooms, 10);
  const maxPriceNum = priceMax ? Number(priceMax) : Infinity;
  const minPriceNum = priceMin ? Number(priceMin) : 0;

  const results = useMemo(() => {
    return properties.filter((p) => {
      if (p.beds < minBeds) return false;
      if (p.price > maxPriceNum || p.price < minPriceNum) return false;
      if (mockTypes && !mockTypes.includes(p.type)) return false;
      if (filters.furnished && !p.furnished) return false;
      return true;
    });
  }, [minBeds, maxPriceNum, minPriceNum, mockTypes, filters]);

  function toggle(key: keyof Filters) {
    setFilters((f) => ({ ...f, [key]: !f[key] }));
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        {isInvestor ? "Search Properties" : "Find a Home to Buy"}
      </h1>
      <p className="mt-1 text-brand-muted">
        {isInvestor
          ? "Properties for sale, ready for you to buy and bring onto the platform."
          : "Homes for sale, matched to what you're looking to buy."}
      </p>

      {/* Search Real UK Listings - deep-links out to the real portals */}
      <div className="mt-6 rounded-2xl border border-brand-border bg-brand-surface p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
            🔍
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-brand-ink">
              Search Real UK Listings
            </p>
            <p className="text-xs text-brand-muted">
              Opens live results on Rightmove, Zoopla &amp; OnTheMarket
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Location
            {useCustomLocation ? (
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="City, area, or postcode"
                className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
              />
            ) : (
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
              >
                {ukCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setUseCustomLocation((v) => !v)}
              className="mt-1 text-[11px] font-medium normal-case text-brand-blue hover:underline"
            >
              {useCustomLocation
                ? "Choose from city list"
                : "Enter custom location or postcode"}
            </button>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Min price (£)
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="100,000"
                className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Max price (£)
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="500,000"
                className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
              />
            </label>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Bedrooms
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {bedroomOptions.map((b) => (
              <button
                key={b}
                onClick={() => setBedrooms(b)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  bedrooms === b
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-brand-border bg-white text-brand-ink hover:border-brand-blue"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Property Type
          </p>
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {portalPropertyTypeOptions.map(({ value, label, Icon }) => {
              const active = portalPropertyType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPortalPropertyType(value)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-brand-border bg-white text-brand-ink hover:border-brand-blue"
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-white" : "text-brand-blue"}`} />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
          Open on Portal
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(Object.keys(portalMeta) as (keyof typeof portalMeta)[]).map((portal) => (
            <a
              key={portal}
              href={portalUrl(portal, {
                transactionType,
                location: effectiveLocation,
                priceMin,
                priceMax,
                bedrooms,
                propertyType: portalPropertyType,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-brand-border bg-white px-4 py-3 transition-colors hover:border-brand-blue"
            >
              <span
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${portalMeta[portal].badge}`}
              >
                {portalMeta[portal].initial}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-brand-ink">
                  {portalMeta[portal].label}
                </span>
                <span className="block truncate text-xs text-brand-muted">
                  For sale · {effectiveLocation || "UK"}
                </span>
              </span>
              <span
                aria-hidden
                className="flex-shrink-0 text-brand-muted transition-colors group-hover:text-brand-blue"
              >
                ↗
              </span>
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            openAllPortals({
              transactionType,
              location: effectiveLocation,
              priceMin,
              priceMax,
              bedrooms,
              propertyType: portalPropertyType,
            })
          }
          className="mt-3 w-full rounded-xl border border-brand-blue bg-brand-blue-light px-4 py-2.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
        >
          Open all three portals at once
        </button>
      </div>

      {/* Found something on a real portal? Paste the link and run the same
          AI-check flow that already exists on the live product's My
          Properties page (tenant-only there, so kept tenant-only here). */}
      {!isInvestor && <PropertyLinkImporter />}

      {/* Browse listings already on Buynidify, filtered by the same criteria above */}
      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-brand-muted">
              {results.length} propert{results.length === 1 ? "y" : "ies"} found on Buynidify
              {effectiveLocation ? ` matching "${effectiveLocation}"` : ""}
            </p>
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink">
              <input
                type="checkbox"
                checked={filters.furnished}
                onChange={() => toggle("furnished")}
                className="accent-brand-blue"
              />
              Furnished only
            </label>
          </div>
          <div className="flex rounded-lg border border-brand-border bg-white p-0.5">
            <button
              onClick={() => setView("list")}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${
                view === "list" ? "bg-brand-blue text-white" : "text-brand-muted"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("map")}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${
                view === "map" ? "bg-brand-blue text-white" : "text-brand-muted"
              }`}
            >
              Map
            </button>
          </div>
        </div>

        {view === "map" ? (
          <MapPlaceholder properties={results} />
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
            No properties match those filters. Try widening your search, or
            use the portal links above for the full UK market.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                showFavorite
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
