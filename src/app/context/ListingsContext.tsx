import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { properties, tenantDemand as seedDemandData } from "../data/mockData";
import { usePersistedState } from "../utils/usePersistedState";
import type { Portal } from "../utils/mockFromUrl";
import {
  investorProfileFor,
  tenantProfileFor,
  type PartyProfile,
} from "../utils/profiles";
import { avatarFor } from "../utils/avatars";
import { seedThreads } from "../data/seedThreads";
import { useRole } from "./RoleContext";

// Wires the two halves of the platform together across roles, which
// previously existed as disconnected, page-local mock state:
//   - Investor lists a property (seeded, or pasted as a link) -> tenants can
//     browse it and express interest -> investor sees who's interested.
//   - Tenant wants a property (seeded demand, or pasted as a link on Search /
//     My Properties) -> investors can see it and respond -> tenant sees an
//     investor is on it.
//   - When both sides have shown interest in the same one, that's a match.
// Everything here is still mock/local-only (no backend), but it now reacts
// to real actions instead of being static per-page state that resets on
// navigation.

// Interested tenants are people, not initials - the investor needs enough to
// decide whether to talk to them.
export type TenantProfile = {
  id: string;
  name: string;
  initials: string;
  occupation: string;
  household: string;
  movingFrom: string;
  referencing: "Verified" | "In progress";
  /** This row is your own tenant persona, not a separate person. */
  isYou?: boolean;
};

const fakeTenants: Omit<TenantProfile, "id">[] = [
  { name: "James Okafor", initials: "JO", occupation: "Software engineer", household: "Couple, no pets", movingFrom: "Hackney, London", referencing: "Verified" },
  { name: "Maya Kaur", initials: "MK", occupation: "NHS doctor", household: "Single professional", movingFrom: "Leeds", referencing: "Verified" },
  { name: "Adam Reid", initials: "AR", occupation: "Architect", household: "Family of 3", movingFrom: "Bristol", referencing: "In progress" },
  { name: "Daniel Pereira", initials: "DP", occupation: "Finance analyst", household: "Two sharers", movingFrom: "Manchester", referencing: "Verified" },
  { name: "Sofia Lindqvist", initials: "SL", occupation: "UX designer", household: "Single professional", movingFrom: "Edinburgh", referencing: "Verified" },
  { name: "Chloe Bennett", initials: "CB", occupation: "Teacher", household: "Couple with baby", movingFrom: "Birmingham", referencing: "In progress" },
  { name: "Tom Nguyen", initials: "TN", occupation: "Consultant", household: "Single professional", movingFrom: "Relocating from Berlin", referencing: "Verified" },
  { name: "Elena Wright", initials: "EW", occupation: "Marketing lead", household: "Couple, one cat", movingFrom: "Reading", referencing: "Verified" },
];

// Deterministic "other people already interested" seeding, so numbers don't
// jump around on every render but still look like a real, busy platform.
function seedHash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export type InterestedTenant = TenantProfile & { daysAgo: number };

function seededInterestedTenants(id: string): InterestedTenant[] {
  const count = seedHash(id) % 4; // 0-3 other tenants already interested
  const list: InterestedTenant[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (seedHash(id + i) + i) % fakeTenants.length;
    const daysAgo = 1 + (seedHash(id + "d" + i) % 9);
    list.push({ ...fakeTenants[idx], id: `${id}-t${idx}`, daysAgo });
  }
  return list;
}

// Shown to the investor when the interest came from this browser's own tenant
// persona, which is how the demo is walked through. Named like everyone else
// on the list - real name first - with a small `isYou` flag the row can use
// to add a minimal "(you)" tag, rather than replacing the name with a
// sentence explaining itself.
function youAsTenant(tenantName: string): TenantProfile & { isYou: true } {
  return {
    id: "you",
    name: tenantName,
    initials: tenantName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase(),
    occupation: "Buynidify tenant",
    household: "-",
    movingFrom: "-",
    referencing: "Verified",
    isYou: true,
  };
}

// Buynidify's cut: the investor is paid their asking rent, the tenant pays
// that plus a markup, and the platform keeps the difference. Shown openly on
// every marketplace card the way the live product does it.
export const TENANT_MARKUP = 0.04;

export function tenantPays(investorRent: number): number {
  return Math.round(investorRent * (1 + TENANT_MARKUP));
}

export type InvestorListing = {
  id: string;
  source: "seed" | "imported";
  url?: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  type: string;
  /** Terms set when the investor publishes to tenants. */
  monthlyRent?: number;
  minTenancy?: string;
  availableFrom?: string;
  portal?: string;
  notes?: string;
  accepts?: string[];
  /** The listing's own share image, referenced from the portal. */
  imageUrl?: string;
};

export type TenantDemandEntry = {
  id: string;
  source: "seed" | "imported";
  url?: string;
  city: string;
  propertyType: string;
  notes: string;
  minBeds: number;
  addedDaysAgo: number;
  seedInterestedTenants: number; // pre-existing count, only meaningful for seed entries
  targetRentPerMonth?: number; // seed entries (legacy rent-demand content)
  targetPrice?: number; // imported entries (sale, matches the rest of the app)
};

export type Message = {
  id: string;
  /** Legacy, kept for old saved data. Superseded by senderRole below, which
   *  is what rendering and unread state actually use. */
  from: "me" | "them";
  /** Which persona actually wrote this. This, not `from`, decides which side
   *  of the conversation a message renders on: `from` was fixed at the
   *  moment it was sent and never rechecked, so a message you sent as
   *  investor still read as "me" after switching to your tenant persona -
   *  the wrong side of the bubble and never counted as unread. */
  senderRole?: "investor" | "tenant";
  body: string;
  sentAt: string;
};

export type MessageThread = {
  counterpartyId: string;
  counterpartyName: string;
  context: string;
  messages: Message[];
  /** Which side of the platform this conversation belongs to. Absent on
   *  threads you started yourself - those always show. */
  audience?: "investor" | "tenant";
  /** Snapshot of who you're talking to, captured when the conversation
   *  starts, so the Messages page can show their profile without having to
   *  guess who they were. Optional: threads from before this existed fall
   *  back to a minimal profile. */
  profile?: PartyProfile;
  /** Both ends of this conversation are you, playing two personas - a
   *  listing you posted as investor, say, that your own tenant persona
   *  expressed interest in. A snapshotted name/profile is wrong here the
   *  moment you switch which persona is looking: the Messages page instead
   *  recomputes who "the other side" is live, from whichever persona you
   *  are NOT currently signed in as, so it's always right regardless of
   *  which role opens the conversation. */
  selfDealing?: boolean;
};

function otherRole(r: "investor" | "tenant"): "investor" | "tenant" {
  return r === "investor" ? "tenant" : "investor";
}

/** Fills in `senderRole` for any message that doesn't already have one, so
 *  rendering and unread state never have to fall back to the old, direction-
 *  blind `from` field except for genuinely old data with no `audience`
 *  either - a handful of conversations from before this existed. */
function normalizeThreadSenders(thread: MessageThread): MessageThread {
  if (!thread.audience) return thread;
  return {
    ...thread,
    messages: thread.messages.map((m) =>
      m.senderRole
        ? m
        : { ...m, senderRole: m.from === "me" ? thread.audience : otherRole(thread.audience!) }
    ),
  };
}

export type MatchEntry = {
  id: string;
  propertyAddress: string;
  city: string;
  investorLabel: string;
  tenantLabel: string;
};

/** One approach from one side to the other, and what became of it.
 *
 *  Interest used to be two bare lists of ids, which meant the app knew a
 *  tenant was interested but nothing else: not when, not whether the investor
 *  had answered, not whether anyone had chased it. So a tenant pressed
 *  "Express interest" and the trail went cold.
 *
 *  A connection starts when one side reaches out. It becomes a mutual match
 *  when the other side accepts, because both have then committed: the tenant
 *  by registering interest, the investor by agreeing to proceed. */
export type ConnectionRecord = {
  /** The listing id, or the demand id. */
  id: string;
  kind: "listing" | "demand";
  /** Who reached out. Tenants approach listings, investors approach demand. */
  by: "tenant" | "investor";
  at: string;
  nudges: number;
  lastNudgeAt?: string;
  /** The other side said yes. This is what makes it a mutual match. */
  accepted: boolean;
  acceptedAt?: string;
};

export type ConnectionStatus = "sent" | "nudged" | "matched";

export function statusOfConnection(c: ConnectionRecord): ConnectionStatus {
  if (c.accepted) return "matched";
  return c.nudges > 0 ? "nudged" : "sent";
}

export function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function agoLabel(iso: string): string {
  const days = daysSince(iso);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

// The paste-a-link cards. These live here rather than inside the importer
// component so the same set shows on Search and My Properties, and so they
// persist across a reload or a role switch.
export type InvestorAnalysis = {
  kind: "investor";
  summary: string;
  monthlyRent: number;
  grossYield: number;
  netYield: number;
  locationScore: number;
  rentalDemand: string;
  timeToLet: string;
  tenantProfile: string;
  positives: string[];
  consider: string[];
  suggestions: string[];
};

export type BuyerAnalysis = {
  kind: "buyer";
  summary: string;
  deposit: number;
  upfrontCosts: number;
  commuteScore: number;
  amenitiesScore: number;
  valueForMoney: string;
  positives: string[];
  consider: string[];
  suggestions: string[];
};

export type Analysis = InvestorAnalysis | BuyerAnalysis;

export type PublishDetails = {
  rent: number;
  availableFrom: string;
  minTenancy: string;
  notes: string;
  /** Who the investor is happy to let to - chosen at publish time. */
  accepts: string[];
};

/** The shared journey from PRODUCT.md section 14. The investor does NOT own
 *  the property yet: the tenant's commitment deposit is what gives them the
 *  confidence to buy it. That is why there are no viewings anywhere in this
 *  flow, and why the middle of it is run by the Buynidify team rather than by
 *  the two parties talking directly.
 *
 *  `actor` is who the step is waiting on, so the UI can say whether you're
 *  being asked to do something or simply being kept informed. */
export const agreementSteps = [
  {
    id: "request-sent",
    label: "Request sent",
    detail: "Buynidify is contacting the tenant to confirm they want to proceed.",
    actor: "Buynidify",
  },
  {
    id: "matched",
    label: "Matched",
    detail: "The tenant confirmed. You are both committed to exploring this property.",
    actor: "Buynidify",
  },
  {
    id: "terms-agreed",
    label: "Terms agreed",
    detail: "Rent, availability and tenancy length agreed between both sides.",
    actor: "Buynidify",
  },
  {
    id: "agreement-signed",
    label: "Agreement signed",
    detail: "Pre-purchase agreement signed. It sets out what happens if either side pulls out.",
    actor: "You and the tenant",
  },
  {
    id: "deposit-secured",
    label: "Deposit secured",
    detail: "The tenant's commitment deposit is received and protected. You can buy with confidence.",
    actor: "Tenant",
  },
  {
    id: "purchase",
    label: "Purchase in progress",
    detail: "You buy the property. Buynidify coordinates with your solicitor and the seller's agent.",
    actor: "You",
  },
  {
    id: "tenancy-prep",
    label: "Tenancy preparation",
    detail: "Right to Rent, referencing, tenancy documents and move-in arrangements.",
    actor: "Buynidify",
  },
  {
    id: "tenancy-active",
    label: "Lease signed, tenant moved in",
    detail: "The tenancy has started and rent is being collected.",
    actor: "Done",
  },
] as const;

export type AgreementStage = (typeof agreementSteps)[number]["id"];

/** Who actually did it, for the history log - "buynidify" covers every step
 *  the platform team handles rather than either party. */
export type AgreementActor = "investor" | "tenant" | "buynidify";

export type Agreement = {
  tenantId: string;
  tenantName: string;
  tenantInitials: string;
  stage: AgreementStage;
  startedAt: string;
  /** One entry per stage reached, so the timeline can show real dates and
   *  who moved it forward instead of just the current position. */
  history?: { stage: AgreementStage; at: string; by: AgreementActor }[];
};

/** Whose action a step is waiting on, from the CURRENT viewer's side - not
 *  from the data's fixed "You"-means-investor wording, which only reads
 *  correctly for an investor looking at their own property. A tenant looking
 *  at the same step needs "You" to mean tenant instead. */
export function actorForViewer(
  actor: (typeof agreementSteps)[number]["actor"],
  viewerRole: "investor" | "tenant"
): "you" | "them" | "both" | "buynidify" | "done" {
  if (actor === "Buynidify") return "buynidify";
  if (actor === "Done") return "done";
  if (actor === "You and the tenant") return "both";
  if (actor === "You") return viewerRole === "investor" ? "you" : "them";
  // "Tenant"
  return viewerRole === "tenant" ? "you" : "them";
}

function stepIndex(stage: AgreementStage): number {
  return agreementSteps.findIndex((s) => s.id === stage);
}

export type ImportedProperty = {
  id: string;
  /** Which side pasted it - an investor's link is stock, a tenant's is demand.
   *  "guest" means it was added by someone who hasn't registered yet: they can
   *  analyse it, but it doesn't reach the marketplace until they have an
   *  account and choose a side. */
  owner: "investor" | "tenant" | "guest";
  url: string;
  portal: Portal;
  title: string;
  location: string;
  price: number;
  beds: number;
  type: string;
  analysis: Analysis | null;
  showAnalysis: boolean;
  published: PublishDetails | null;
  /** True when the details were read off the real listing rather than
   *  generated from the URL. */
  sourced?: boolean;
  /** Why we fell back, when we did. */
  sourceNote?: string;
  baths?: number;
  postcode?: string;
  /** The agent marketing it, from the listing. */
  agent?: string;
  /** The listing's own share image, referenced by URL, never copied. */
  imageUrl?: string;
  /** Set when a tenant has been chosen. */
  agreement?: Agreement | null;
};

const listingPortals = [
  { name: "Rightmove", url: "https://www.rightmove.co.uk/properties/" },
  { name: "Zoopla", url: "https://www.zoopla.co.uk/for-sale/details/" },
  { name: "OnTheMarket", url: "https://www.onthemarket.com/details/" },
];

const seedInvestorListings: InvestorListing[] = properties
  .filter((p) => p.ownerListed)
  .map((p, i) => ({
    id: p.id,
    source: "seed",
    // Every card names its source - seeded listings had neither portal nor
    // url, so only imported ones were showing it.
    portal: listingPortals[i % listingPortals.length].name,
    url: `${listingPortals[i % listingPortals.length].url}${81000000 + i * 211}/`,
    address: p.address,
    city: p.city,
    price: p.price,
    beds: p.beds,
    type: p.type,
    // Seeded listings get a plausible rent (~5% gross) so they carry the
    // same rent/markup detail as anything published in-session.
    monthlyRent: Math.round((p.price * 0.05) / 12 / 5) * 5,
    minTenancy: "12 months",
  }));

const seedPortals = [
  { name: "Rightmove", url: "https://www.rightmove.co.uk/properties/" },
  { name: "Zoopla", url: "https://www.zoopla.co.uk/for-sale/details/" },
  { name: "OnTheMarket", url: "https://www.onthemarket.com/details/" },
];

const seedTenantDemand: TenantDemandEntry[] = seedDemandData.map((d, i) => ({
  id: d.id,
  source: "seed",
  // Seeded demand came from a portal too - without this the card had no
  // source name and no View listing link.
  url: `${seedPortals[i % seedPortals.length].url}${70000000 + i * 137}/`,
  city: d.city,
  propertyType: d.propertyType,
  notes: d.notes,
  minBeds: d.minBeds,
  addedDaysAgo: d.addedDaysAgo,
  seedInterestedTenants: d.interestedTenants,
  targetRentPerMonth: d.targetRentPerMonth,
  // The property is still for sale, so an investor needs its asking price to
  // judge the request. Derived from the rent at a plausible yield (4.8-6.4%)
  // so the two numbers always agree with each other.
  targetPrice: d.targetRentPerMonth
    ? Math.round((d.targetRentPerMonth * 12) / (0.048 + (seedHash(d.id) % 17) / 1000) / 5000) * 5000
    : undefined,
}));

type ListingsContextValue = {
  investorListings: InvestorListing[];
  tenantDemand: TenantDemandEntry[];
  interestedTenantsFor: (listingId: string) => InterestedTenant[];
  hasExpressedInterest: (listingId: string) => boolean;
  expressInterestInListing: (id: string) => void;
  hasInvestorResponded: (demandId: string) => boolean;
  respondToDemand: (id: string) => void;
  /** Every approach either side has made, with its status. */
  connections: ConnectionRecord[];
  connectionFor: (id: string) => ConnectionRecord | undefined;
  /** Chase a side that hasn't answered. A seeded counterparty answers on the
   *  first nudge, so the loop can be demonstrated without two real accounts. */
  nudgeConnection: (id: string) => void;
  /** Say yes to an approach. This is what creates a mutual match. */
  acceptConnection: (id: string) => void;
  withdrawConnection: (id: string) => void;
  // Messaging between the two sides.
  threads: MessageThread[];
  threadFor: (counterpartyId: string) => MessageThread | undefined;
  /** A thread is unread while the latest message came from the other side and
   *  you haven't opened it. Keyed on that message, so a new reply to a
   *  conversation you'd already read makes it unread again. */
  isThreadUnread: (thread: MessageThread) => boolean;
  markThreadRead: (thread: MessageThread) => void;
  unreadThreadCount: number;
  sendMessage: (
    counterparty: {
      id: string;
      name: string;
      context?: string;
      profile?: PartyProfile;
      audience?: "investor" | "tenant";
      selfDealing?: boolean;
    },
    body: string
  ) => void;
  matches: MatchEntry[];
  // Paste-a-link cards, shared across pages and persisted.
  importedProperties: ImportedProperty[];
  addImportedProperty: (property: ImportedProperty) => void;
  updateImportedProperty: (id: string, patch: Partial<ImportedProperty>) => void;
  removeImportedProperty: (id: string) => void;
  claimGuestProperties: (owner: "investor" | "tenant") => void;
  /** Moves a matched deal on to its next stage. */
  advanceAgreement: (propertyId: string, by: AgreementActor) => void;
};

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const { role, namesByRole } = useRole();
  // All persisted, so a property added as an investor is still there after
  // signing out and back in as a tenant. Ids are kept as arrays because Sets
  // don't survive JSON.
  const [connections, setConnections] = usePersistedState<ConnectionRecord[]>(
    "buynidify:connections",
    []
  );
  // The two id-only lists this replaced. Kept so a browser with data from an
  // earlier build doesn't lose the interest it had already registered.
  const [legacyInterest, setLegacyInterest] = usePersistedState<string[]>(
    "buynidify:tenant-interest",
    []
  );
  const [legacyResponses, setLegacyResponses] = usePersistedState<string[]>(
    "buynidify:investor-responses",
    []
  );
  const [importedProperties, setImportedProperties] = usePersistedState<ImportedProperty[]>(
    "buynidify:imported-properties",
    []
  );
  const [storedThreads, setThreads] = usePersistedState<MessageThread[]>("buynidify:threads", []);
  // Deliberately NOT persisted. Read state lives for one page load only, so
  // every refresh puts the unread messages back for the next demo run.
  // Property data is the thing that needs to survive a reload, not this.
  const [readThreadKeys, setReadThreadKeys] = useState<string[]>([]);

  useEffect(() => {
    // Clear the key an earlier version wrote, so a browser that already saved
    // read state doesn't stay permanently caught up.
    try {
      window.localStorage.removeItem("buynidify:read-threads");
    } catch {
      // Storage blocked; nothing to clean up.
    }
  }, []);

  // Seeded conversations are merged in rather than written to storage, so they
  // appear for someone who already has saved threads, and a seed that's been
  // replied to (now in storage) isn't shown twice. Threads are then filtered
  // to the side of the platform you're signed in as.
  const threads = useMemo(() => {
    const missing = seedThreads.filter(
      (s) => !storedThreads.some((t) => t.counterpartyId === s.counterpartyId)
    );
    return [...storedThreads, ...missing]
      .filter((t) => !t.audience || !role || t.audience === role)
      .map((t) => normalizeThreadSenders(t));
  }, [storedThreads, role]);

  // Anything persisted by an earlier build can be missing fields added since.
  // Normalising on read means a schema change never crashes the app for
  // someone who already has data in localStorage - they just see the default.
  const safeImportedProperties = useMemo(
    () =>
      importedProperties.map((p) =>
        p.published && !p.published.accepts
          ? { ...p, published: { ...p.published, accepts: [] } }
          : p
      ),
    [importedProperties]
  );

  // Carry the old id lists over once, then empty them.
  useEffect(() => {
    if (legacyInterest.length === 0 && legacyResponses.length === 0) return;
    const now = new Date().toISOString();
    setConnections((list) => {
      const have = new Set(list.map((c) => c.id));
      return [
        ...list,
        ...legacyInterest
          .filter((id) => !have.has(id))
          .map((id) => ({
            id,
            kind: "listing" as const,
            by: "tenant" as const,
            at: now,
            nudges: 0,
            accepted: false,
          })),
        ...legacyResponses
          .filter((id) => !have.has(id))
          .map((id) => ({
            id,
            kind: "demand" as const,
            by: "investor" as const,
            at: now,
            nudges: 0,
            accepted: false,
          })),
      ];
    });
    setLegacyInterest([]);
    setLegacyResponses([]);
  }, [legacyInterest, legacyResponses, setConnections, setLegacyInterest, setLegacyResponses]);

  const tenantInterestIds = useMemo(
    () => new Set(connections.filter((c) => c.kind === "listing").map((c) => c.id)),
    [connections]
  );
  const investorResponseIds = useMemo(
    () => new Set(connections.filter((c) => c.kind === "demand").map((c) => c.id)),
    [connections]
  );

  // Derived, not stored. A property used to be written twice - once as an
  // imported link and once as a marketplace listing - and the two copies could
  // drift, which is how a published property could sit in My Properties while
  // never appearing on Platform listings. Now there is one record and the
  // marketplace is a view of it.
  const investorListings = useMemo<InvestorListing[]>(
    () => [
      ...safeImportedProperties
        .filter((p) => p.owner === "investor")
        .map((p) => ({
          id: p.id,
          source: "imported" as const,
          url: p.url,
          address: p.title,
          city: p.location,
          price: p.price,
          beds: p.beds,
          type: p.type,
          portal: p.portal,
          imageUrl: p.imageUrl,
          monthlyRent: p.published?.rent,
          minTenancy: p.published?.minTenancy,
          availableFrom: p.published?.availableFrom,
          notes: p.published?.notes,
          accepts: p.published?.accepts,
        })),
      ...seedInvestorListings,
    ],
    [safeImportedProperties]
  );

  const tenantDemand = useMemo<TenantDemandEntry[]>(
    () => [
      ...safeImportedProperties
        .filter((p) => p.owner === "tenant")
        .map((p) => ({
          id: p.id,
          source: "imported" as const,
          url: p.url,
          city: p.location,
          propertyType: p.type,
          notes: p.published?.notes || `Found via a pasted ${p.portal} link.`,
          minBeds: p.beds,
          addedDaysAgo: 0,
          seedInterestedTenants: 0,
          targetPrice: p.price,
        })),
      ...seedTenantDemand,
    ],
    [safeImportedProperties]
  );

  function interestedTenantsFor(listingId: string): InterestedTenant[] {
    const seeded = seededInterestedTenants(listingId);
    return tenantInterestIds.has(listingId)
      ? [...seeded, { ...youAsTenant(namesByRole.tenant), daysAgo: 0 }]
      : seeded;
  }

  function hasExpressedInterest(listingId: string) {
    return tenantInterestIds.has(listingId);
  }

  function openConnection(id: string, kind: "listing" | "demand", by: "tenant" | "investor") {
    setConnections((list) =>
      list.some((c) => c.id === id)
        ? list
        : [
            ...list,
            { id, kind, by, at: new Date().toISOString(), nudges: 0, accepted: false },
          ]
    );
  }

  function expressInterestInListing(id: string) {
    openConnection(id, "listing", "tenant");
  }

  function hasInvestorResponded(demandId: string) {
    return investorResponseIds.has(demandId);
  }

  function respondToDemand(id: string) {
    openConnection(id, "demand", "investor");
  }

  function connectionFor(id: string) {
    return connections.find((c) => c.id === id);
  }

  function patchConnection(id: string, patch: Partial<ConnectionRecord>) {
    setConnections((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function acceptConnection(id: string) {
    patchConnection(id, { accepted: true, acceptedAt: new Date().toISOString() });
  }

  function withdrawConnection(id: string) {
    setConnections((list) => list.filter((c) => c.id !== id));
  }

  /** Chasing someone who hasn't replied.
   *
   *  A seeded counterparty is not a real account, so nobody is there to press
   *  accept. Rather than leaving the chain dead, they answer on the first
   *  nudge: the connection becomes a match and a reply lands in Messages. Your
   *  own properties are left alone, because there you are the other side and
   *  accepting is something you do yourself. */
  function nudgeConnection(id: string) {
    const connection = connections.find((c) => c.id === id);
    if (!connection) return;
    patchConnection(id, {
      nudges: connection.nudges + 1,
      lastNudgeAt: new Date().toISOString(),
    });

    if (connection.accepted) return;
    const listing = investorListings.find((l) => l.id === id);
    const demand = tenantDemand.find((d) => d.id === id);
    const seeded =
      connection.kind === "listing" ? listing?.source === "seed" : demand?.source === "seed";
    if (!seeded) return;

    patchConnection(id, { accepted: true, acceptedAt: new Date().toISOString() });

    if (connection.kind === "listing" && listing) {
      const profile = investorProfileFor(listing.id, listing.city, listing.accepts);
      // A seeded investor replying to a nudge is a real (if fictional) other
      // party, not you - this belongs only in the tenant's inbox, the side
      // that actually did the nudging.
      receiveMessage(
        {
          id: `investor-${listing.id}`,
          name: profile.name,
          context: `${listing.address}, ${listing.city}`,
          profile,
          audience: "tenant",
        },
        `Thanks for the nudge. Yes, I'd like to go ahead on ${listing.address}. Buynidify will be in touch to agree the terms and take it from there.`,
        "investor"
      );
    }
    if (connection.kind === "demand" && demand) {
      const profile = tenantProfileFor(
        demand.id,
        demand.city,
        demand.targetRentPerMonth,
        demand.minBeds
      );
      receiveMessage(
        {
          id: `tenant-${demand.id}`,
          name: profile.name,
          context: `${demand.minBeds} bedroom ${demand.propertyType} wanted in ${demand.city}`,
          profile,
          audience: "investor",
        },
        "Thanks for following up. I'm still looking and I'd be glad for you to take this one forward. Happy for Buynidify to arrange the next step.",
        "tenant"
      );
    }
  }

  function addImportedProperty(property: ImportedProperty) {
    setImportedProperties((list) => [property, ...list]);
  }

  function updateImportedProperty(id: string, patch: Partial<ImportedProperty>) {
    setImportedProperties((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  /** Registering claims everything you added while browsing as a guest. */
  function claimGuestProperties(owner: "investor" | "tenant") {
    setImportedProperties((list) =>
      list.map((p) => (p.owner === "guest" ? { ...p, owner } : p))
    );
  }

  function removeImportedProperty(id: string) {
    // One record, so retracting a link retracts it everywhere.
    setImportedProperties((list) => list.filter((p) => p.id !== id));
  }

  /** Moves a deal on to its next stage, logs who did it, and drops a line
   *  into the conversation about it so Messages narrates the deal instead of
   *  only the tracker showing it. Paying the deposit also starts the
   *  purchase in the same action - once the deposit is secured the purchase
   *  IS under way, there's no separate step for the investor to press. */
  function advanceAgreement(propertyId: string, by: AgreementActor) {
    const property = safeImportedProperties.find((p) => p.id === propertyId);
    const agreement = property?.agreement;
    if (!property || !agreement) return;

    const current = stepIndex(agreement.stage);
    const next = agreementSteps[current + 1];
    if (!next) return;

    const now = new Date().toISOString();
    const history = [...(agreement.history ?? []), { stage: next.id, at: now, by }];

    // Deposit secured cascades straight into "purchase in progress" - that's
    // not a second decision, it's the same fact stated the other way round.
    const skipToPurchase = next.id === "deposit-secured";
    const finalStage = skipToPurchase ? agreementSteps[current + 2] : next;
    if (skipToPurchase && finalStage) {
      history.push({ stage: finalStage.id, at: now, by: "buynidify" });
    }

    updateImportedProperty(propertyId, {
      agreement: { ...agreement, stage: finalStage?.id ?? next.id, history },
    });

    // Thread id follows the property, the same way it does everywhere else -
    // one conversation per property, correct on both sides via senderRole.
    const threadId = property.owner === "investor" ? `investor-${property.id}` : `tenant-${property.id}`;
    const senderRole: "investor" | "tenant" = by === "buynidify" ? "investor" : by;
    // The tenant on this deal is either you (the browser's own tenant
    // persona, walking the whole demo end to end) or a fake interested
    // tenant picked from the list - only in the first case should the
    // narration land in the tenant inbox too, since there's no real second
    // account on the other end otherwise.
    const selfDealing = agreement.tenantId === "you";
    const finalLabel = (finalStage ?? next).label;
    const finalDetail = (finalStage ?? next).detail;
    const line = skipToPurchase
      ? `🎉 Deposit secured and protected — purchase is now in progress. Buynidify is coordinating with the solicitor and the seller's agent from here.`
      : by === "buynidify"
        ? `Buynidify update: "${finalLabel}" - ${finalDetail}`
        : `${next.label} ✓ — ${next.detail}`;
    // Only used the first time this thread gets created (a name/property
    // title mixed up here is how a conversation ended up with a property's
    // title sitting where a person's name should be, the first time
    // Buynidify posted into a thread nobody had opened yet).
    receiveMessage(
      {
        id: threadId,
        name: agreement.tenantName,
        context: property.title,
        profile: selfDealing
          ? undefined
          : {
              id: `tenant-${agreement.tenantId}`,
              name: agreement.tenantName,
              initials: agreement.tenantInitials,
              role: "Tenant",
              location: "",
              memberSince: "",
              responseTime: "",
              responseRate: "",
              photoUrl: avatarFor(agreement.tenantName),
              verified: { idCheck: true, referencing: true, funds: true },
              about: "",
              details: [],
            },
        audience: selfDealing ? undefined : "investor",
        selfDealing,
      },
      line,
      senderRole
    );
  }

  function threadFor(counterpartyId: string) {
    return threads.find((t) => t.counterpartyId === counterpartyId);
  }

  function threadKey(thread: MessageThread) {
    const last = thread.messages[thread.messages.length - 1];
    return `${thread.counterpartyId}:${last?.id ?? ""}`;
  }

  function isThreadUnread(thread: MessageThread) {
    const last = thread.messages[thread.messages.length - 1];
    if (!last || readThreadKeys.includes(threadKey(thread))) return false;
    // Unread means "the last word wasn't yours", checked against whichever
    // persona you're currently signed in as - not against a direction that
    // was fixed the moment the message was sent.
    if (last.senderRole) return last.senderRole !== role;
    return last.from === "them";
  }

  function markThreadRead(thread: MessageThread) {
    const key = threadKey(thread);
    setReadThreadKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }

  const unreadThreadCount = threads.filter(isThreadUnread).length;

  function sendMessage(
    counterparty: {
      id: string;
      name: string;
      context?: string;
      profile?: PartyProfile;
      /** Only used the first time this thread is created. Set this when the
       *  other end is a real, separate person (seeded or otherwise) - so the
       *  thread only ever shows up in the role that's actually a party to
       *  it. Leave it out for a self-dealing thread (both ends are you), so
       *  it shows correctly from either persona. */
      audience?: "investor" | "tenant";
      /** Only used the first time this thread is created - see MessageThread. */
      selfDealing?: boolean;
    },
    body: string
  ) {
    const text = body.trim();
    if (!text) return;
    // Which persona is actually typing this, right now - not fixed to
    // whichever side started the thread.
    const senderRole = role === "investor" || role === "tenant" ? role : undefined;
    setThreads((list) => {
      const existing = list.find((t) => t.counterpartyId === counterparty.id);
      const message = {
        id: `m-${Date.now()}`,
        from: "me" as const,
        senderRole,
        body: text,
        sentAt: new Date().toISOString(),
      };
      if (existing) {
        return list.map((t) =>
          t.counterpartyId === counterparty.id
            ? { ...t, messages: [...t.messages, message], profile: t.profile ?? counterparty.profile }
            : t
        );
      }
      // Replying to a seeded conversation: move it into storage with its
      // history intact rather than starting an empty thread alongside it.
      const seed = seedThreads.find((s) => s.counterpartyId === counterparty.id);
      if (seed) {
        return [{ ...seed, messages: [...seed.messages, message] }, ...list];
      }
      return [
        {
          counterpartyId: counterparty.id,
          counterpartyName: counterparty.name,
          context: counterparty.context ?? "",
          messages: [message],
          profile: counterparty.profile,
          audience: counterparty.audience,
          selfDealing: counterparty.selfDealing,
        },
        ...list,
      ];
    });
  }

  /** A message arriving from the other side. Same store as sendMessage, so a
   *  simulated reply shows up in Messages and counts as unread. `senderRole`
   *  is whichever persona is speaking - the investor replying to a tenant's
   *  nudge, or the tenant replying to an investor's. */
  function receiveMessage(
    counterparty: {
      id: string;
      name: string;
      context?: string;
      profile?: PartyProfile;
      audience?: "investor" | "tenant";
      selfDealing?: boolean;
    },
    body: string,
    senderRole: "investor" | "tenant"
  ) {
    setThreads((list) => {
      const message = {
        id: `m-${Date.now()}-in`,
        from: "them" as const,
        senderRole,
        body,
        sentAt: new Date().toISOString(),
      };
      const existing = list.find((t) => t.counterpartyId === counterparty.id);
      if (existing) {
        return list.map((t) =>
          t.counterpartyId === counterparty.id
            ? { ...t, messages: [...t.messages, message], profile: t.profile ?? counterparty.profile }
            : t
        );
      }
      const seed = seedThreads.find((s) => s.counterpartyId === counterparty.id);
      if (seed) {
        return [{ ...seed, messages: [...seed.messages, message] }, ...list];
      }
      return [
        {
          counterpartyId: counterparty.id,
          counterpartyName: counterparty.name,
          context: counterparty.context ?? "",
          audience: counterparty.audience,
          messages: [message],
          profile: counterparty.profile,
          selfDealing: counterparty.selfDealing,
        },
        ...list,
      ];
    });
  }

  // A match is not "someone showed interest", it is both sides agreeing. The
  // tenant commits by registering interest, the investor commits by accepting,
  // and only then does it belong here.
  const matches = useMemo<MatchEntry[]>(() => {
    const acceptedIds = new Set(connections.filter((c) => c.accepted).map((c) => c.id));
    const fromListings = investorListings
      .filter((l) => acceptedIds.has(l.id))
      .map((l) => ({
        id: `match-listing-${l.id}`,
        propertyAddress: l.address,
        city: l.city,
        investorLabel: "Investor",
        tenantLabel: "You",
      }));
    const fromDemand = tenantDemand
      .filter((d) => acceptedIds.has(d.id))
      .map((d) => ({
        id: `match-demand-${d.id}`,
        propertyAddress: `${d.propertyType} in ${d.city}`,
        city: d.city,
        investorLabel: "You",
        tenantLabel: d.source === "seed" ? seedDemandData.find((sd) => sd.id === d.id)?.tenantInitials ?? "Tenant" : "You",
      }));
    return [...fromListings, ...fromDemand];
  }, [investorListings, tenantDemand, connections]);

  return (
    <ListingsContext.Provider
      value={{
        investorListings,
        tenantDemand,
        interestedTenantsFor,
        hasExpressedInterest,
        expressInterestInListing,
        hasInvestorResponded,
        respondToDemand,
        connections,
        connectionFor,
        nudgeConnection,
        acceptConnection,
        withdrawConnection,
        threads,
        threadFor,
        isThreadUnread,
        markThreadRead,
        unreadThreadCount,
        sendMessage,
        matches,
        importedProperties: safeImportedProperties,
        addImportedProperty,
        updateImportedProperty,
        removeImportedProperty,
        claimGuestProperties,
        advanceAgreement,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within a ListingsProvider");
  return ctx;
}
