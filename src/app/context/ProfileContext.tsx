import { createContext, useContext, type ReactNode } from "react";
import { useRole, defaultNames } from "./RoleContext";
import { usePersistedState } from "../utils/usePersistedState";

// The account record behind the Profile page: who you are, how to reach you,
// where KYC stands, what you pay with, and which plan you're on.
//
// It's persisted, because it's account data the demo should keep between
// reloads and role switches, the same way properties are.

export type Plan = "standard" | "premium" | "vip";

export const planLabel: Record<Plan, string> = {
  standard: "Standard",
  premium: "Premium",
  vip: "VIP",
};

export type PaymentCard = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  holder: string;
  primary: boolean;
};

export type UserProfile = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  phoneAlt: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  country: string;
  /** Free text, shown on the profile others see. */
  occupation: string;
  memberSince: string;
  accountId: string;
  plan: Plan;
  planRenews: string;
  cards: PaymentCard[];
};

// One record per role, not one shared template - an investor persona and a
// tenant persona are meant to look like two different people (see the note
// on defaultNames in RoleContext), so their fallback occupation, email and
// account details need to differ too. A tenant profile that defaults to
// "Property investor" as their occupation is exactly the kind of bleed this
// is meant to prevent.
const defaultProfileByRole: Record<"investor" | "tenant" | "corporate" | "guest", Omit<UserProfile, "firstName" | "middleName" | "lastName">> = {
  investor: {
    dateOfBirth: "1986-04-18",
    email: "alex.morgan@example.com",
    phone: "+44 7700 900142",
    phoneAlt: "+44 20 7946 0813",
    addressLine1: "42 Ashgrove Road",
    addressLine2: "Flat 3",
    city: "Manchester",
    postcode: "M20 3PQ",
    country: "United Kingdom",
    occupation: "Property investor",
    memberSince: "March 2024",
    accountId: "BYN-4827-1930",
    plan: "premium",
    planRenews: "4 October 2026",
    cards: [
      { id: "card-1", brand: "Visa", last4: "4242", expiry: "08/29", holder: "Alex J. Morgan", primary: true },
      { id: "card-2", brand: "Mastercard", last4: "8317", expiry: "11/27", holder: "Alex J. Morgan", primary: false },
    ],
  },
  tenant: {
    dateOfBirth: "1994-09-02",
    email: "sam.carter@example.com",
    phone: "+44 7700 900318",
    phoneAlt: "",
    addressLine1: "12 Nelson Street",
    addressLine2: "",
    city: "Bristol",
    postcode: "BS1 4QA",
    country: "United Kingdom",
    occupation: "Marketing executive",
    memberSince: "June 2025",
    accountId: "BYN-6103-4471",
    plan: "standard",
    planRenews: "12 November 2026",
    cards: [{ id: "card-1", brand: "Visa", last4: "7719", expiry: "03/28", holder: "Sam Carter", primary: true }],
  },
  corporate: {
    dateOfBirth: "1990-01-01",
    email: "hr@northgate.example.com",
    phone: "+44 20 7946 0221",
    phoneAlt: "",
    addressLine1: "Northgate House, 8 Fenwick Square",
    addressLine2: "",
    city: "Leeds",
    postcode: "LS1 5AB",
    country: "United Kingdom",
    occupation: "HR & Relocation Lead",
    memberSince: "January 2025",
    accountId: "BYN-2290-8815",
    plan: "vip",
    planRenews: "1 December 2026",
    cards: [{ id: "card-1", brand: "Mastercard", last4: "5502", expiry: "05/27", holder: "Northgate HR", primary: true }],
  },
  guest: {
    dateOfBirth: "",
    email: "",
    phone: "",
    phoneAlt: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    occupation: "",
    memberSince: "",
    accountId: "",
    plan: "standard",
    planRenews: "",
    cards: [],
  },
};

type ProfileContextValue = {
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setPlan: (plan: Plan) => void;
  addCard: (card: Omit<PaymentCard, "id" | "primary">) => void;
  removeCard: (id: string) => void;
  setPrimaryCard: (id: string) => void;
  /** Convenience: the name used for greetings and avatars. */
  fullName: string;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { role, name, setName } = useRole();

  // Keyed by role, not a single shared record - otherwise the investor
  // persona and the tenant persona (which can now be two different browser
  // tabs at once) would show and edit the exact same account details,
  // which defeats the point of testing them as two separate people.
  const roleKey = role ?? "guest";
  const roleDefaults = defaultProfileByRole[roleKey];
  // The stand-in name for this persona specifically (Alex Morgan for
  // investor, Sam Carter for tenant, Northgate HR for corporate) - not
  // always "Alex Morgan", which was the bug: every role's blank profile was
  // falling back to the investor's own name and occupation.
  const personaName = role ? defaultNames[role] : "";
  const fallbackFirst = personaName.trim().split(/\s+/)[0] ?? "";
  const fallbackLast = personaName.trim().split(/\s+/).slice(1).join(" ");

  // "-v2": browsers from earlier this session saved a profile under the
  // un-versioned key while the shared-defaults bug was still live, so that
  // stored (wrong) data would otherwise keep winning over these new
  // role-specific defaults forever - a persisted value always beats a
  // fresh default. New key name, clean slate, same reasoning as the names
  // fix in RoleContext.
  const [profile, setProfile] = usePersistedState<UserProfile>(`buynidify:profile:v2:${roleKey}`, {
    ...roleDefaults,
    // If a name was typed at login, that's the person's own name, so it wins
    // over the stand-in - otherwise fall back to this persona's own default
    // identity, never another persona's.
    firstName: name ? name.trim().split(/\s+/)[0] : fallbackFirst,
    lastName: name && name.trim().split(/\s+/).length > 1
      ? name.trim().split(/\s+/).slice(1).join(" ")
      : fallbackLast,
    middleName: name ? "" : role === "investor" ? "J." : "",
  });

  function updateProfile(patch: Partial<UserProfile>) {
    setProfile((p) => {
      const next = { ...p, ...patch };
      // Keep the greeting and avatar in step with the name on file.
      const display = [next.firstName, next.lastName].filter(Boolean).join(" ").trim();
      if (display && display !== name) setName(display);
      return next;
    });
  }

  function setPlan(plan: Plan) {
    setProfile((p) => ({ ...p, plan }));
  }

  function addCard(card: Omit<PaymentCard, "id" | "primary">) {
    setProfile((p) => ({
      ...p,
      cards: [...p.cards, { ...card, id: `card-${Date.now()}`, primary: p.cards.length === 0 }],
    }));
  }

  function removeCard(id: string) {
    setProfile((p) => {
      const cards = p.cards.filter((c) => c.id !== id);
      // Never leave the account with cards but no primary one.
      if (cards.length > 0 && !cards.some((c) => c.primary)) cards[0] = { ...cards[0], primary: true };
      return { ...p, cards };
    });
  }

  function setPrimaryCard(id: string) {
    setProfile((p) => ({
      ...p,
      cards: p.cards.map((c) => ({ ...c, primary: c.id === id })),
    }));
  }

  const fullName = [profile.firstName, profile.middleName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <ProfileContext.Provider
      value={{ profile, updateProfile, setPlan, addCard, removeCard, setPrimaryCard, fullName }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
