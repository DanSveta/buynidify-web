// Fleshes out a listing with the kind of detail a real portal page carries -
// floor area, tenure, EPC, what's actually in the property, roughly what's
// nearby, a description - none of which the platform stores per-property yet
// (seeded listings have never had it, and a pasted link only gets this rich
// when the AI parse succeeds). Rather than leave the page thin while that's
// still true, everything below is derived deterministically from the
// property's own id/beds/type, so a given listing always shows the same
// detail and the page never reads as empty. It's presented as a platform
// estimate (never as "confirmed" fact) and always sits next to a link to the
// real listing and the map, which is the honest source for anything exact.
//
// Amenities and nearby places carry a `key` rather than an icon or a full
// sentence - the icon lives in the page (this file stays plain data), and
// the key is what a discrete "Garden" / "Parking" chip needs that a
// paragraph-style feature description doesn't.

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(pool: T[], h: number): T {
  return pool[h % pool.length];
}

function isFlatType(type: string): boolean {
  const t = type.toLowerCase();
  return t.includes("apartment") || t.includes("flat") || t.includes("studio") || t.includes("condo") || t.includes("maisonette");
}

const TENURE_FLAT: PropertyDetails["tenure"][] = ["Leasehold", "Leasehold", "Share of Freehold"];
const TENURE_HOUSE: PropertyDetails["tenure"][] = ["Freehold", "Freehold", "Freehold", "Leasehold"];
const COUNCIL_BANDS = ["B", "C", "C", "D", "D", "E", "F"];
const EPC_RATINGS = ["B", "C", "C", "D"];

const BLURB_OPENERS = [
  "A well-presented",
  "A bright and versatile",
  "An attractively finished",
  "A spacious, thoughtfully laid-out",
];

const BLURB_CLOSERS = [
  "well placed for local amenities and transport links.",
  "offering a strong option for a buyer or tenant looking to move quickly.",
  "in a quietly popular residential pocket.",
  "with plenty to like for day-to-day living.",
];

export type AmenityKey =
  | "kitchen"
  | "broadband"
  | "heating"
  | "underfloor"
  | "glazing"
  | "security"
  | "storage"
  | "smart"
  | "furnished"
  | "dishwasher"
  | "office"
  | "wardrobe"
  | "ensuite"
  | "openplan"
  | "period"
  | "utility"
  | "pets"
  | "lift"
  | "balcony"
  | "communalGarden"
  | "bike"
  | "garden"
  | "garage"
  | "parking"
  | "terrace";

const AMENITY_LABELS: Record<AmenityKey, string> = {
  kitchen: "Fitted Kitchen",
  broadband: "Fibre Broadband",
  heating: "Gas Central Heating",
  underfloor: "Underfloor Heating",
  glazing: "Double Glazing",
  security: "Secure Entry System",
  storage: "Loft Storage",
  smart: "Smart Thermostat",
  furnished: "Furnished",
  dishwasher: "Dishwasher",
  office: "Home Office",
  wardrobe: "Walk-in Wardrobe",
  ensuite: "En-suite Bathroom",
  openplan: "Open-plan Living",
  period: "Period Features",
  utility: "Utility Room",
  pets: "Pets Considered",
  lift: "Lift",
  balcony: "Balcony",
  communalGarden: "Communal Garden",
  bike: "Bike Storage",
  garden: "Private Garden",
  garage: "Garage",
  parking: "Off-street Parking",
  terrace: "Terrace",
};

const COMMON_AMENITIES: AmenityKey[] = [
  "kitchen",
  "broadband",
  "heating",
  "glazing",
  "security",
  "storage",
  "smart",
  "furnished",
  "dishwasher",
  "office",
  "wardrobe",
  "ensuite",
  "openplan",
  "period",
  "utility",
  "pets",
  "underfloor",
];

const FLAT_AMENITIES: AmenityKey[] = ["lift", "balcony", "communalGarden", "bike"];
const HOUSE_AMENITIES: AmenityKey[] = ["garden", "garage", "parking", "terrace"];

export type NearbyCategory = "station" | "highstreet" | "supermarket" | "school" | "park";

const NEARBY_POOL: { key: NearbyCategory; name: string; min: number; max: number }[] = [
  { key: "station", name: "Nearest station", min: 0.2, max: 0.9 },
  { key: "highstreet", name: "Town/local centre", min: 0.1, max: 0.6 },
  { key: "supermarket", name: "Supermarket", min: 0.1, max: 0.8 },
  { key: "school", name: "Primary school", min: 0.2, max: 1.1 },
  { key: "park", name: "Park / green space", min: 0.1, max: 0.7 },
];

export type NearbyPlace = {
  key: NearbyCategory;
  name: string;
  distance: string;
  minutes: number;
  mode: "walk" | "drive";
};

function travelTime(distanceMi: number): { minutes: number; mode: "walk" | "drive" } {
  if (distanceMi <= 0.6) {
    return { minutes: Math.max(2, Math.round((distanceMi / 3) * 60 / 1) ), mode: "walk" };
  }
  return { minutes: Math.max(5, Math.round(((distanceMi / 18) * 60) / 5) * 5), mode: "drive" };
}

export type PropertyDetails = {
  sqft: number;
  sqm: number;
  tenure: "Freehold" | "Leasehold" | "Share of Freehold";
  councilTaxBand: string;
  epcRating: string;
  amenities: { key: AmenityKey; label: string }[];
  nearby: NearbyPlace[];
  blurb: string;
};

function sqftFor(h: number, beds: number, flat: boolean): number {
  const base = beds === 0 ? 420 : 380 + beds * 260;
  const jitter = h % 140;
  const typeAdjust = flat ? -40 : 60;
  return Math.round((base + jitter + typeAdjust) / 5) * 5;
}

/** Deterministic detail set for a listing. Real, sourced data (baths,
 *  postcode) should always be preferred over this where it exists - this
 *  only fills the gaps. */
export function propertyDetailsFor(id: string, beds: number, type: string): PropertyDetails {
  const h = hash(id);
  const flat = isFlatType(type);
  const sqft = sqftFor(h, beds, flat);

  const pool = [...COMMON_AMENITIES, ...(flat ? FLAT_AMENITIES : HOUSE_AMENITIES)];
  const shuffled = [...pool].sort((a, b) => hash(id + a) - hash(id + b));
  const amenityCount = 10 + (h % 5);
  const amenities = shuffled.slice(0, amenityCount).map((key) => ({ key, label: AMENITY_LABELS[key] }));

  const nearby: NearbyPlace[] = NEARBY_POOL.map((n, i) => {
    const hh = hash(id + n.key + i);
    const distanceMi = n.min + ((hh % 100) / 100) * (n.max - n.min);
    const { minutes, mode } = travelTime(distanceMi);
    return { key: n.key, name: n.name, distance: `${distanceMi.toFixed(1)} mi`, minutes, mode };
  });

  const opener = pick(BLURB_OPENERS, h);
  const closer = pick(BLURB_CLOSERS, hash(id + "closer"));
  const bedWord = beds === 0 ? "studio" : `${beds}-bedroom`;
  const blurb = `${opener} ${bedWord} ${type.toLowerCase()}, ${closer}`;

  return {
    sqft,
    sqm: Math.round(sqft * 0.0929),
    tenure: pick(flat ? TENURE_FLAT : TENURE_HOUSE, hash(id + "tenure")),
    councilTaxBand: pick(COUNCIL_BANDS, hash(id + "tax")),
    epcRating: pick(EPC_RATINGS, hash(id + "epc")),
    amenities,
    nearby,
    blurb,
  };
}

/** When an investor hasn't set an availability date (every seeded listing,
 *  and any published one where the field was left blank), this gives the
 *  calendar something real to show instead of a permanently empty "now" -
 *  most of the time available now, sometimes a few weeks out, so the
 *  marketplace doesn't read as though every single home is vacant today. */
export function effectiveAvailableFrom(id: string, explicit?: string): Date | null {
  if (explicit) return new Date(`${explicit}T00:00:00`);
  const h = hash(id + "avail");
  if (h % 10 < 6) return null; // available now
  const weeksOut = 1 + (h % 10);
  const d = new Date();
  d.setDate(d.getDate() + weeksOut * 7);
  return d;
}
