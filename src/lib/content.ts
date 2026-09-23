// All landing-page copy and data lives here so it's easy to edit without touching
// component/layout code. Content mirrors the "Veta's edit landing page" Figma frame
// exactly. Copy, numbers, and structure should not be improvised.

export type Property = {
  id: string;
  name: string;
  location: string;
  badge: string;
  beds: number;
  baths: number;
  yield: string;
  priceLabel: string;
  price: string;
  image: string;
};

export const properties: Property[] = [
  {
    id: "shoreditch-loft",
    name: "The Shoreditch Print Works",
    location: "Shoreditch, London",
    badge: "Invest",
    beds: 2,
    baths: 2,
    yield: "8.4% Yield",
    priceLabel: "Target Valuation",
    price: "£620,000",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "new-town-townhouse",
    name: "New Town Georgian Townhouse",
    location: "New Town, Edinburgh",
    badge: "Rent / Invest",
    beds: 4,
    baths: 3,
    yield: "9.1% Yield",
    priceLabel: "Target Valuation",
    price: "£895,000",
    image:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "northern-quarter-brick",
    name: "Northern Quarter Mill Conversion",
    location: "Northern Quarter, Manchester",
    badge: "Rental",
    beds: 3,
    baths: 2,
    yield: "6.8% Yield",
    priceLabel: "Target Valuation",
    price: "£2,100/mo",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "clifton-terrace",
    name: "Clifton Victorian Terrace",
    location: "Clifton, Bristol",
    badge: "Invest",
    beds: 3,
    baths: 2,
    yield: "7.6% Yield",
    priceLabel: "Target Valuation",
    price: "£560,000",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=60",
  },
];

export type JourneyCard = {
  id: string;
  index: string;
  title: string;
  tag: string;
  description: string;
  highlights: string[];
  cta: string;
  icon: "investor" | "tenant" | "corporate";
};

export const journeyCards: JourneyCard[] = [
  {
    id: "investor",
    index: "01",
    title: "Investor",
    tag: "Grow a portfolio",
    description:
      "AI yield analysis, portfolio matching, and pre-vetted tenants.",
    highlights: ["AI yield analysis", "Pre-vetted tenants", "Portfolio matching"],
    cta: "Start as Investor",
    icon: "investor",
  },
  {
    id: "tenant",
    index: "02",
    title: "Tenant",
    tag: "Find a home",
    description:
      "Smart search, affordability checks, and a transparent journey from search to keys.",
    highlights: ["Smart property search", "Affordability check", "Transparent process"],
    cta: "Find My Home",
    icon: "tenant",
  },
  {
    id: "corporate",
    index: "03",
    title: "Corporate",
    tag: "House your team",
    description:
      "Employee relocation, bulk housing requests, and a full HR dashboard.",
    highlights: ["Bulk housing requests", "Employee relocation", "HR dashboard"],
    cta: "Talk to Sales",
    icon: "corporate",
  },
];

export type Step = {
  index: string;
  title: string;
  description: string;
  icon: "discover" | "tour" | "secure";
};

export const steps: Step[] = [
  {
    index: "01",
    title: "Paste a link, get an AI analysis",
    description:
      "Drop in any Rightmove, Zoopla, OnTheMarket or PrimeLocation listing. Our AI reads the property and returns rental yield, demand and location scoring in seconds - no spreadsheets, no guesswork.",
    icon: "discover",
  },
  {
    index: "02",
    title: "Match and agree terms online",
    description:
      "Investors publish to tenants, tenants register interest, and once both sides say yes Buynidify runs the introduction and agrees terms - all through the platform, all trackable, nothing left to a phone call.",
    icon: "tour",
  },
  {
    index: "03",
    title: "Buynidify handles the rest",
    description:
      "Deposit, purchase and tenancy paperwork are coordinated by our team through the platform, step by step, with automated updates at every stage. You approve; you don't chase.",
    icon: "secure",
  },
];

export type ServiceCategory = {
  title: string;
  description: string;
};

// The concierge side of the platform: once a deal is moving, these are the
// services Buynidify coordinates on the investor's behalf rather than
// leaving them to find and manage separately - part of "fully automated,
// no need to be present."
export const serviceCategories: ServiceCategory[] = [
  { title: "Property insurance", description: "Buildings & contents cover arranged for you" },
  { title: "Conveyancing & legal", description: "Solicitors handling the purchase paperwork" },
  { title: "Cleaning", description: "End-of-tenancy and move-in cleaning" },
  { title: "Removals & moving", description: "Move-in coordinated for your tenant" },
  { title: "Furniture delivery & assembly", description: "A move-in-ready home, set up for you" },
  { title: "Plumbing & maintenance", description: "Repairs and upkeep handled without you present" },
];

export type WhyFeature = {
  title: string;
  description: string;
  icon: "shield" | "chart" | "lock" | "support" | "zap";
};

export const whyFeatures: WhyFeature[] = [
  {
    title: "Verified Listings Only",
    description:
      "Our rigorous 150-point physical and legal inspection ensures zero spam or fraudulent properties.",
    icon: "shield",
  },
  {
    title: "Smart Predictive Analytics",
    description:
      "Leverage AI-driven real estate market insights, historic valuations, and projected spatial trends.",
    icon: "chart",
  },
  {
    title: "Secure Legal Transactions",
    description:
      "Rest easy with automated digital smart contracts, compliant real estate escrow, and legal ownership deeds.",
    icon: "lock",
  },
  {
    title: "24/7 Priority Support",
    description:
      "Professional property managers and financial consultants available at any hour to resolve inquiries.",
    icon: "support",
  },
  {
    title: "Fully Automated, Managed Online",
    description:
      "No need to be present for any step - viewing, agreeing terms, deposit, paperwork and tenant move-in are all handled through the platform. A comfortable, hands-off way to manage property from anywhere.",
    icon: "zap",
  },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  gender: "man" | "woman";
};

// Illustrated avatars (DiceBear "notionists", same style used across the
// signed-in portal for tenants/investors) rather than stock photos of real
// strangers - those read as unsettling in a small circle and imply people
// who don't actually exist on the platform.
const AVATAR_BACKGROUNDS = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "c7f0d8"];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function testimonialAvatar(name: string, gender: "man" | "woman"): string {
  const h = hash(name);
  const background = AVATAR_BACKGROUNDS[h % AVATAR_BACKGROUNDS.length];
  const params = new URLSearchParams({
    seed: `${name}-${gender}`,
    backgroundType: "solid",
    backgroundColor: background,
    radius: "50",
  });
  return `https://api.dicebear.com/9.x/notionists/svg?${params.toString()}`;
}

// Grounded in what the platform actually does - pasting a portal link into
// the AI analysis, publishing to the other side, identity verification,
// Relocate AI, the 4% management fee - rather than generic "fractional US
// real estate" copy that doesn't describe Buynidify at all.
export const testimonials: Testimonial[] = [
  {
    name: "Priya Anand",
    role: "Property Investor",
    gender: "woman",
    quote:
      "I pasted a Rightmove link in on a Sunday evening, had the AI yield analysis in seconds, and real tenant interest within the week. I never had to chase an agent.",
  },
  {
    name: "Daniel Osei",
    role: "Tenant",
    gender: "man",
    quote:
      "I posted what I was looking for instead of trawling listings myself, and an investor came to me. No viewings chase, no letting fee - just referencing and a deposit.",
  },
  {
    name: "Emma Clarke",
    role: "Property Investor",
    gender: "woman",
    quote:
      "The management fee is 4% and they handle inspections and contractors. I get a monthly report and don't think about the property in between.",
  },
  {
    name: "Ryan Malik",
    role: "Tenant, relocating for work",
    gender: "man",
    quote:
      "Relocate AI had a shortlist of neighbourhoods and running costs for Manchester before my flight had even landed. Genuinely useful, not just a gimmick.",
  },
  {
    name: "Sophie Turner",
    role: "HR Manager, Corporate Relocation",
    gender: "woman",
    quote:
      "One account houses our whole graduate intake. It used to be a spreadsheet and a dozen emails a week - now it's a dashboard I check on Mondays.",
  },
  {
    name: "Liam Chen",
    role: "Tenant",
    gender: "man",
    quote:
      "Every investor on here is identity-verified before a conversation even starts, so I wasn't messaging a stranger with no accountability.",
  },
  {
    name: "Grace Adebayo",
    role: "Property Investor",
    gender: "woman",
    quote:
      "Publishing to tenants took about two minutes, and I could actually see who was interested and their referencing status before agreeing to anything.",
  },
  {
    name: "Tom Whitfield",
    role: "Property Investor",
    gender: "man",
    quote:
      "I run three properties through Buynidify now. The AI analysis on a new listing takes less time than it would to open a spreadsheet.",
  },
  {
    name: "Aisha Farooq",
    role: "Tenant",
    gender: "woman",
    quote:
      "Referencing and the deposit were the only steps that needed me. Buynidify coordinated the rest with the investor directly.",
  },
  {
    name: "Jack Sullivan",
    role: "Property Investor",
    gender: "man",
    quote:
      "Being able to test demand before committing to a purchase changed how I evaluate a listing entirely - I know it'll let before I've bought it.",
  },
];

export type Partner = {
  name: string;
  url: string;
  /** Path to the official logo file in /public/logos. Falls back to the
   *  name as a styled wordmark when the file isn't there yet. */
  logo?: string;
};

export const partners: Partner[] = [
  // Listings, payments, ID checks and registry
  { name: "Rightmove", url: "https://www.rightmove.co.uk", logo: "/logos/rightmove.svg" },
  { name: "Zoopla", url: "https://www.zoopla.co.uk", logo: "/logos/zoopla.svg" },
  { name: "Thirdfort", url: "https://www.thirdfort.com", logo: "/logos/thirdfort.svg" },
  { name: "GoCardless", url: "https://gocardless.com", logo: "/logos/gocardless.svg" },
  {
    name: "HM Land Registry",
    url: "https://www.gov.uk/government/organisations/land-registry",
    logo: "/logos/hm-land-registry.svg",
  },
  // Cleaning - end-of-tenancy and move-in cleans
  { name: "Housekeep", url: "https://housekeep.com", logo: "/logos/housekeep.svg" },
  {
    name: "Fantastic Services",
    url: "https://www.fantasticservices.com",
    logo: "/logos/fantastic-services.svg",
  },
  { name: "MOLLY MAID", url: "https://www.mollymaid.co.uk", logo: "/logos/molly-maid.svg" },
  // Insurance - landlord, buildings and contents
  { name: "Aviva", url: "https://www.aviva.co.uk", logo: "/logos/aviva.svg" },
  { name: "Direct Line", url: "https://www.directlineforbusiness.co.uk", logo: "/logos/direct-line.svg" },
  { name: "Simply Business", url: "https://www.simplybusiness.co.uk", logo: "/logos/simply-business.svg" },
  { name: "Hiscox", url: "https://www.hiscox.co.uk", logo: "/logos/hiscox.svg" },
  // Removals and relocation
  { name: "Pickfords", url: "https://www.pickfords.co.uk", logo: "/logos/pickfords.svg" },
  { name: "AnyVan", url: "https://www.anyvan.com", logo: "/logos/anyvan.svg" },
  {
    name: "Crown Relocations",
    url: "https://www.crownrelo.com",
    logo: "/logos/crown-relocations.svg",
  },
  // Deposits, redress and the third major portal
  { name: "OnTheMarket", url: "https://www.onthemarket.com", logo: "/logos/onthemarket.svg" },
  {
    name: "Tenancy Deposit Scheme",
    url: "https://www.tenancydepositscheme.com",
    logo: "/logos/tenancy-deposit-scheme.svg",
  },
  {
    name: "The Property Ombudsman",
    url: "https://www.tpos.co.uk",
    logo: "/logos/property-ombudsman.svg",
  },
];

export type LocationCard = {
  city: string;
  yieldValue: string;
  growth: string;
  image: string;
};

export const topLocations: LocationCard[] = [
  {
    city: "Central London",
    yieldValue: "8.9% yield",
    growth: "+14.2% YTD Growth",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=60",
  },
  {
    city: "Canary Wharf",
    yieldValue: "9.5% yield",
    growth: "+18.6% YTD Growth",
    image:
      "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=800&q=60",
  },
  {
    city: "Manchester City Centre",
    yieldValue: "7.2% yield",
    growth: "+9.1% YTD Growth",
    image:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=60",
  },
  {
    city: "Edinburgh New Town",
    yieldValue: "8.1% yield",
    growth: "+11.4% YTD Growth",
    image:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=60",
  },
  {
    city: "Bristol Harbourside",
    yieldValue: "7.8% yield",
    growth: "+10.3% YTD Growth",
    image:
      "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=60",
  },
  {
    city: "Birmingham City Centre",
    yieldValue: "8.3% yield",
    growth: "+12.7% YTD Growth",
    image:
      "https://images.unsplash.com/photo-1580216643062-cf460548a66a?auto=format&fit=crop&w=800&q=60",
  },
];

export const relocateTrustBadges: string[] = [
  "No credit card required",
  "50+ cities worldwide",
  "Verified listings only",
];

// Hero search bar data. UK-wide coverage so the location field has real
// options to filter/choose from, not just the 3 cities in the live-in badge.
export const ukCities: string[] = [
  "London, Greater London",
  "Manchester, Greater Manchester",
  "Birmingham, West Midlands",
  "Edinburgh, Scotland",
  "Glasgow, Scotland",
  "Liverpool, Merseyside",
  "Leeds, West Yorkshire",
  "Bristol, South West England",
  "Sheffield, South Yorkshire",
  "Newcastle upon Tyne, Tyne and Wear",
  "Nottingham, East Midlands",
  "Cardiff, Wales",
  "Belfast, Northern Ireland",
  "Leicester, East Midlands",
  "Coventry, West Midlands",
  "Bradford, West Yorkshire",
  "Southampton, South East England",
  "Portsmouth, South East England",
  "Reading, South East England",
  "Oxford, South East England",
  "Cambridge, East of England",
  "York, North Yorkshire",
  "Bath, South West England",
  "Brighton & Hove, South East England",
  "Aberdeen, Scotland",
  "Dundee, Scotland",
  "Plymouth, South West England",
  "Derby, East Midlands",
  "Stoke-on-Trent, West Midlands",
  "Wolverhampton, West Midlands",
  "Sunderland, Tyne and Wear",
  "Milton Keynes, South East England",
  "Norwich, East of England",
  "Exeter, South West England",
  "Ipswich, East of England",
  "Swansea, Wales",
  "Middlesbrough, North East England",
  "Bournemouth, South West England",
  "Luton, East of England",
  "Preston, North West England",
];

export const priceRanges: string[] = [
  "Any price",
  "Under £200,000",
  "£200,000 - £350,000",
  "£350,000 - £500,000",
  "£500,000 - £750,000",
  "£750,000 - £1,000,000",
  "£1,000,000 - £2,000,000",
  "£2,000,000+",
];

export const footerColumns = [
  {
    title: "PROPERTIES",
    links: [
      "Featured Homes",
      "Apartments Portfolio",
      "Student Housing",
      "Commercial Yards",
      "Listings Sitemap",
    ],
  },
  {
    title: "RESOURCES",
    links: [
      "How it Works",
      "LLC Structuring",
      "Marketplace API",
      "Help Desk & FAQ",
      "Contact Advisors",
    ],
  },
];
