// Mock data for the Buynidify product app. Everything here is fake:
// no backend, no real listings, no real payments. England-only for now,
// per the 2026-09-04 call notes (stay UK-focused, no other countries yet).

export type PropertyType =
  | "Apartment"
  | "House"
  | "Studio"
  | "Townhouse";

export type Property = {
  id: string;
  address: string;
  city: string;
  price: number; // GBP, sale price
  type: PropertyType;
  beds: number;
  baths: number;
  furnished: boolean;
  washingMachineInUnit: boolean;
  parking: boolean;
  petsAllowed: boolean;
  moveInDate: string;
  fitScore: number;
  status: "listed" | "under-offer" | "sold";
  ownerListed: boolean; // true if an investor already owns/listed it
  image: string;
};

export const properties: Property[] = [
  {
    id: "p1",
    address: "14 Redchurch St, Shoreditch",
    city: "London",
    price: 425000,
    type: "Apartment",
    beds: 2,
    baths: 1,
    furnished: false,
    washingMachineInUnit: true,
    parking: false,
    petsAllowed: true,
    moveInDate: "2026-11-01",
    fitScore: 92,
    status: "listed",
    ownerListed: true,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "p2",
    address: "8 Oxford Rd, City Centre",
    city: "Manchester",
    price: 310000,
    type: "Apartment",
    beds: 1,
    baths: 1,
    furnished: true,
    washingMachineInUnit: true,
    parking: false,
    petsAllowed: false,
    moveInDate: "2026-10-15",
    fitScore: 88,
    status: "listed",
    ownerListed: true,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "p3",
    address: "22 Whiteladies Rd, Clifton",
    city: "Bristol",
    price: 560000,
    type: "House",
    beds: 3,
    baths: 2,
    furnished: false,
    washingMachineInUnit: true,
    parking: true,
    petsAllowed: true,
    moveInDate: "2027-01-05",
    fitScore: 81,
    status: "listed",
    ownerListed: false,
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "p4",
    address: "5 Kirkgate, City Centre",
    city: "Leeds",
    price: 275000,
    type: "Studio",
    beds: 0,
    baths: 1,
    furnished: true,
    washingMachineInUnit: false,
    parking: false,
    petsAllowed: false,
    moveInDate: "2026-10-01",
    fitScore: 95,
    status: "listed",
    ownerListed: true,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "p5",
    address: "31 Broad St, Jewellery Quarter",
    city: "Birmingham",
    price: 390000,
    type: "Apartment",
    beds: 2,
    baths: 1,
    furnished: false,
    washingMachineInUnit: true,
    parking: true,
    petsAllowed: true,
    moveInDate: "2026-12-01",
    fitScore: 87,
    status: "under-offer",
    ownerListed: true,
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "p6",
    address: "9 Dundas St, New Town",
    city: "Edinburgh",
    price: 480000,
    type: "Townhouse",
    beds: 2,
    baths: 2,
    furnished: false,
    washingMachineInUnit: true,
    parking: false,
    petsAllowed: false,
    moveInDate: "2027-02-01",
    fitScore: 90,
    status: "listed",
    ownerListed: false,
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "p7",
    address: "3 Canal St, Northern Quarter",
    city: "Manchester",
    price: 335000,
    type: "Apartment",
    beds: 2,
    baths: 1,
    furnished: true,
    washingMachineInUnit: true,
    parking: false,
    petsAllowed: true,
    moveInDate: "2026-11-20",
    fitScore: 84,
    status: "listed",
    ownerListed: true,
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "p8",
    address: "17 Royal Crescent",
    city: "Bath",
    price: 725000,
    type: "House",
    beds: 4,
    baths: 3,
    furnished: false,
    washingMachineInUnit: true,
    parking: true,
    petsAllowed: true,
    moveInDate: "2027-03-01",
    fitScore: 79,
    status: "listed",
    ownerListed: false,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60",
  },
];

// Tenant demand: this is the missing half of the platform per the MVP scope doc.
// Properties a tenant wants, that no investor has bought yet.
export type TenantDemand = {
  id: string;
  tenantInitials: string;
  city: string;
  propertyType: PropertyType;
  targetRentPerMonth: number;
  minBeds: number;
  interestedTenants: number;
  addedDaysAgo: number;
  notes: string;
};

export const tenantDemand: TenantDemand[] = [
  {
    id: "td1",
    tenantInitials: "J.O.",
    city: "Bristol",
    propertyType: "House",
    targetRentPerMonth: 1800,
    minBeds: 3,
    interestedTenants: 4,
    addedDaysAgo: 2,
    notes: "Wants Clifton or Redland, needs parking, move-in flexible.",
  },
  {
    id: "td2",
    tenantInitials: "M.K.",
    city: "Edinburgh",
    propertyType: "Townhouse",
    targetRentPerMonth: 2100,
    minBeds: 2,
    interestedTenants: 2,
    addedDaysAgo: 5,
    notes: "New Town or Stockbridge preferred, relocating for work in Feb.",
  },
  {
    id: "td3",
    tenantInitials: "A.R.",
    city: "Bath",
    propertyType: "House",
    targetRentPerMonth: 2600,
    minBeds: 4,
    interestedTenants: 1,
    addedDaysAgo: 9,
    notes: "Family of 5, needs a garden, school catchment matters.",
  },
  {
    id: "td4",
    tenantInitials: "D.P.",
    city: "Manchester",
    propertyType: "Apartment",
    targetRentPerMonth: 1150,
    minBeds: 1,
    interestedTenants: 6,
    addedDaysAgo: 1,
    notes: "First-time renter, wants Northern Quarter or Ancoats.",
  },
];

// Deal tracker: the visible, shared step-by-step flow the MVP doc says
// does not exist anywhere in the real product yet.
export type DealStage =
  | "matched"
  | "deposit-paid"
  | "purchase-in-progress"
  | "lease-signed";

export const dealStages: { id: DealStage; label: string; description: string }[] = [
  {
    id: "matched",
    label: "Matched",
    description: "Tenant and investor have both expressed interest.",
  },
  {
    id: "deposit-paid",
    label: "Deposit Paid",
    description: "Tenant has paid a holding deposit to secure the home.",
  },
  {
    id: "purchase-in-progress",
    label: "Purchase In Progress",
    description: "Investor is buying the property through legal partners.",
  },
  {
    id: "lease-signed",
    label: "Lease Signed",
    description: "Rental agreement signed, deposit converted, deal closed.",
  },
];

export type Deal = {
  id: string;
  propertyAddress: string;
  city: string;
  investorInitials: string;
  tenantInitials: string;
  stage: DealStage;
  updatedDaysAgo: number;
};

export const deals: Deal[] = [
  {
    id: "d1",
    propertyAddress: "14 Redchurch St, Shoreditch",
    city: "London",
    investorInitials: "R.T.",
    tenantInitials: "S.D.",
    stage: "purchase-in-progress",
    updatedDaysAgo: 1,
  },
  {
    id: "d2",
    propertyAddress: "8 Oxford Rd, City Centre",
    city: "Manchester",
    investorInitials: "L.N.",
    tenantInitials: "J.C.",
    stage: "deposit-paid",
    updatedDaysAgo: 3,
  },
  {
    id: "d3",
    propertyAddress: "5 Kirkgate, City Centre",
    city: "Leeds",
    investorInitials: "R.T.",
    tenantInitials: "M.W.",
    stage: "matched",
    updatedDaysAgo: 0,
  },
  {
    id: "d4",
    propertyAddress: "31 Broad St, Jewellery Quarter",
    city: "Birmingham",
    investorInitials: "A.K.",
    tenantInitials: "P.H.",
    stage: "lease-signed",
    updatedDaysAgo: 14,
  },
];

export type SupportCategory = {
  id: string;
  label: string;
  description: string;
  routedTo: string;
};

export const supportCategories: SupportCategory[] = [
  {
    id: "maintenance",
    label: "Maintenance & Repairs",
    description: "Boiler, plumbing, electrics, appliances.",
    routedTo: "AI triage, then local service partner if needed",
  },
  {
    id: "payments",
    label: "Rent & Payments",
    description: "Payment issues, receipts, statements.",
    routedTo: "Billing support",
  },
  {
    id: "lease",
    label: "Lease Questions",
    description: "Renewal terms, notice periods, amendments.",
    routedTo: "Buynidify coordinator",
  },
  {
    id: "moving",
    label: "Moving & Access",
    description: "Key handover, move-in/move-out logistics.",
    routedTo: "AI triage",
  },
  {
    id: "other",
    label: "Something Else",
    description: "Anything that doesn't fit the categories above.",
    routedTo: "Buynidify coordinator",
  },
];

export const premiumTiers = [
  {
    id: "standard",
    name: "Standard",
    price: 0,
    tagline: "Included with every account",
    features: ["Property search & AI scoring", "Yield calculator"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 49,
    tagline: "For active investors",
    featured: true,
    features: [
      "Everything in Standard",
      "Early access to tenant demand",
      "Priority AI analysis",
    ],
  },
  {
    id: "vip",
    name: "VIP",
    price: 149,
    tagline: "For portfolio investors",
    features: [
      "Everything in Premium",
      "Dedicated account manager",
      "Reduced transaction fee",
    ],
  },
];

export const relocateCities = [
  "London",
  "Manchester",
  "Bristol",
  "Leeds",
  "Birmingham",
  "Edinburgh",
];

// Local service partners: the "local service partner" concept from the
// support-routing logic (maintenance, moving) made browsable on its own.
export type LocalService = {
  id: string;
  name: string;
  category: "Removals" | "Cleaning" | "Maintenance" | "Conveyancing" | "Insurance";
  city: string;
  rating: number;
  blurb: string;
};

export const localServices: LocalService[] = [
  {
    id: "ls1",
    name: "Swift & Sons Removals",
    category: "Removals",
    city: "London",
    rating: 4.8,
    blurb: "Full-service house moves, same-week availability in most postcodes.",
  },
  {
    id: "ls2",
    name: "Northern Sparkle Cleaning",
    category: "Cleaning",
    city: "Manchester",
    rating: 4.6,
    blurb: "End-of-tenancy and regular cleans, fully insured.",
  },
  {
    id: "ls3",
    name: "Clifton Property Maintenance",
    category: "Maintenance",
    city: "Bristol",
    rating: 4.7,
    blurb: "Plumbing, electrics, and general repairs, usually next-day.",
  },
  {
    id: "ls4",
    name: "Kirkgate Legal Conveyancers",
    category: "Conveyancing",
    city: "Leeds",
    rating: 4.9,
    blurb: "Residential conveyancing partner used across Buynidify purchases.",
  },
  {
    id: "ls5",
    name: "Broad St Home Insurance",
    category: "Insurance",
    city: "Birmingham",
    rating: 4.5,
    blurb: "Landlord and tenant contents insurance, quotes in minutes.",
  },
  {
    id: "ls6",
    name: "New Town Removals Co.",
    category: "Removals",
    city: "Edinburgh",
    rating: 4.7,
    blurb: "Local and long-distance moves across Scotland.",
  },
];

// Verification checklist items shown on the Verification page. Presentational
// only per PRODUCT.md, no real identity/AML/Right to Rent checks run here.
export type VerificationCheck = {
  id: string;
  label: string;
  status: "verified" | "pending" | "needs-review";
  detail: string;
};

export const investorVerificationChecks: VerificationCheck[] = [
  { id: "identity", label: "Identity", status: "verified", detail: "Government ID confirmed." },
  { id: "proof-of-funds", label: "Proof of Funds", status: "verified", detail: "Funds source confirmed." },
  { id: "aml", label: "AML Check", status: "pending", detail: "Anti-money-laundering screening in progress." },
  { id: "company", label: "Company Details", status: "needs-review", detail: "Add company registration number." },
];

export const tenantVerificationChecks: VerificationCheck[] = [
  { id: "identity", label: "Identity", status: "verified", detail: "Government ID confirmed." },
  { id: "right-to-rent", label: "Right to Rent", status: "verified", detail: "Eligibility to rent in the UK confirmed." },
  { id: "affordability", label: "Affordability", status: "pending", detail: "Income verification in progress." },
  { id: "references", label: "References", status: "needs-review", detail: "Add a landlord or employer reference." },
];
