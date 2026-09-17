// Every listing and every demand entry is posted by somebody, so both sides
// can see who they'd be dealing with before connecting. Generated
// deterministically from the id so a given card always shows the same person.
//
// Deliberately no email or phone: contact happens through Buynidify, and the
// profile says so.

export type PartyRole = "Tenant" | "Investor" | "Corporate";

export type PartyProfile = {
  id: string;
  name: string;
  initials: string;
  role: PartyRole;
  location: string;
  memberSince: string;
  responseTime: string;
  responseRate: string;
  verified: { idCheck: boolean; referencing: boolean; funds: boolean };
  /** Role-specific rows shown in the panel body. */
  details: { label: string; value: string }[];
  about: string;
};

const TENANTS = [
  { name: "James Okafor", occupation: "Software engineer", household: "Couple, no pets", from: "Hackney, London" },
  { name: "Maya Kaur", occupation: "NHS doctor", household: "Single professional", from: "Leeds" },
  { name: "Adam Reid", occupation: "Architect", household: "Family of 3", from: "Bristol" },
  { name: "Daniel Pereira", occupation: "Finance analyst", household: "Two sharers", from: "Manchester" },
  { name: "Sofia Lindqvist", occupation: "UX designer", household: "Single professional", from: "Edinburgh" },
  { name: "Chloe Bennett", occupation: "Teacher", household: "Couple with baby", from: "Birmingham" },
  { name: "Tom Nguyen", occupation: "Consultant", household: "Single professional", from: "Berlin" },
  { name: "Elena Wright", occupation: "Marketing lead", household: "Couple, one cat", from: "Reading" },
];

const INVESTORS = [
  { name: "Harpreet Singh", portfolio: 4, focus: "City-centre flats" },
  { name: "Northgate Property Ltd", portfolio: 23, focus: "New-build apartments", corporate: true },
  { name: "Claire Mensah", portfolio: 2, focus: "Family houses" },
  { name: "Oliver Grant", portfolio: 7, focus: "Student and sharer lets" },
  { name: "Riverside Holdings", portfolio: 31, focus: "Mixed residential", corporate: true },
  { name: "Priya Raman", portfolio: 3, focus: "Period conversions" },
];

const MONTHS = ["January", "March", "April", "June", "September", "November"];

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function common(h: number) {
  return {
    memberSince: `${MONTHS[h % MONTHS.length]} ${2023 + (h % 3)}`,
    responseTime: ["under an hour", "a few hours", "within a day"][h % 3],
    responseRate: `${90 + (h % 10)}%`,
  };
}

export function tenantProfileFor(id: string, city: string, budget?: number, minBeds?: number): PartyProfile {
  const h = hash(id);
  const t = TENANTS[h % TENANTS.length];
  const c = common(h);
  return {
    id: `tenant-${id}`,
    name: t.name,
    initials: initialsOf(t.name),
    role: "Tenant",
    location: city,
    ...c,
    verified: { idCheck: true, referencing: h % 4 !== 0, funds: h % 3 !== 0 },
    about: `Looking for a ${minBeds ?? 2}-bedroom home in ${city}. ${t.household}, moving from ${t.from}.`,
    details: [
      { label: "Occupation", value: t.occupation },
      { label: "Household", value: t.household },
      { label: "Moving from", value: t.from },
      { label: "Budget", value: budget ? `£${budget.toLocaleString("en-GB")}/mo` : "Flexible" },
      { label: "Move-in", value: ["ASAP", "Within 1 month", "Within 2 months"][h % 3] },
      { label: "Tenancy wanted", value: ["12 months", "12-24 months", "24 months"][h % 3] },
      { label: "Pets", value: t.household.toLowerCase().includes("cat") ? "One cat" : "None" },
      { label: "Smoker", value: "No" },
    ],
  };
}

export function investorProfileFor(id: string, city: string, accepts?: string[]): PartyProfile {
  const h = hash(id);
  const inv = INVESTORS[h % INVESTORS.length];
  const c = common(h);
  return {
    id: `investor-${id}`,
    name: inv.name,
    initials: initialsOf(inv.name),
    role: inv.corporate ? "Corporate" : "Investor",
    location: city,
    ...c,
    verified: { idCheck: true, referencing: true, funds: h % 5 !== 0 },
    about: `${inv.corporate ? "Property company" : "Private landlord"} focused on ${inv.focus.toLowerCase()}, active in ${city}.`,
    details: [
      { label: "Properties listed", value: `${inv.portfolio}` },
      { label: "Focus", value: inv.focus },
      { label: "Typical tenancy", value: ["12 months", "12-24 months", "6-12 months"][h % 3] },
      { label: "Manages via", value: h % 2 ? "Letting agent" : "Self-managed" },
      { label: "Deposit scheme", value: "Tenancy Deposit Scheme" },
      {
        label: "Accepts",
        // Real choice when the investor published one, otherwise a seeded value.
        value: accepts && accepts.length > 0
          ? accepts.join(", ")
          : ["Professionals", "Professionals, families", "Professionals, students"][h % 3],
      },
    ],
  };
}
