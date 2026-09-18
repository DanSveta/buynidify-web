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
  description: string;
  cta: string;
  icon: "investor" | "tenant" | "corporate";
};

export const journeyCards: JourneyCard[] = [
  {
    id: "investor",
    index: "01",
    title: "Investor",
    description:
      "AI yield analysis, portfolio matching, and pre-vetted tenants. Grow your portfolio with confidence.",
    cta: "Start as Investor",
    icon: "investor",
  },
  {
    id: "tenant",
    index: "02",
    title: "Tenant",
    description:
      "Find your home. Smart search, affordability analysis, and a transparent renting journey from search to keys.",
    cta: "Find My Home",
    icon: "tenant",
  },
  {
    id: "corporate",
    index: "03",
    title: "Corporate",
    description:
      "Employee relocation, bulk housing requests, and a full HR dashboard for stress-free company housing.",
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
    title: "Discover and Filter",
    description:
      "Browse a tailored curation of institutional-grade properties, filtering by geographical location or expected yield target.",
    icon: "discover",
  },
  {
    index: "02",
    title: "Schedule VR & In-Person Tours",
    description:
      "Instantly book 1-on-1 tours with our local property representatives, or view immediately via high-fidelity spatial VR walk-throughs.",
    icon: "tour",
  },
  {
    index: "03",
    title: "Secure & Diversify",
    description:
      "Finalize standard long-term rentals or start passive micro-investing with as little as $100 using secure real estate ledger technology.",
    icon: "secure",
  },
];

export type Stat = {
  value: string;
  label: string;
};

export const stats: Stat[] = [
  { value: "12.4%", label: "Average Historic ROI" },
  { value: "9.2%", label: "Average Rental Yield" },
  { value: "40k+", label: "Verified Active Investors" },
  { value: "2.4hr", label: "Avg Placement Time" },
];

export const wealthBullets: string[] = [
  "Automated monthly rental payouts directly to your digital ledger",
  "Legally vetted LLC structure guarantees fractional share ownership",
];

export type WhyFeature = {
  title: string;
  description: string;
  icon: "shield" | "chart" | "lock" | "support";
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
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Marcus Aurel",
    role: "Portfolio Investor",
    quote:
      "Buynidify let me diversify into standard US housing portfolios with minimal capital. The rental yield direct deposits are completely seamless.",
    avatar: "https://i.pravatar.cc/100?img=13",
  },
  {
    name: "Sarah Jenkins",
    role: "Homeowner & Landlord",
    quote:
      "Renting our home through the platform felt entirely safe. Our tenant profile was perfectly vetted, and the secure payment system has been flawless.",
    avatar: "https://i.pravatar.cc/100?img=47",
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
