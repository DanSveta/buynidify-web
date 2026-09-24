// Trimmed-down slice of the "property search + AI fit analysis" platform
// sections from the Relocate AI brief. Not a full search-with-filters page -
// just a short, believable set of homes in the destination city, each with
// a lightweight AI "fit" read (score, reasons, red flags, next step). Real
// prices come from ukMarketData.ts so the numbers stay consistent with the
// rest of the app; everything else is generated deterministically from the
// property id so a given destination always shows the same three homes.

import { marketFor } from "../data/ukMarketData";
import { propertyImage } from "../app/utils/propertyImages";

export type Purpose = "work" | "study" | "family" | "eu" | "other";

export type RelocateHome = {
  id: string;
  title: string;
  area: string;
  type: string;
  beds: number;
  rent: number;
  imageUrl: string;
  fitScore: number;
  fitReasons: string[];
  redFlags: string[];
  nextStep: string;
};

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

const TITLES: Record<number, string[]> = {
  1: ["Modern 1-bed apartment", "Refurbished studio flat", "Bright 1-bed with balcony"],
  2: ["2-bed flat near the centre", "2-bed with private garden", "Converted 2-bed apartment"],
  3: ["3-bed family house", "Spacious 3-bed terrace", "3-bed with home office"],
};

const TYPE_BY_BEDS: Record<number, string> = { 1: "Apartment", 2: "Apartment", 3: "House" };

const PURPOSE_REASONS: Record<Purpose, string> = {
  work: "Realistic commute to a central business district",
  study: "Close to major transport links and student-friendly areas",
  family: "Family-sized layout with nearby schools in the area",
  eu: "Settled, established neighbourhood with good local amenities",
  other: "Well-connected area that suits a range of lifestyles",
};

const RED_FLAG_POOL = [
  "Rent sits near the top of the local range for this bed count",
  "Popular area, so viewings and applications tend to move fast",
  "No parking included, worth checking if you'll need it",
  "Furnished status not confirmed, ask before applying",
];

/** Three homes in the given destination city, tuned loosely by purpose.
 * Deterministic per (city, purpose) so the same intake always shows the
 * same shortlist rather than reshuffling on every render. */
export function homesFor(cityLabel: string, purpose: Purpose | null): RelocateHome[] {
  const market = marketFor(cityLabel);
  const bedsCycle = [1, 2, 3];
  return bedsCycle.map((beds, i) => {
    const id = `relocate-${cityLabel.toLowerCase()}-${purpose ?? "other"}-${beds}-${i}`;
    const h = hash(id);
    const [low, high] = market.rentByBeds[Math.min(4, beds) as 1 | 2 | 3];
    const rent = Math.round((low + (h % (high - low + 1))) / 10) * 10;
    const area = market.popularAreas[h % market.popularAreas.length];
    const title = TITLES[beds][h % TITLES[beds].length];
    const fitScore = 68 + (h % 27); // 68-94, always a plausible "decent to strong" fit for a demo
    const reasons = [PURPOSE_REASONS[purpose ?? "other"], `In or near ${area}, one of the areas people ask about most in ${cityLabel.split(",")[0]}`];
    if (rent <= (low + high) / 2) reasons.push("Priced at or below the typical range for this bed count");
    const redFlags: string[] = [];
    if (rent > high * 0.92) redFlags.push(RED_FLAG_POOL[0]);
    if (h % 3 === 0) redFlags.push(RED_FLAG_POOL[1]);
    if (h % 4 === 0) redFlags.push(RED_FLAG_POOL[2]);
    if (redFlags.length === 0) redFlags.push(RED_FLAG_POOL[3]);
    return {
      id,
      title,
      area,
      type: TYPE_BY_BEDS[beds],
      beds,
      rent,
      imageUrl: propertyImage(id, TYPE_BY_BEDS[beds]),
      fitScore,
      fitReasons: reasons,
      redFlags,
      nextStep:
        fitScore >= 85
          ? "Strong match - worth registering and shortlisting this one before it's gone."
          : "Good starting point - shortlist it, then compare against a couple more before deciding.",
    };
  });
}
