import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { type PropertyType } from "../data/mockData";
import PropertyLinkImporter from "../components/PropertyLinkImporter";
import MarketplaceGrid from "../components/MarketplaceGrid";
import { useListings } from "../context/ListingsContext";
import { useSearchParams } from "react-router-dom";
import { SearchIcon } from "../../components/icons";
import LocationCombobox from "../../components/LocationCombobox";
import PropertyTypeCombobox from "../../components/PropertyTypeCombobox";
import { digitsOnly, formatThousands } from "../../lib/format";
import { type PortalPropertyType } from "../../lib/propertyTypes";
import { propertyImage } from "../utils/propertyImages";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

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

// Opens all three at once. Browsers can be strict about multiple windows
// from one click, but this fires all three synchronously inside the actual
// click handler (not delayed/async), which is what keeps a browser from
// treating the 2nd and 3rd as unrequested popups.
function openAllPortals(p: PortalSearchParams) {
  (["rightmove", "zoopla", "onthemarket"] as const).forEach((portal) => {
    window.open(portalUrl(portal, p), "_blank", "noopener,noreferrer");
  });
}

// One neutral tone for all three badges - previously each portal got its
// own brand color (green/purple/orange), which read as a loud, mismatched
// row sitting under an otherwise calm, monochrome search bar. Same ink tone
// as the rest of the UI now; the initial letter alone still tells them
// apart.
const portalMeta = {
  rightmove: { label: "Rightmove", initial: "R" },
  zoopla: { label: "Zoopla", initial: "Z" },
  onthemarket: { label: "OnTheMarket", initial: "O" },
} as const;

/** The search experience itself, used by the public /search page and by the
 *  signed-in portal. Same filters, same results, different chrome around it. */
export default function Search({ chrome = "portal" }: { chrome?: "public" | "portal" }) {
  const { role } = useRole();
  const isInvestor = role === "investor";

  // Buynidify only deals in properties to buy - there is no rental search.
  const transactionType = "sale" as const;
  // LocationCombobox takes free text as well as list choices, so one piece
  // of state covers both cities and postcodes.
  // A search started on the landing page arrives as query parameters, so the
  // public page opens already filtered the way the person asked for.
  const [params] = useSearchParams();
  // Empty by default: the whole country until you actually pick somewhere.
  const [location, setLocation] = useState(params.get("location") ?? "");
  const [priceMin, setPriceMin] = useState(params.get("min") ?? "");
  const [priceMax, setPriceMax] = useState(params.get("max") ?? "");
  const [bedrooms, setBedrooms] = useState(params.get("beds") ?? "Any");
  const [portalPropertyType, setPortalPropertyType] = useState<PortalPropertyType>(
    (params.get("type") as PortalPropertyType) ?? "Any"
  );
  // Filtering above is live and only affects Buynidify's own results further
  // down the page. "Search Property" is a different thing entirely: it opens
  // a small panel with the real UK portals, all three shown equally - not a
  // permanent block (too much space) and not one portal singled out as the
  // "main" one (there isn't one).
  const resultsRef = useRef<HTMLDivElement>(null);
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);

  const effectiveLocation = location;
  const mockTypes = portalTypeToMockTypes[portalPropertyType];

  const minBeds = bedrooms === "Any" ? 0 : parseInt(bedrooms, 10);
  const rawMin = priceMin ? Number(priceMin) : 0;
  const rawMax = priceMax ? Number(priceMax) : Infinity;
  // Typing the max below the min used to return nothing with no explanation.
  // Say so, and in the meantime read the pair the way it was obviously meant.
  const priceInverted = Boolean(priceMin && priceMax && rawMax < rawMin);
  const minPriceNum = priceInverted ? rawMax : rawMin;
  const maxPriceNum = priceInverted ? rawMin : rawMax;

  // Same filters, applied to what's actually on Buynidify.
  const { investorListings, tenantDemand } = useListings();

  const platformListings = useMemo(
    () =>
      investorListings.filter((l) => {
        if (l.beds < minBeds) return false;
        if (l.price > maxPriceNum || l.price < minPriceNum) return false;
        if (mockTypes && !mockTypes.includes(l.type as PropertyType)) return false;
        if (effectiveLocation && !`${l.city} ${l.address}`.toLowerCase().includes(effectiveLocation.toLowerCase()))
          return false;
        return true;
      }),
    [investorListings, minBeds, maxPriceNum, minPriceNum, mockTypes, effectiveLocation]
  );

  const platformDemand = useMemo(
    () =>
      tenantDemand.filter((d) => {
        if (d.minBeds < minBeds) return false;
        const price = d.targetPrice ?? 0;
        if (price && (price > maxPriceNum || price < minPriceNum)) return false;
        if (mockTypes && !mockTypes.includes(d.propertyType as PropertyType)) return false;
        if (effectiveLocation && !d.city.toLowerCase().includes(effectiveLocation.toLowerCase()))
          return false;
        return true;
      }),
    [tenantDemand, minBeds, maxPriceNum, minPriceNum, mockTypes, effectiveLocation]
  );

  // Both sides of the marketplace, with the one most useful to you first.
  const [side, setSide] = useState<"investors" | "tenants">(
    isInvestor ? "tenants" : "investors"
  );

  // The properties you've pasted a link for yourself - not the platform's
  // matches. This is what the "your listings" strip and the Manage your
  // listings link below actually mean.
  const { importedProperties } = useListings();
  const myImports = importedProperties.filter((p) =>
    role ? (isInvestor ? p.owner === "investor" : p.owner === "tenant") : p.owner === "guest"
  );
  const myPropertiesPath = role ? "/app/my-properties" : "/my-properties";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        {chrome === "public"
          ? "Search UK property"
          : isInvestor
            ? "Search Properties"
            : "Find a Home to Buy"}
      </h1>
      <p className="mt-1 text-brand-muted">
        {isInvestor
          ? "Properties for sale, ready for you to buy and bring onto the platform."
          : "Homes for sale, matched to what you're looking to buy."}
      </p>

      {/* SEARCH CONSOLE
          Fields filter Buynidify's own listings live, further down. "Search
          Property" is separate: it opens the real-portal panel right inside
          this same card, so the two clearly belong together, without the
          panel sitting open (and taking up space) all the time. */}
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
              placeholder="Anywhere in the UK"
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
                className={`${fieldClass} w-20 ${priceInverted ? "text-red-600" : ""}`}
                aria-invalid={priceInverted}
              />
            </div>
            {priceInverted && (
              <p className="mt-1 text-[11px] font-medium text-red-600">
                Maximum is below the minimum.{" "}
                <button
                  type="button"
                  onClick={() => {
                    setPriceMin(priceMax);
                    setPriceMax(priceMin);
                  }}
                  className="font-semibold underline underline-offset-2"
                >
                  Swap them
                </button>
              </p>
            )}
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

          {/* Back to a button that opens a small panel, not a permanently
              open block or one portal singled out as special - all three
              are equal options, shown equal weight, and the panel is gone
              again the moment you're not using it. */}
          <div className="flex items-center pt-2 lg:pl-2 lg:pt-0">
            <button
              type="button"
              onClick={() => setSearchMenuOpen((v) => !v)}
              className="group flex w-full items-center justify-center gap-3 rounded-full bg-brand-ink py-2.5 pl-6 pr-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-xl lg:w-auto"
            >
              Search Property
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-brand-ink transition-transform duration-200 group-hover:scale-105">
                <SearchIcon className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>

        {/* The panel: all three real portals, equal weight, plus one button
            to open all three together. Only takes space while it's open. */}
        {searchMenuOpen && (
          <div className="border-t border-brand-ink/10 p-3 sm:p-4">
            <div className="grid gap-2 sm:grid-cols-3">
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
                  className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-surface py-3 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue"
                >
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-ink text-[10px] font-bold text-white">
                    {portalMeta[portal].initial}
                  </span>
                  {portalMeta[portal].label}
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
              className="mt-2 w-full rounded-xl border border-brand-border py-2.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue-light"
            >
              Check all three platforms ↗
            </button>
          </div>
        )}
      </div>

      {/* Found something? Paste the link right here, directly under the
          search you just did - not buried below the platform grid. Your own
          added properties, if any, show as one compact line right beneath
          it - not a whole extra card, so Platform listings stays in view. */}
      <div className="mt-4">
        <PropertyLinkImporter inputOnly />
      </div>

      {myImports.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs font-semibold text-brand-ink">
            {myImports.length} you've added:
          </span>
          <div className="flex flex-1 min-w-0 gap-2 overflow-x-auto">
            {myImports.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to={myPropertiesPath}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-brand-border bg-white py-1 pl-1 pr-2.5 transition-colors hover:border-brand-blue"
              >
                <img
                  src={p.imageUrl ?? propertyImage(p.id, p.type)}
                  alt=""
                  className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
                />
                <span className="whitespace-nowrap text-[11px] font-semibold text-brand-ink">
                  {gbp.format(p.price)}
                </span>
              </Link>
            ))}
          </div>
          <Link
            to={myPropertiesPath}
            className="flex-shrink-0 text-xs font-semibold text-brand-blue hover:underline"
          >
            Manage your listings →
          </Link>
        </div>
      )}

      {/* SECONDARY: Buynidify's own platform - a much smaller, clearly
          separate set of matches. Kept close behind the search above
          (rather than buried under a big "your listings" card) so it's
          still visible without much scrolling, and so it's obvious tenants'
          own requests are in here too, not just investor listings. */}
      <div ref={resultsRef} className="mt-6 scroll-mt-6 border-t border-brand-border pt-6">
        <h2 className="font-display text-lg font-semibold tracking-tight text-brand-ink">
          Platform listings
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          <span className="font-semibold text-brand-ink">
            {platformListings.length + platformDemand.length}
          </span>{" "}
          {platformListings.length + platformDemand.length === 1 ? "match" : "matches"} on Buynidify itself
          {effectiveLocation ? ` near ${effectiveLocation}` : " across the UK"}
          {(priceMin || priceMax || bedrooms !== "Any" || portalPropertyType !== "Any") && (
            <>
              {" · "}
              <button
                type="button"
                onClick={() => {
                  setPriceMin("");
                  setPriceMax("");
                  setBedrooms("Any");
                  setPortalPropertyType("Any");
                }}
                className="font-semibold underline-offset-2 hover:text-brand-blue hover:underline"
              >
                Clear filters
              </button>
            </>
          )}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {([
            { id: "investors", label: "From investors", count: platformListings.length },
            { id: "tenants", label: "From tenants", count: platformDemand.length },
          ] as const).map((t) => {
            const active = side === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSide(t.id)}
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
        </div>

        <p className="mt-3 text-sm text-brand-muted">
          {side === "investors"
            ? "Properties investors are considering buying. Register interest and they know the demand is real."
            : "Properties tenants want an investor to buy. Buy one and a tenant is already waiting."}
        </p>

        <MarketplaceGrid
          side={side}
          listings={platformListings}
          demand={platformDemand}
          emptyMessage={
            side === "tenants"
              ? "No tenant is asking for a property like this yet. Widen the filters, or paste a link below to publish one and find out."
              : "No investor has published a property like this yet. Widen the filters, or paste a link below to ask for one."
          }
        />
      </div>
    </div>
  );
}
