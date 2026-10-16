// Mock data for the Relocate AI demo. Everything here is fictional but
// realistic. Rental rules are deliberately worded as "typically" / "commonly":
// they vary by country, city and contract, and need local legal review.

export type CityId =
  | "london" | "manchester" | "berlin" | "paris" | "amsterdam"
  | "madrid" | "lisbon" | "newyork" | "toronto";

export type City = {
  id: CityId;
  city: string;
  country: string;
  currency: string; // symbol shown before amounts
  avg1bed: number; // typical monthly 1-bed rent, in local currency
  blurb: string;
  rules: string[];
  signing: "supported" | "partial" | "varies";
  docs: string[]; // country-specific extra documents
};

export const CITIES: City[] = [
  { id: "london", city: "London", country: "United Kingdom", currency: "£", avg1bed: 2100, signing: "supported",
    blurb: "Largest UK rental market. Fast-moving, competitive, mostly agent-led.",
    rules: ["Deposits are typically capped at 5 weeks' rent and protected in a government-approved scheme.", "Landlords and agents must check your Right to Rent before a tenancy starts.", "Most letting fees charged to tenants are banned."],
    docs: ["Right to Rent proof (passport / visa or share code)", "Employer reference or proof of income", "Previous landlord reference"] },
  { id: "manchester", city: "Manchester", country: "United Kingdom", currency: "£", avg1bed: 1300, signing: "supported",
    blurb: "Strong young-professional market with better value than London.",
    rules: ["Deposits are typically capped at 5 weeks' rent and protected in a government-approved scheme.", "Right to Rent checks apply.", "Holding deposits are usually limited to one week's rent."],
    docs: ["Right to Rent proof (passport / visa or share code)", "Employer reference or proof of income", "Previous landlord reference"] },
  { id: "berlin", city: "Berlin", country: "Germany", currency: "€", avg1bed: 1300, signing: "partial",
    blurb: "Tight market with heavy competition for every listing; paperwork matters.",
    rules: ["Deposits are commonly up to three months' base rent, often held in a separate account.", "A credit report (Schufa) and a landlord confirmation are commonly requested.", "Registering your address (Anmeldung) is typically required shortly after moving in."],
    docs: ["Schufa credit report", "Mietschuldenfreiheitsbescheinigung (landlord confirmation)", "Proof of income (last three payslips)"] },
  { id: "paris", city: "Paris", country: "France", currency: "€", avg1bed: 1500, signing: "partial",
    blurb: "Application-file (dossier) culture; guarantors are commonly expected.",
    rules: ["Deposits are commonly one month (unfurnished) or up to two months (furnished).", "A guarantor, or a guarantee scheme, is commonly requested.", "A full application file (dossier de location) is normal before any viewing result."],
    docs: ["Dossier de location (application file)", "Guarantor documents or guarantee scheme", "Last three payslips and tax notice"] },
  { id: "amsterdam", city: "Amsterdam", country: "Netherlands", currency: "€", avg1bed: 1900, signing: "partial",
    blurb: "Very competitive; temporary contracts and agency fees are common.",
    rules: ["Deposits are commonly up to two months' rent.", "Temporary contracts are common in the private sector.", "Registering at the municipality is typically needed for a residence permit and many services."],
    docs: ["Proof of income (often 3x rent)", "Employer statement", "Passport / residence permit"] },
  { id: "madrid", city: "Madrid", country: "Spain", currency: "€", avg1bed: 1250, signing: "partial",
    blurb: "Lively market; foreigner ID number (NIE) is needed for most contracts.",
    rules: ["Deposits are commonly one to two months' rent.", "A foreigner identification number (NIE) is typically needed to sign.", "Long-term contracts have statutory minimum terms; local advice is recommended."],
    docs: ["NIE (foreigner ID number)", "Employment contract or proof of income", "Bank statements"] },
  { id: "lisbon", city: "Lisbon", country: "Portugal", currency: "€", avg1bed: 1300, signing: "partial",
    blurb: "Popular with remote workers; prices have risen quickly.",
    rules: ["Deposits are commonly up to two months' rent.", "A Portuguese tax number (NIF) is typically needed before signing.", "Rental contracts are usually registered with the tax authority."],
    docs: ["NIF (tax number)", "Proof of income or remote-work contract", "Passport / residence document"] },
  { id: "newyork", city: "New York", country: "United States", currency: "$", avg1bed: 3800, signing: "varies",
    blurb: "Expensive, fast, and screening-heavy; income and credit rules are strict.",
    rules: ["Security deposits are usually limited by state law; rules differ for each state.", "Landlords commonly require income of 40x the monthly rent, or a guarantor.", "Broker fee rules have changed recently; ask who pays before applying."],
    docs: ["Proof of income (often 40x monthly rent)", "Credit report or guarantor", "Employer letter and recent payslips"] },
  { id: "toronto", city: "Toronto", country: "Canada", currency: "C$", avg1bed: 2500, signing: "varies",
    blurb: "Competitive market; tenant protections differ by province.",
    rules: ["Deposit rules are set by province; in Ontario a last-month's-rent deposit is typically allowed.", "Credit and reference checks are commonly requested.", "Standard lease forms are used in some provinces; check the local version."],
    docs: ["Credit report", "Employment letter and recent payslips", "References from a previous landlord"] },
];

export const cityById = (id: CityId): City => CITIES.find((c) => c.id === id) ?? CITIES[0];

export type Property = {
  id: string;
  city: CityId;
  title: string;
  area: string;
  rent: number; // monthly, local currency
  beds: number;
  baths: number;
  sqm: number;
  furnished: boolean;
  pets: boolean;
  available: string; // ISO date
  commute: number; // minutes to a central business district
  agent: string;
  landlordLang: string; // language code of the landlord/agent
  features: string[];
  flags: string[]; // pre-known red flags for this listing
};

const P = (p: Property): Property => p;

export const PROPERTIES: Property[] = [
  P({ id: "ldn-1", city: "london", title: "Bright 1-bed near Canary Wharf", area: "Canary Wharf", rent: 2350, beds: 1, baths: 1, sqm: 48, furnished: true, pets: false, available: "2026-12-01", commute: 15, agent: "Harlow & Reed Lettings", landlordLang: "en", features: ["Concierge", "Gym", "River view"], flags: ["Service charge not included in the advertised rent"] }),
  P({ id: "ldn-2", city: "london", title: "Garden-level 2-bed in Walthamstow", area: "Walthamstow", rent: 2150, beds: 2, baths: 1, sqm: 66, furnished: false, pets: true, available: "2026-11-15", commute: 38, agent: "Northline Homes", landlordLang: "en", features: ["Private garden", "Pets considered", "Near Victoria line"], flags: [] }),
  P({ id: "man-1", city: "manchester", title: "Modern 1-bed in the Northern Quarter", area: "Northern Quarter", rent: 1350, beds: 1, baths: 1, sqm: 44, furnished: true, pets: false, available: "2026-11-20", commute: 10, agent: "Cotton Lane Lettings", landlordLang: "en", features: ["Balcony", "Bike storage"], flags: ["Late-night noise from nearby venues"] }),
  P({ id: "man-2", city: "manchester", title: "Family 3-bed in Chorlton", area: "Chorlton", rent: 1900, beds: 3, baths: 2, sqm: 98, furnished: false, pets: true, available: "2027-01-05", commute: 25, agent: "Brookside Property", landlordLang: "en", features: ["Garden", "Near schools", "Tram stop 6 min"], flags: [] }),
  P({ id: "ber-1", city: "berlin", title: "Altbau 2-room flat in Prenzlauer Berg", area: "Prenzlauer Berg", rent: 1450, beds: 1, baths: 1, sqm: 58, furnished: false, pets: false, available: "2026-12-15", commute: 20, agent: "Spree Immobilien", landlordLang: "de", features: ["High ceilings", "Balcony", "Hardwood floors"], flags: ["Unfurnished: kitchen must be fitted by the tenant"] }),
  P({ id: "ber-2", city: "berlin", title: "Furnished studio in Friedrichshain", area: "Friedrichshain", rent: 1250, beds: 1, baths: 1, sqm: 34, furnished: true, pets: false, available: "2026-11-10", commute: 18, agent: "Ostkreuz Rentals", landlordLang: "de", features: ["Fully furnished", "Short-term option", "Utilities included"], flags: ["Fixed 12-month term"] }),
  P({ id: "par-1", city: "paris", title: "Furnished 1-bed in Le Marais", area: "Le Marais", rent: 1750, beds: 1, baths: 1, sqm: 36, furnished: true, pets: false, available: "2026-12-01", commute: 14, agent: "Rive Droite Immobilier", landlordLang: "fr", features: ["Fully furnished", "Lift", "Historic building"], flags: ["Guarantor required"] }),
  P({ id: "par-2", city: "paris", title: "Bright 2-bed in Montmartre", area: "Montmartre", rent: 2200, beds: 2, baths: 1, sqm: 55, furnished: false, pets: true, available: "2027-01-10", commute: 22, agent: "Butte Habitat", landlordLang: "fr", features: ["Top floor", "Views", "Pets considered"], flags: ["Guarantor required", "No lift, 5th floor"] }),
  P({ id: "ams-1", city: "amsterdam", title: "Canal-side 1-bed in Jordaan", area: "Jordaan", rent: 2100, beds: 1, baths: 1, sqm: 45, furnished: true, pets: false, available: "2026-12-01", commute: 12, agent: "Grachten Verhuur", landlordLang: "en", features: ["Canal view", "Furnished", "Bike included"], flags: ["Temporary contract, 12 months"] }),
  P({ id: "ams-2", city: "amsterdam", title: "Family 3-bed in Amsterdam Zuid", area: "Zuid", rent: 3300, beds: 3, baths: 2, sqm: 105, furnished: false, pets: true, available: "2027-01-15", commute: 20, agent: "Zuidas Housing", landlordLang: "en", features: ["Terrace", "International school nearby"], flags: ["Agency fee payable on signing"] }),
  P({ id: "mad-1", city: "madrid", title: "Sunny 1-bed in Malasaña", area: "Malasaña", rent: 1300, beds: 1, baths: 1, sqm: 42, furnished: true, pets: false, available: "2026-11-25", commute: 12, agent: "Centro Alquileres", landlordLang: "es", features: ["Furnished", "Balcony"], flags: ["Building has no lift"] }),
  P({ id: "mad-2", city: "madrid", title: "2-bed near Retiro Park", area: "Retiro", rent: 1850, beds: 2, baths: 1, sqm: 72, furnished: false, pets: true, available: "2026-12-20", commute: 18, agent: "Retiro Propiedades", landlordLang: "es", features: ["Quiet street", "Pets considered", "Parking option"], flags: [] }),
  P({ id: "lis-1", city: "lisbon", title: "Renovated 1-bed in Alfama", area: "Alfama", rent: 1350, beds: 1, baths: 1, sqm: 40, furnished: true, pets: false, available: "2026-12-05", commute: 15, agent: "Tejo Imobiliária", landlordLang: "pt", features: ["River views", "Renovated"], flags: ["Steep street, no vehicle access"] }),
  P({ id: "lis-2", city: "lisbon", title: "2-bed with terrace in Príncipe Real", area: "Príncipe Real", rent: 2100, beds: 2, baths: 2, sqm: 78, furnished: true, pets: true, available: "2027-01-02", commute: 14, agent: "Lumiar Homes", landlordLang: "pt", features: ["Terrace", "Pets considered", "Air-conditioning"], flags: [] }),
  P({ id: "nyc-1", city: "newyork", title: "1-bed in Williamsburg, Brooklyn", area: "Williamsburg", rent: 3900, beds: 1, baths: 1, sqm: 52, furnished: false, pets: true, available: "2026-12-01", commute: 25, agent: "Bedford Realty Group", landlordLang: "en", features: ["Laundry in building", "Roof deck", "Pets considered"], flags: ["Broker fee may apply", "Income requirement: 40x rent"] }),
  P({ id: "nyc-2", city: "newyork", title: "Studio in Upper West Side", area: "Upper West Side", rent: 3300, beds: 1, baths: 1, sqm: 36, furnished: false, pets: false, available: "2026-11-30", commute: 22, agent: "Hudson & Ash", landlordLang: "en", features: ["Doorman", "Near Central Park"], flags: ["Income requirement: 40x rent", "No pets"] }),
  P({ id: "tor-1", city: "toronto", title: "Condo 1-bed in Liberty Village", area: "Liberty Village", rent: 2450, beds: 1, baths: 1, sqm: 50, furnished: true, pets: true, available: "2026-12-01", commute: 20, agent: "Lakeshore Leasing", landlordLang: "en", features: ["Gym", "Pool", "Pets considered"], flags: [] }),
  P({ id: "tor-2", city: "toronto", title: "2-bed townhouse in The Annex", area: "The Annex", rent: 3400, beds: 2, baths: 2, sqm: 90, furnished: false, pets: true, available: "2027-01-10", commute: 18, agent: "Annex Property Co.", landlordLang: "en", features: ["Garden", "Walkable to university"], flags: ["Utilities not included"] }),
];

export type Language = { code: string; label: string };
export const LANGUAGES: Language[] = [
  { code: "en", label: "English" }, { code: "ru", label: "Russian" }, { code: "uk", label: "Ukrainian" },
  { code: "pl", label: "Polish" }, { code: "es", label: "Spanish" }, { code: "fr", label: "French" },
  { code: "de", label: "German" }, { code: "ar", label: "Arabic" }, { code: "pt", label: "Portuguese" },
  { code: "tr", label: "Turkish" }, { code: "hi", label: "Hindi" }, { code: "sv", label: "Swedish" },
];
export const langLabel = (code: string) => LANGUAGES.find((l) => l.code === code)?.label ?? code;

export const SERVICES: { category: string; blurb: string; providers: { name: string; rating: number; from: string }[] }[] = [
  { category: "Cleaning", blurb: "Move-in and end-of-tenancy cleans.", providers: [{ name: "FreshNest Cleaning", rating: 4.8, from: "from 18/hr" }, { name: "PrimeSpark", rating: 4.6, from: "from 16/hr" }] },
  { category: "Repairs & maintenance", blurb: "Vetted tradespeople for small fixes.", providers: [{ name: "FixRight Pros", rating: 4.7, from: "call-out 45" }, { name: "HandyHub", rating: 4.5, from: "call-out 40" }] },
  { category: "Furnishing", blurb: "Rental furniture packages and delivery.", providers: [{ name: "NestBox Rentals", rating: 4.6, from: "from 120/mo" }, { name: "Homeleaf", rating: 4.4, from: "from 95/mo" }] },
  { category: "Inspections", blurb: "Independent condition and inventory reports.", providers: [{ name: "CheckIn Surveys", rating: 4.9, from: "from 110" }] },
  { category: "Property management", blurb: "Ongoing management for landlords.", providers: [{ name: "KeyStone Management", rating: 4.5, from: "8% of rent" }] },
  { category: "Insurance", blurb: "Contents and liability cover for tenants.", providers: [{ name: "SafeStay Cover", rating: 4.7, from: "from 9/mo" }, { name: "RentShield", rating: 4.5, from: "from 11/mo" }] },
  { category: "Utilities & internet", blurb: "Set up energy, water and broadband.", providers: [{ name: "SwitchOn", rating: 4.6, from: "free to set up" }, { name: "ConnectHome", rating: 4.3, from: "from 25/mo" }] },
];

export const BASE_DOCS = [
  { id: "passport", label: "Passport or national ID" },
  { id: "visa", label: "Visa or residence permit (if applicable)" },
  { id: "income", label: "Proof of income / employment contract" },
  { id: "bank", label: "Recent bank statements" },
  { id: "reference", label: "Landlord or employer reference" },
  { id: "address", label: "Proof of current address" },
];

export const VOICE_DISCLOSURE =
  "I am the Relocate AI assistant. I can help explain, translate, summarise and coordinate the rental process. I am not a lawyer, estate agent or immigration adviser.";

export const LEGAL_DISCLAIMER =
  "Demo data. Rental rules, verification, e-signing and payments vary by country and require local legal and compliance review. Nothing here is legal, immigration or financial advice.";

export type CallLine = {
  speaker: "tenant" | "ai" | "landlord";
  lang: string;
  original: string;
  translated?: string;
  confidence?: number;
  clarify?: string;
};

// Tenant speaks Russian, landlord answers in English (per the brief's demo).
export const CALL_SCRIPT: CallLine[] = [
  { speaker: "ai", lang: "en", original: VOICE_DISCLOSURE },
  { speaker: "tenant", lang: "ru", original: "Здравствуйте! Я интересуюсь квартирой. Она сдаётся с мебелью?", translated: "Hello! I'm interested in the flat. Is it rented furnished?", confidence: 0.97 },
  { speaker: "landlord", lang: "en", original: "Yes, it's fully furnished, including a washing machine.", translated: "Да, квартира полностью меблирована, есть стиральная машина.", confidence: 0.96 },
  { speaker: "tenant", lang: "ru", original: "Можно заехать через две недели? И какой нужен залог?", translated: "Could I move in in two weeks? And what deposit is needed?", confidence: 0.95 },
  { speaker: "landlord", lang: "en", original: "Two weeks works. The deposit is typically around one month's rent, held in a protected scheme.", translated: "Две недели подойдут. Залог обычно около месячной аренды, он хранится в защищённой схеме.", confidence: 0.91 },
  { speaker: "ai", lang: "en", original: "I'm not certain whether bills are included. Shall I ask the landlord to confirm, instead of guessing?", clarify: "Bills inclusion unclear: clarification requested", confidence: 0.62 },
  { speaker: "landlord", lang: "en", original: "Water is included. Electricity and internet are separate.", translated: "Вода включена. Электричество и интернет оплачиваются отдельно.", confidence: 0.94 },
  { speaker: "ai", lang: "en", original: "Both sides agreed on move-in timing. I'll prepare a bilingual summary and next steps for review. Nothing is binding until you both approve it." },
];

export const CALL_SUMMARY = {
  keyAnswers: ["Flat is fully furnished, washing machine included", "Water is included in the rent; electricity and internet are separate"],
  agreedTerms: ["Proposed move-in: two weeks from approval (not binding)", "Deposit: about one month's rent in a protected scheme (to be confirmed in writing)"],
  unresolved: ["Exact move-in time on the day", "Internet provider options"],
  nextSteps: ["Tenant reviews and approves this summary", "Landlord reviews the summary in their language", "Move to the document and agreement workflow (separate controlled step)"],
};
