// UK rental market reference data - researched once, reused everywhere a
// feature needs "roughly what does this cost / what yield is realistic" for
// a given city, instead of pretending to hit a live API on every render.
// Figures are ballpark 2025 market ranges (typical unfurnished long-let
// asking rent by bedroom count, and typical gross rental yield for a
// buy-to-let in that city) - directionally realistic for a demo, not a feed
// from a pricing API. Used by: the property AI analysis (rent + yield
// suggestions) and the standalone Relocate AI chat (cost-of-living answers).
//
// Keyed by the city name as it appears before the comma in `ukCities`
// (lib/content.ts), lowercased, so lookups can go straight from a listing's
// `city` field or a chat answer without a separate mapping table.

export type CityMarket = {
  region: string;
  /** Typical monthly asking rent range (£) by bedroom count, unfurnished long let. */
  rentByBeds: Record<1 | 2 | 3 | 4, [number, number]>;
  /** Typical gross rental yield range (%) for a buy-to-let in this city. */
  yieldRange: [number, number];
  /** One-paragraph market read, written so the AI analysis can quote it directly. */
  summary: string;
  popularAreas: string[];
};

const curated: Record<string, CityMarket> = {
  london: {
    region: "Greater London",
    rentByBeds: { 1: [1500, 2100], 2: [1900, 2800], 3: [2600, 3800], 4: [3400, 5200] },
    yieldRange: [3.2, 4.8],
    summary:
      "London commands the UK's highest rents but its lowest yields - capital growth, not cashflow, is the usual case for buying here. Demand is deep and consistent across almost every zone, driven by both professional tenants and overseas buyers.",
    popularAreas: ["Shoreditch", "Clapham", "Canary Wharf", "Greenwich"],
  },
  manchester: {
    region: "Greater Manchester",
    rentByBeds: { 1: [850, 1150], 2: [1100, 1500], 3: [1400, 1900], 4: [1800, 2500] },
    yieldRange: [6.0, 8.2],
    summary:
      "Manchester is one of the strongest yield markets in the UK, fuelled by a large student and young-professional population and continued city-centre regeneration. Rental demand has consistently outpaced new supply here for several years.",
    popularAreas: ["Northern Quarter", "Ancoats", "Salford Quays", "Didsbury"],
  },
  birmingham: {
    region: "West Midlands",
    rentByBeds: { 1: [800, 1050], 2: [1000, 1350], 3: [1250, 1700], 4: [1600, 2200] },
    yieldRange: [5.8, 7.6],
    summary:
      "The HS2 connection, a major regeneration pipeline, and the UK's youngest big-city population keep Birmingham rental demand strong. Yields sit comfortably above the national average without London's price ceiling.",
    popularAreas: ["Digbeth", "Jewellery Quarter", "Edgbaston", "Harborne"],
  },
  edinburgh: {
    region: "Scotland",
    rentByBeds: { 1: [1000, 1350], 2: [1300, 1750], 3: [1700, 2300], 4: [2200, 3000] },
    yieldRange: [5.0, 6.8],
    summary:
      "Edinburgh's rental market is tight - a historic city centre with limited new-build supply meets steady demand from students, the finance sector, and tourism-adjacent short lets pushing into the long-let stock. Rents have risen faster here than almost anywhere else in the UK in recent years.",
    popularAreas: ["New Town", "Leith", "Marchmont", "Stockbridge"],
  },
  glasgow: {
    region: "Scotland",
    rentByBeds: { 1: [750, 1000], 2: [950, 1300], 3: [1200, 1650], 4: [1550, 2100] },
    yieldRange: [6.5, 8.8],
    summary:
      "Glasgow offers some of the best yields of any major UK city, with entry prices well below comparable English cities and a large, stable student and young-professional rental base.",
    popularAreas: ["West End", "Merchant City", "Finnieston", "Southside"],
  },
  liverpool: {
    region: "Merseyside",
    rentByBeds: { 1: [700, 950], 2: [900, 1200], 3: [1150, 1550], 4: [1450, 1950] },
    yieldRange: [7.0, 9.5],
    summary:
      "Liverpool is consistently one of the highest-yielding cities in the UK - low entry prices, a large student population, and an ongoing waterfront regeneration programme keep cashflow strong for investors.",
    popularAreas: ["Baltic Triangle", "Ropewalks", "Georgian Quarter", "Aigburth"],
  },
  leeds: {
    region: "West Yorkshire",
    rentByBeds: { 1: [800, 1050], 2: [1000, 1350], 3: [1250, 1700], 4: [1600, 2150] },
    yieldRange: [6.2, 8.0],
    summary:
      "Leeds has grown into the largest financial and legal centre outside London, and rental demand has grown with it. A steady flow of city-centre apartment developments has kept the market liquid for both investors and tenants.",
    popularAreas: ["City Centre", "Headingley", "Chapel Allerton", "Kirkstall"],
  },
  bristol: {
    region: "South West England",
    rentByBeds: { 1: [1050, 1400], 2: [1350, 1800], 3: [1700, 2300], 4: [2200, 3000] },
    yieldRange: [4.8, 6.4],
    summary:
      "Bristol combines a strong tech and creative-industry job market with limited land for new housing, which keeps rents rising steadily. It behaves more like a satellite of London's market than a typical regional city.",
    popularAreas: ["Clifton", "Bedminster", "Stokes Croft", "Redland"],
  },
  sheffield: {
    region: "South Yorkshire",
    rentByBeds: { 1: [700, 900], 2: [850, 1150], 3: [1100, 1450], 4: [1350, 1800] },
    yieldRange: [6.8, 9.0],
    summary:
      "Sheffield's large student population (two universities) and comparatively low property prices give it some of the strongest yields in the North, alongside a growing digital and advanced-manufacturing employment base.",
    popularAreas: ["Kelham Island", "Ecclesall Road", "Broomhill", "City Centre"],
  },
  "newcastle upon tyne": {
    region: "Tyne and Wear",
    rentByBeds: { 1: [700, 900], 2: [850, 1150], 3: [1100, 1450], 4: [1400, 1850] },
    yieldRange: [6.5, 8.6],
    summary:
      "Newcastle's rental market is anchored by a large student population and a growing tech/digital cluster, with city-centre apartment stock offering reliably strong yields relative to purchase price.",
    popularAreas: ["Quayside", "Jesmond", "Ouseburn", "City Centre"],
  },
  cardiff: {
    region: "Wales",
    rentByBeds: { 1: [800, 1050], 2: [1000, 1350], 3: [1250, 1650], 4: [1550, 2050] },
    yieldRange: [5.8, 7.5],
    summary:
      "As the Welsh capital and the region's economic centre, Cardiff draws steady demand from the public sector, media industry and a large student population, with prices still well below comparable English cities.",
    popularAreas: ["Cardiff Bay", "Pontcanna", "Roath", "City Centre"],
  },
  nottingham: {
    region: "East Midlands",
    rentByBeds: { 1: [750, 950], 2: [900, 1200], 3: [1100, 1450], 4: [1400, 1850] },
    yieldRange: [6.5, 8.5],
    summary:
      "Two large universities and a compact, walkable city centre make Nottingham a consistently strong yield market, with purpose-built and converted city-centre apartments in particular demand.",
    popularAreas: ["Lace Market", "City Centre", "West Bridgford", "Beeston"],
  },
  oxford: {
    region: "South East England",
    rentByBeds: { 1: [1300, 1700], 2: [1650, 2150], 3: [2100, 2800], 4: [2700, 3600] },
    yieldRange: [3.6, 5.0],
    summary:
      "Oxford's rental market is defined by extreme supply constraints - a tightly protected historic core, the university, and a booming life-sciences sector all compete for a very limited amount of housing, keeping rents among the highest outside London.",
    popularAreas: ["Jericho", "Headington", "Cowley", "Summertown"],
  },
  cambridge: {
    region: "East of England",
    rentByBeds: { 1: [1250, 1650], 2: [1600, 2100], 3: [2000, 2700], 4: [2600, 3500] },
    yieldRange: [3.8, 5.2],
    summary:
      "Cambridge shares Oxford's supply problem - a globally significant university and life-sciences cluster sit inside a city with very little room to build, which keeps both rents and purchase prices high relative to yield.",
    popularAreas: ["Cambridge City Centre", "Chesterton", "Trumpington", "Mill Road"],
  },
  brighton: {
    region: "South East England",
    rentByBeds: { 1: [1200, 1600], 2: [1500, 2000], 3: [1900, 2600], 4: [2500, 3300] },
    yieldRange: [4.0, 5.6],
    summary:
      "Brighton commands a premium for lifestyle and its proximity to London, with strong demand from commuters and a large student population, though yields trail behind purchase-price growth.",
    popularAreas: ["Kemptown", "Hove", "North Laine", "Seven Dials"],
  },
  southampton: {
    region: "South East England",
    rentByBeds: { 1: [850, 1100], 2: [1050, 1400], 3: [1300, 1750], 4: [1650, 2200] },
    yieldRange: [5.6, 7.2],
    summary:
      "A major port city with two universities and a growing maritime and tech employment base, Southampton offers solid, unglamorous yields without the price extremes of the South East's more fashionable towns.",
    popularAreas: ["Ocean Village", "Portswood", "Shirley", "Woolston"],
  },
};

const REGION_BY_KEYWORD: [string, string][] = [
  ["scotland", "Scotland"],
  ["wales", "Wales"],
  ["northern ireland", "Northern Ireland"],
  ["yorkshire", "Yorkshire"],
  ["midlands", "the Midlands"],
  ["north east", "North East England"],
  ["north west", "North West England"],
  ["south east", "South East England"],
  ["south west", "South West England"],
  ["east of england", "East of England"],
];

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

// A city not in the curated list (most of the 40 in `ukCities` aren't -
// hand-researching all of them isn't worth it for a demo) still gets a
// believable, internally-consistent profile: mid-sized-UK-city rents with a
// deterministic-per-city wobble, and a yield that moves the opposite way
// (cheaper cities skew toward higher yield, same real-world pattern the
// curated cities follow).
function fallbackFor(cityLabel: string): CityMarket {
  const [namePart, regionPart] = cityLabel.split(",").map((s) => s.trim());
  const h = hash(namePart.toLowerCase());
  const base1bed = 650 + (h % 350); // 650-1000
  const scale = (n: number) => Math.round((base1bed * n) / 100) * 10;
  const region =
    REGION_BY_KEYWORD.find(([kw]) => (regionPart ?? "").toLowerCase().includes(kw))?.[1] ??
    regionPart ??
    "United Kingdom";
  const yieldLow = 7.5 - (base1bed - 650) / 200; // cheaper city -> higher yield
  return {
    region,
    rentByBeds: {
      1: [base1bed, scale(128)],
      2: [scale(122), scale(160)],
      3: [scale(155), scale(200)],
      4: [scale(195), scale(255)],
    },
    yieldRange: [Math.round(yieldLow * 10) / 10, Math.round((yieldLow + 1.6) * 10) / 10],
    summary: `${namePart} is a secondary UK rental market without the price extremes of the major cities - demand is steadier and more locally driven than London or the big regional hubs, which tends to mean more moderate rent growth but more consistent occupancy.`,
    popularAreas: ["City Centre", "Near the station", "The suburbs"],
  };
}

/** Accepts either a bare city name ("Bristol") or the "City, Region" form
 * used throughout the app ("Bristol, South West England"). */
export function marketFor(cityLabel: string): CityMarket {
  const namePart = cityLabel.split(",")[0]?.trim().toLowerCase() ?? cityLabel.toLowerCase();
  return curated[namePart] ?? fallbackFor(cityLabel);
}

/** Middle of the rent range for a given bed count - what a publish flow
 * should pre-fill before the person adjusts it manually. */
export function suggestedRent(cityLabel: string, beds: number): number {
  const market = marketFor(cityLabel);
  const bedKey = Math.min(4, Math.max(1, Math.round(beds))) as 1 | 2 | 3 | 4;
  const [low, high] = market.rentByBeds[bedKey];
  return Math.round((low + high) / 2 / 10) * 10;
}
