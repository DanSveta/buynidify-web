import { useMemo, useRef, useState } from "react";
import { useRole } from "../context/RoleContext";
import { properties, type PropertyType } from "../data/mockData";
import PropertyCard from "../components/PropertyCard";
import MapPlaceholder from "../components/MapPlaceholder";
import PropertyLinkImporter from "../components/PropertyLinkImporter";
import { SearchIcon } from "../../components/icons";
import LocationCombobox from "../../components/LocationCombobox";
import PropertyTypeCombobox from "../../components/PropertyTypeCombobox";
import { digitsOnly, formatThousands } from "../../lib/format";
import { type PortalPropertyType } from "../../lib/propertyTypes";

// One segment of the search bar: tiny coloured label, value underneath, the
// whole cell lighting up on hover - the Airbnb pattern. Fields inside are
// borderless so the bar reads as one object, not five boxed inputs.
function Segment({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 flex-1 rounded-[20px] px-5 py-3 text-left transition-colors hover:bg-black/[0.03] focus-within:bg-black/[0.03] ${className}`}
    >
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-ink/50">
        {label}
      </p>
      {children}
    </div>
  );
}

const fieldClass =
  "w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent p-0 text-sm font-semibold text-brand-ink outline-none placeholder:font-normal placeholder:text-brand-muted";

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
  // LocationCombobox takes free text as well as list choices, so one piece
  // of state covers both cities and postcodes.
  const [location, setLocation] = useState("London");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [bedrooms, setBedrooms] = useState("Any");
  const [portalPropertyType, setPortalPropertyType] = useState<PortalPropertyType>("Any");
  const [view, setView] = useState<"list" | "map">("list");
  // Filtering is live, so the Search button's job is to take you to the
  // results rather than to trigger a fetch.
  const resultsRef = useRef<HTMLDivElement>(null);

  const effectiveLocation = location;
  const mockTypes = portalTypeToMockTypes[portalPropertyType];

  const minBeds = bedrooms === "Any" ? 0 : parseInt(bedrooms, 10);
  const maxPriceNum = priceMax ? Number(priceMax) : Infinity;
  const minPriceNum = priceMin ? Number(priceMin) : 0;

  const results = useMemo(() => {
    return properties.filter((p) => {
      if (p.beds < minBeds) return false;
      if (p.price > maxPriceNum || p.price < minPriceNum) return false;
      if (mockTypes && !mockTypes.includes(p.type)) return false;
      return true;
    });
  }, [minBeds, maxPriceNum, minPriceNum, mockTypes]);

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

      {/* SEARCH CONSOLE
          Blend of the two patterns worth stealing:
          - Airbnb: one elevated pill split into segments, each with a tiny
            label above its value, whole segment highlights on hover, solid
            action button welded to the end.
          - Rightmove: price as a min->to->max pair in a single segment, and
            a live result count sitting right under the bar.
          Everything filters instantly; Search just jumps you to the results. */}
      {/* Same white bar and near-black pill button as the landing page hero,
          so the two searches read as one product. */}
      <div className="mt-6 rounded-[28px] border border-brand-border bg-white p-2 shadow-xl shadow-brand-ink/10">
        <div className="flex flex-col divide-y divide-brand-ink/10 lg:flex-row lg:items-stretch lg:divide-x lg:divide-y-0">
          {/* Exactly the component the landing hero uses, so clicking the
              field opens the same list here. It already accepts free text,
              which is what the old "type a postcode instead" toggle was
              for - that toggle is gone, which also fixes this segment
              being taller than the others. */}
          <Segment label="Location" className="lg:flex-[1.5]">
            <LocationCombobox
              options={ukCities}
              value={location}
              onChange={setLocation}
            />
          </Segment>

          <Segment label="Price range" className="lg:flex-[1.3]">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-brand-muted">£</span>
              {/* Text inputs, not number - only text fields can show the
                  thousands separators, and it drops the spinner arrows. */}
              <input
                type="text"
                inputMode="numeric"
                value={formatThousands(priceMin)}
                onChange={(e) => setPriceMin(digitsOnly(e.target.value))}
                placeholder="Min"
                className={`${fieldClass} w-20`}
              />
              <span className="flex-shrink-0 text-xs text-brand-muted">to</span>
              <input
                type="text"
                inputMode="numeric"
                value={formatThousands(priceMax)}
                onChange={(e) => setPriceMax(digitsOnly(e.target.value))}
                placeholder="Max"
                className={`${fieldClass} w-20`}
              />
            </div>
          </Segment>

          <Segment label="Bedrooms">
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className={fieldClass}
            >
              {bedroomOptions.map((b) => (
                <option key={b} value={b}>
                  {b === "Any" ? "Any beds" : `${b} bed${b === "1" ? "" : "s"}`}
                </option>
              ))}
            </select>
          </Segment>

          {/* Same icon-grid popover as the hero, not a native select. */}
          <Segment label="Property type" className="lg:flex-[1.2]">
            <PropertyTypeCombobox
              value={portalPropertyType}
              onChange={setPortalPropertyType}
            />
          </Segment>

          <div className="flex items-center pt-2 lg:pl-2 lg:pt-0">
            <button
              type="button"
              onClick={() =>
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="group flex w-full items-center justify-center gap-3 rounded-full bg-brand-ink py-2.5 pl-6 pr-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-xl lg:w-auto"
            >
              Search Property
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-brand-ink transition-transform duration-200 group-hover:scale-105">
                <SearchIcon className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Live count, sitting directly under the bar the way portal result
          counts do. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-1">
        <p className="text-sm text-brand-muted">
          <span className="font-semibold text-brand-ink">{results.length}</span>{" "}
          propert{results.length === 1 ? "y" : "ies"} on Buynidify
          {effectiveLocation ? ` near ${effectiveLocation}` : ""}
        </p>
        {(priceMin || priceMax || bedrooms !== "Any" || portalPropertyType !== "Any") && (
          <button
            type="button"
            onClick={() => {
              setPriceMin("");
              setPriceMax("");
              setBedrooms("Any");
              setPortalPropertyType("Any");
            }}
            className="text-xs font-semibold text-brand-muted underline-offset-2 hover:text-brand-blue hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Same filters, pushed out to the real UK market. */}
      <div className="mt-5 rounded-2xl border border-brand-border bg-brand-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Search these filters on the real portals
          </p>
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
            className="text-xs font-semibold text-brand-blue hover:underline"
          >
            Open all three ↗
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
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
              className="group flex items-center gap-2.5 rounded-xl border border-brand-border bg-white px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-md"
            >
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${portalMeta[portal].badge}`}
              >
                {portalMeta[portal].initial}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-ink">
                {portalMeta[portal].label}
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
      </div>

      {/* Found something on a real portal? Paste the link and run the AI
          check. Both roles get this now - the component itself switches
          between the investor (yield + publish to tenants) and tenant
          (affordability + register interest) flows. */}
      <PropertyLinkImporter />

      {/* Browse listings already on Buynidify, filtered by the same criteria above */}
      <div ref={resultsRef} className="mt-8 scroll-mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold tracking-tight text-brand-ink">
            {results.length} propert{results.length === 1 ? "y" : "ies"} on Buynidify
          </h2>
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
