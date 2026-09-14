// Shared "generate a believable property from a pasted link" logic, used by
// both the tenant paste-link flow (PropertyLinkImporter) and the investor
// paste-link flow (Marketplace / My Properties). Nothing is really fetched -
// values are derived deterministically from the URL text, same input always
// gives the same output, matching the live product's own "Demo platform:
// previews are generated from the URL" disclaimer.

export type Portal = "Rightmove" | "Zoopla" | "OnTheMarket" | "PrimeLocation" | "Unknown";

export const propertyTypesPool = ["Detached house", "Semi-detached house", "Terraced house", "Flat", "Bungalow"];
export const citiesPool = ["London", "Manchester", "Birmingham", "Leeds", "Bristol", "Edinburgh", "Cardiff", "Liverpool"];
const streetsPool = ["Redchurch St", "Oxford Rd", "Whiteladies Rd", "Kirkgate", "Broad St", "Dundas St", "Canal St", "Royal Crescent"];

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function detectPortal(url: string): Portal {
  const u = url.toLowerCase();
  if (u.includes("rightmove.co.uk")) return "Rightmove";
  if (u.includes("zoopla.co.uk")) return "Zoopla";
  if (u.includes("onthemarket.com")) return "OnTheMarket";
  if (u.includes("primelocation.com")) return "PrimeLocation";
  return "Unknown";
}

export type MockProperty = {
  portal: Portal;
  address: string;
  city: string;
  beds: number;
  price: number;
  type: string;
};

export function buildMockPropertyFromUrl(url: string): MockProperty {
  const seed = hashString(url);
  const portal = detectPortal(url);
  const type = propertyTypesPool[seed % propertyTypesPool.length];
  const city = citiesPool[Math.floor(seed / 7) % citiesPool.length];
  const street = streetsPool[Math.floor(seed / 13) % streetsPool.length];
  const houseNumber = 1 + (seed % 98);
  const beds = 1 + (seed % 4);
  const basePrice = 220000 + (seed % 12) * 35000 + beds * 40000;
  const price = Math.round(basePrice / 5000) * 5000;

  return { portal, address: `${houseNumber} ${street}`, city, beds, price, type };
}
