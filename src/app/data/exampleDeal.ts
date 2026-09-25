import { agreementSteps, type Agreement, type AgreementStage } from "../context/ListingsContext";
import type { PartyProfile } from "../utils/profiles";
import { avatarFor } from "../utils/avatars";

// One concrete, fully worked example: a deal that went all the way through
// and is now a running tenancy. Everything else on the Deal Tracker is
// either empty (nobody's matched yet) or mid-pipeline, so there was nowhere
// to actually SEE the finished shape of the process. This is that, built
// from a real-looking Rightmove listing rather than another blank state.
//
// Clearly marked `isExample` wherever it's shown - it's a worked demo, not a
// deal either persona actually did, and it says so rather than pretending.

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

// Walks every step from request-sent to tenancy-active, spaced out the way a
// real purchase-to-let-out timeline would be: quick at the start, a few
// weeks for the purchase itself, then settled.
const stageDays: Record<AgreementStage, number> = {
  "request-sent": 132,
  matched: 130,
  "terms-agreed": 126,
  "agreement-signed": 119,
  "deposit-secured": 112,
  "offer-submitted": 112,
  "searches-survey": 100,
  "mortgage-finalised": 90,
  "contracts-exchanged": 80,
  completion: 75,
  "tenancy-prep": 70,
  "tenancy-active": 64,
};

const history: Agreement["history"] = agreementSteps.map((step) => ({
  stage: step.id,
  at: daysAgo(stageDays[step.id]),
  by:
    step.actor === "You"
      ? "investor"
      : step.actor === "Tenant"
        ? "tenant"
        : step.actor === "You and the tenant"
          ? "investor"
          : "buynidify",
}));

export const exampleInvestor: PartyProfile = {
  id: "example-investor",
  name: "Marcus Webb",
  initials: "MW",
  role: "Investor",
  location: "Manchester",
  memberSince: "January 2026",
  responseTime: "under an hour",
  responseRate: "97%",
  photoUrl: avatarFor("Marcus Webb"),
  verified: { idCheck: true, referencing: true, funds: true },
  about: "Buy-to-let investor focused on city-centre Manchester flats near transport links.",
  details: [
    { label: "Properties listed", value: "3" },
    { label: "Focus", value: "City-centre apartments" },
    { label: "Typical tenancy", value: "12 months" },
    { label: "Manages via", value: "Self-managed" },
    { label: "Deposit scheme", value: "Tenancy Deposit Scheme" },
    { label: "Accepts", value: "Professionals" },
  ],
};

export const exampleTenant: PartyProfile = {
  id: "example-tenant",
  name: "Priya Chandra",
  initials: "PC",
  role: "Tenant",
  location: "Manchester",
  memberSince: "January 2026",
  responseTime: "under an hour",
  responseRate: "99%",
  photoUrl: avatarFor("Priya Chandra"),
  verified: { idCheck: true, referencing: true, funds: true },
  about: "Data analyst relocating to central Manchester for work. Single professional, no pets.",
  details: [
    { label: "Occupation", value: "Data analyst" },
    { label: "Household", value: "Single professional" },
    { label: "Moving from", value: "Sheffield" },
    { label: "Budget", value: "£950/mo" },
    { label: "Tenancy wanted", value: "12 months" },
    { label: "Pets", value: "None" },
  ],
};

export const exampleDeal = {
  id: "example-embankment-exchange",
  isExample: true as const,
  title: "1 Bedroom Apartment",
  address: "Embankment Exchange, Manchester",
  city: "Manchester",
  postcode: "M3",
  price: 180000,
  monthlyRent: 950,
  beds: 1,
  propertyType: "Apartment",
  portal: "Rightmove",
  sourceUrl: "https://www.rightmove.co.uk/properties/158234219",
  imageUrl:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=60",
  investor: exampleInvestor,
  tenant: exampleTenant,
  agreement: {
    tenantId: "example-tenant",
    tenantName: exampleTenant.name,
    tenantInitials: exampleTenant.initials,
    stage: "tenancy-active" as AgreementStage,
    startedAt: daysAgo(132),
    history,
  } satisfies Agreement,
  // Not persisted, not removable, not affected by anything a real
  // investor/tenant persona does - it's a fixture, not a record.
};
