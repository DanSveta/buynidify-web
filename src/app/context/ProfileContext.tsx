import { createContext, useContext, type ReactNode } from "react";
import { useRole } from "./RoleContext";
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

const defaultProfile: UserProfile = {
  firstName: "Alex",
  middleName: "J.",
  lastName: "Morgan",
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
    {
      id: "card-1",
      brand: "Visa",
      last4: "4242",
      expiry: "08/29",
      holder: "Alex J. Morgan",
      primary: true,
    },
    {
      id: "card-2",
      brand: "Mastercard",
      last4: "8317",
      expiry: "11/27",
      holder: "Alex J. Morgan",
      primary: false,
    },
  ],
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
  const { name, setName } = useRole();

  const [profile, setProfile] = usePersistedState<UserProfile>("buynidify:profile", {
    ...defaultProfile,
    // If a name was typed at login, that's the person's own name, so it wins
    // over the stand-in in the default record.
    firstName: name ? name.trim().split(/\s+/)[0] : defaultProfile.firstName,
    lastName: name && name.trim().split(/\s+/).length > 1
      ? name.trim().split(/\s+/).slice(1).join(" ")
      : defaultProfile.lastName,
    middleName: name ? "" : defaultProfile.middleName,
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
