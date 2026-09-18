import type { MessageThread } from "../context/ListingsContext";
import type { PartyProfile } from "../utils/profiles";

// Conversations the account already has, so the inbox has something in it on
// first open. Each one is a realistic UK letting exchange at a different
// stage - first contact, questions about terms, timings, readiness to commit - so
// the page shows the range of what happens on the platform.
//
// `audience` decides who sees the thread: an investor talks to tenants, a
// tenant talks to investors.

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function tenant(
  name: string,
  initials: string,
  location: string,
  about: string,
  details: { label: string; value: string }[],
  verified: PartyProfile["verified"],
  stats: { memberSince: string; responseTime: string; responseRate: string }
): PartyProfile {
  return { id: `tenant-${initials}`, name, initials, role: "Tenant", location, about, details, verified, ...stats };
}

function investor(
  name: string,
  initials: string,
  location: string,
  about: string,
  details: { label: string; value: string }[],
  verified: PartyProfile["verified"],
  stats: { memberSince: string; responseTime: string; responseRate: string },
  corporate = false
): PartyProfile {
  return {
    id: `investor-${initials}`,
    name,
    initials,
    role: corporate ? "Corporate" : "Investor",
    location,
    about,
    details,
    verified,
    ...stats,
  };
}

export const seedThreads: (MessageThread & { audience: "investor" | "tenant" })[] = [
  // --- Investor's inbox: tenants ------------------------------------------
  {
    audience: "investor",
    counterpartyId: "seed-maya-kaur",
    counterpartyName: "Maya Kaur",
    context: "2-bed flat, Deansgate, Manchester",
    profile: tenant(
      "Maya Kaur",
      "MK",
      "Manchester",
      "NHS doctor relocating for a new post. Single professional, no pets, moving from Leeds.",
      [
        { label: "Occupation", value: "NHS doctor" },
        { label: "Household", value: "Single professional" },
        { label: "Moving from", value: "Leeds" },
        { label: "Budget", value: "£1,250/mo" },
        { label: "Move-in", value: "Within 1 month" },
        { label: "Tenancy wanted", value: "12-24 months" },
        { label: "Pets", value: "None" },
      ],
      { idCheck: true, referencing: true, funds: true },
      { memberSince: "March 2024", responseTime: "under an hour", responseRate: "98%" }
    ),
    messages: [
      {
        id: "s1-1",
        from: "them",
        body: "Hi, I saw the Deansgate flat on Buynidify. If you go ahead and buy it, I would definitely want to rent it. Is the two month timeline still realistic?",
        sentAt: hoursAgo(74),
      },
      {
        id: "s1-2",
        from: "me",
        body: "Hi Maya, that timeline still looks right. I am close to deciding, and real tenant interest is exactly what I needed to see.",
        sentAt: hoursAgo(71),
      },
      {
        id: "s1-3",
        from: "them",
        body: "Good to hear. Could I ask whether the service charge is included in the rent you published, or on top of it?",
        sentAt: hoursAgo(70),
      },
      {
        id: "s1-4",
        from: "me",
        body: "Included, so you would only be responsible for council tax and utilities.",
        sentAt: hoursAgo(68),
      },
      {
        id: "s1-5",
        from: "them",
        body: "That works for me. My referencing is already complete through Buynidify, so I can commit as soon as you are ready.",
        sentAt: hoursAgo(66),
      },
    ],
  },
  {
    audience: "investor",
    counterpartyId: "seed-adam-reid",
    counterpartyName: "Adam Reid",
    context: "3-bed house, Redland, Bristol",
    profile: tenant(
      "Adam Reid",
      "AR",
      "Bristol",
      "Architect moving within the city with his family. Family of 3, one school-age child.",
      [
        { label: "Occupation", value: "Architect" },
        { label: "Household", value: "Family of 3" },
        { label: "Moving from", value: "Bristol" },
        { label: "Budget", value: "£1,800/mo" },
        { label: "Move-in", value: "Within 2 months" },
        { label: "Tenancy wanted", value: "24 months" },
        { label: "Pets", value: "None" },
      ],
      { idCheck: true, referencing: true, funds: false },
      { memberSince: "January 2025", responseTime: "a few hours", responseRate: "94%" }
    ),
    messages: [
      {
        id: "s2-1",
        from: "them",
        body: "Hello, we're a family of three looking in Redland for the school catchment. Would you consider a longer tenancy, say two years?",
        sentAt: hoursAgo(30),
      },
      {
        id: "s2-2",
        from: "me",
        body: "Hi Adam, a two-year term is fine by me. I'd prefer it, honestly. Are you looking to move before the school term starts?",
        sentAt: hoursAgo(27),
      },
      {
        id: "s2-3",
        from: "them",
        body: "Ideally yes. One thing I should flag: my proof of funds is still being uploaded, my employer's HR is slow with the letter. Everything else is verified.",
        sentAt: hoursAgo(5),
      },
    ],
  },
  {
    audience: "investor",
    counterpartyId: "seed-elena-wright",
    counterpartyName: "Elena Wright",
    context: "1-bed apartment, Reading centre",
    profile: tenant(
      "Elena Wright",
      "EW",
      "Reading",
      "Marketing lead, couple with one cat. Commutes to London two days a week.",
      [
        { label: "Occupation", value: "Marketing lead" },
        { label: "Household", value: "Couple, one cat" },
        { label: "Moving from", value: "Reading" },
        { label: "Budget", value: "£1,100/mo" },
        { label: "Move-in", value: "ASAP" },
        { label: "Tenancy wanted", value: "12 months" },
        { label: "Pets", value: "One cat" },
      ],
      { idCheck: true, referencing: false, funds: true },
      { memberSince: "June 2025", responseTime: "within a day", responseRate: "91%" }
    ),
    messages: [
      {
        id: "s3-1",
        from: "me",
        body: "Hi Elena, I saw you're looking in central Reading. I have a one-bed coming available that might suit. Are you still searching?",
        sentAt: hoursAgo(50),
      },
      {
        id: "s3-2",
        from: "them",
        body: "We are, thank you for reaching out. The only thing is we have a cat. Your listing says pets considered, does that extend to a well-behaved indoor one?",
        sentAt: hoursAgo(46),
      },
      {
        id: "s3-3",
        from: "me",
        body: "It does. I'd ask for a slightly higher deposit within the legal cap, but a cat isn't a problem.",
        sentAt: hoursAgo(44),
      },
    ],
  },

  // --- Tenant's inbox: investors ------------------------------------------
  {
    audience: "tenant",
    counterpartyId: "seed-harpreet-singh",
    counterpartyName: "Harpreet Singh",
    context: "2-bed flat, Deansgate, Manchester",
    profile: investor(
      "Harpreet Singh",
      "HS",
      "Manchester",
      "Private landlord focused on city-centre flats, active in Manchester.",
      [
        { label: "Properties listed", value: "4" },
        { label: "Focus", value: "City-centre flats" },
        { label: "Typical tenancy", value: "12-24 months" },
        { label: "Manages via", value: "Self-managed" },
        { label: "Deposit scheme", value: "Tenancy Deposit Scheme" },
        { label: "Accepts", value: "Professionals, couples" },
      ],
      { idCheck: true, referencing: true, funds: true },
      { memberSince: "April 2023", responseTime: "under an hour", responseRate: "96%" }
    ),
    messages: [
      {
        id: "s4-1",
        from: "them",
        body: "Hi, thanks for registering interest in the Deansgate flat. It's available from the 1st, unfurnished, with a parking space included.",
        sentAt: hoursAgo(28),
      },
      {
        id: "s4-2",
        from: "me",
        body: "That's great, thank you. Is the parking space in the building itself? And would you consider a 24-month term?",
        sentAt: hoursAgo(26),
      },
      {
        id: "s4-3",
        from: "them",
        body: "It's in the secure basement, yes. 24 months works for me. I'd rather have a settled tenant than re-let every year.",
        sentAt: hoursAgo(3),
      },
    ],
  },
  {
    audience: "tenant",
    counterpartyId: "seed-northgate",
    counterpartyName: "Northgate Property Ltd",
    context: "New-build 1-bed, Birmingham",
    profile: investor(
      "Northgate Property Ltd",
      "NP",
      "Birmingham",
      "Property company managing new-build apartments across the Midlands.",
      [
        { label: "Properties listed", value: "23" },
        { label: "Focus", value: "New-build apartments" },
        { label: "Typical tenancy", value: "12 months" },
        { label: "Manages via", value: "Letting agent" },
        { label: "Deposit scheme", value: "Tenancy Deposit Scheme" },
        { label: "Accepts", value: "Professionals, sharers" },
      ],
      { idCheck: true, referencing: true, funds: true },
      { memberSince: "September 2023", responseTime: "a few hours", responseRate: "93%" },
      true
    ),
    messages: [
      {
        id: "s5-1",
        from: "me",
        body: "Hello, I'm interested in the one-bed in the Jewellery Quarter. Could you tell me what the EPC rating is?",
        sentAt: hoursAgo(96),
      },
      {
        id: "s5-2",
        from: "them",
        body: "Good afternoon. The building is rated B and the flat has a heat pump, so running costs are low. I am waiting on one more tenant response before I commit to buying.",
        sentAt: hoursAgo(93),
      },
      {
        id: "s5-3",
        from: "me",
        body: "Saturday would work. Is there any flexibility on the move-in date if my current tenancy runs to the end of the month?",
        sentAt: hoursAgo(90),
      },
      {
        id: "s5-4",
        from: "them",
        body: "We can hold it a fortnight beyond the advertised date once referencing is complete. I'll put you down for 10am Saturday.",
        sentAt: hoursAgo(88),
      },
    ],
  },
  {
    audience: "tenant",
    counterpartyId: "seed-claire-mensah",
    counterpartyName: "Claire Mensah",
    context: "3-bed house, Leeds",
    profile: investor(
      "Claire Mensah",
      "CM",
      "Leeds",
      "Private landlord focused on family houses, active in Leeds.",
      [
        { label: "Properties listed", value: "2" },
        { label: "Focus", value: "Family houses" },
        { label: "Typical tenancy", value: "12-24 months" },
        { label: "Manages via", value: "Self-managed" },
        { label: "Deposit scheme", value: "Tenancy Deposit Scheme" },
        { label: "Accepts", value: "Families, professionals" },
      ],
      { idCheck: true, referencing: true, funds: false },
      { memberSince: "November 2024", responseTime: "within a day", responseRate: "90%" }
    ),
    messages: [
      {
        id: "s6-1",
        from: "them",
        body: "Hi, I saw your requirements come through on Buynidify: a three-bed in north Leeds within your budget. Mine comes free in six weeks. Would that timing work?",
        sentAt: hoursAgo(11),
      },
    ],
  },
];
