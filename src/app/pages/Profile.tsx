import { useState } from "react";
import { useRole } from "../context/RoleContext";
import { useProfile, planLabel, type UserProfile } from "../context/ProfileContext";
import { initialsOf } from "../utils/greeting";
import Avatar from "../components/Avatar";
import { avatarFor } from "../utils/avatars";
import PlanModal from "../components/PlanModal";
import {
  investorVerificationChecks,
  tenantVerificationChecks,
  type VerificationCheck,
} from "../data/mockData";

// The account, in one place: who you are, how to reach you, where identity
// checks stand, what you pay with, and which plan you're on. Everything is
// editable where it should be and read-only where a check owns the answer.

// Pill tabs. Each one swaps the content rather than scrolling to it, so you
// only ever look at the part of the account you came for. Address rides with
// personal details because they're filled in together.
type TabId = "personal" | "verification" | "billing" | "cards";

const tabs: { id: TabId; label: string }[] = [
  { id: "personal", label: "Personal details" },
  { id: "verification", label: "Verification" },
  { id: "billing", label: "Billing and plan" },
  { id: "cards", label: "Payment methods" },
];

const roleLabel: Record<string, string> = {
  investor: "Investor",
  tenant: "Tenant",
  corporate: "Corporate",
};

const planStyles: Record<string, string> = {
  standard: "bg-brand-surface text-brand-muted",
  premium: "bg-brand-blue text-white",
  vip: "bg-brand-ink text-brand-gold",
};

const statusStyles: Record<VerificationCheck["status"], string> = {
  verified: "bg-emerald-100 text-emerald-700",
  pending: "bg-brand-gold/20 text-brand-gold-dark",
  "needs-review": "bg-red-100 text-red-600",
};

const statusLabel: Record<VerificationCheck["status"], string> = {
  verified: "Verified",
  pending: "Pending",
  "needs-review": "Needs review",
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-blue"
      />
      {hint && <span className="mt-1 block text-[11px] text-brand-muted">{hint}</span>}
    </label>
  );
}

function Card({
  id,
  title,
  description,
  action,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-brand-border bg-white p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-brand-ink">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-brand-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** The last six months of charges for the plan you're on. Generated rather
 *  than hard-coded so the history matches after you change plan. */
function recentInvoices(amount: number) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 4);
    return {
      id: `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-0${8 - i}`,
      date: `4 ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      amount,
      status: i === 0 ? "Processing" : "Paid",
    };
  });
}

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        saved
          ? "bg-emerald-100 text-emerald-700"
          : "bg-brand-blue text-white hover:bg-brand-blue-dark"
      }`}
    >
      {saved ? "Saved" : "Save changes"}
    </button>
  );
}

export default function Profile() {
  const { role } = useRole();
  const { profile, updateProfile, fullName, addCard, removeCard, setPrimaryCard } = useProfile();

  const [draft, setDraft] = useState<UserProfile>(profile);
  const [savedPersonal, setSavedPersonal] = useState(false);
  const [savedAddress, setSavedAddress] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [tab, setTab] = useState<TabId>("personal");
  const [addingCard, setAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({ brand: "Visa", last4: "", expiry: "", holder: "" });

  const checks = role === "investor" ? investorVerificationChecks : tenantVerificationChecks;
  const verifiedCount = checks.filter((c) => c.status === "verified").length;
  const kycComplete = verifiedCount === checks.length;

  function set(patch: Partial<UserProfile>) {
    setDraft((d) => ({ ...d, ...patch }));
    setSavedPersonal(false);
    setSavedAddress(false);
  }

  function savePersonal() {
    updateProfile({
      firstName: draft.firstName,
      middleName: draft.middleName,
      lastName: draft.lastName,
      dateOfBirth: draft.dateOfBirth,
      email: draft.email,
      phone: draft.phone,
      phoneAlt: draft.phoneAlt,
      occupation: draft.occupation,
    });
    setSavedPersonal(true);
    window.setTimeout(() => setSavedPersonal(false), 2000);
  }

  function saveAddress() {
    updateProfile({
      addressLine1: draft.addressLine1,
      addressLine2: draft.addressLine2,
      city: draft.city,
      postcode: draft.postcode,
      country: draft.country,
    });
    setSavedAddress(true);
    window.setTimeout(() => setSavedAddress(false), 2000);
  }

  function saveNewCard() {
    if (!newCard.last4.trim() || !newCard.expiry.trim()) return;
    addCard({
      brand: newCard.brand,
      last4: newCard.last4.slice(-4),
      expiry: newCard.expiry,
      holder: newCard.holder || fullName,
    });
    setNewCard({ brand: "Visa", last4: "", expiry: "", holder: "" });
    setAddingCard(false);
  }

  return (
    <div>
      {/* Identity header */}
      <section className="rounded-2xl border border-brand-border bg-white p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              name={fullName}
              initials={initialsOf(fullName || "?")}
              photoUrl={avatarFor(fullName)}
              size="lg"
            />
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
                {fullName}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-brand-blue-light px-2.5 py-0.5 text-[11px] font-bold text-brand-blue">
                  {role ? roleLabel[role] : "Member"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${planStyles[profile.plan]}`}
                >
                  {profile.plan === "standard" ? "Standard plan" : `${planLabel[profile.plan]} member`}
                </span>
                {kycComplete && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                    ✓ Identity verified
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-brand-muted">
                {profile.occupation} · Member since {profile.memberSince} · Account{" "}
                {profile.accountId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPlanOpen(true)}
            className="flex-shrink-0 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            {profile.plan === "vip" ? "Manage plan" : profile.plan === "premium" ? "Upgrade to VIP" : "Upgrade plan"}
          </button>
        </div>
      </section>

      <nav className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-brand-border bg-white text-brand-muted hover:border-brand-blue hover:text-brand-blue"
              }`}
            >
              {t.label}
              {t.id === "verification" && !kycComplete && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? "bg-white/20 text-white" : "bg-brand-gold/20 text-brand-gold-dark"
                  }`}
                >
                  {checks.length - verifiedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          {tab === "personal" && (
          <>
          <Card
            id="personal"
            title="Personal details"
            description="Your legal name as it appears on your identity documents."
            action={<SaveButton saved={savedPersonal} onClick={savePersonal} />}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="First name" value={draft.firstName} onChange={(v) => set({ firstName: v })} />
              <Field
                label="Middle name"
                value={draft.middleName}
                onChange={(v) => set({ middleName: v })}
                placeholder="Optional"
              />
              <Field label="Last name" value={draft.lastName} onChange={(v) => set({ lastName: v })} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Date of birth"
                type="date"
                value={draft.dateOfBirth}
                onChange={(v) => set({ dateOfBirth: v })}
              />
              <Field
                label="Occupation"
                value={draft.occupation}
                onChange={(v) => set({ occupation: v })}
              />
            </div>
            <hr className="my-5 border-brand-border" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Email address"
                type="email"
                value={draft.email}
                onChange={(v) => set({ email: v })}
                hint="Used for sign in and notifications."
              />
              <Field
                label="Phone number"
                type="tel"
                value={draft.phone}
                onChange={(v) => set({ phone: v })}
                hint="Primary contact."
              />
              <Field
                label="Second phone number"
                type="tel"
                value={draft.phoneAlt}
                onChange={(v) => set({ phoneAlt: v })}
                placeholder="Optional"
                hint="Used only if we can't reach you on the first."
              />
            </div>
            <p className="mt-4 rounded-lg bg-brand-surface p-3 text-xs text-brand-muted">
              Your email and phone numbers are never shown to other members. Introductions are
              arranged through Buynidify once both sides agree.
            </p>
          </Card>

          <Card
            id="address"
            title="Address"
            description="Your correspondence address, used on tenancy and purchase paperwork."
            action={<SaveButton saved={savedAddress} onClick={saveAddress} />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Address line 1"
                value={draft.addressLine1}
                onChange={(v) => set({ addressLine1: v })}
              />
              <Field
                label="Address line 2"
                value={draft.addressLine2}
                onChange={(v) => set({ addressLine2: v })}
                placeholder="Optional"
              />
              <Field label="Town or city" value={draft.city} onChange={(v) => set({ city: v })} />
              <Field label="Postcode" value={draft.postcode} onChange={(v) => set({ postcode: v })} />
              <Field label="Country" value={draft.country} onChange={(v) => set({ country: v })} />
            </div>
          </Card>

          </>
          )}

          {tab === "verification" && (
          <Card
            id="verification"
            title="KYC and verification"
            description="Identity, affordability and source of funds checks."
            action={
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                  kycComplete ? "bg-emerald-100 text-emerald-700" : "bg-brand-gold/20 text-brand-gold-dark"
                }`}
              >
                {kycComplete ? "Complete" : `${verifiedCount} of ${checks.length} complete`}
              </span>
            }
          >
            <ul className="divide-y divide-brand-border">
              {checks.map((check) => (
                <li key={check.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-ink">{check.label}</p>
                    <p className="text-xs text-brand-muted">{check.detail}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {check.status !== "verified" && (
                      <button
                        type="button"
                        className="rounded-lg border border-brand-border px-3 py-1 text-[11px] font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
                      >
                        {check.status === "pending" ? "Check status" : "Complete now"}
                      </button>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[check.status]}`}
                    >
                      {statusLabel[check.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg bg-brand-surface p-3 text-xs text-brand-muted">
              These checks build trust across the platform. In this demo they're presentational
              only, no real identity, affordability or AML checks run behind them yet.
            </p>
          </Card>

          )}

          {tab === "billing" && (
          <>
          <Card
            id="billing"
            title="Subscription"
            description="What you're on, what it costs, and when it renews."
            action={
              <button
                type="button"
                onClick={() => setPlanOpen(true)}
                className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
              >
                Change plan
              </button>
            }
          >
            <dl className="divide-y divide-brand-border">
              {[
                ["Plan", planLabel[profile.plan]],
                ["Status", profile.plan === "standard" ? "Free" : "Active"],
                ["Renews", profile.plan === "standard" ? "Not applicable" : profile.planRenews],
                [
                  "Amount",
                  profile.plan === "standard"
                    ? "£0.00"
                    : `£${profile.plan === "vip" ? "149" : "49"}.00 / month`,
                ],
                [
                  "Charged to",
                  profile.cards.find((c) => c.primary)
                    ? `${profile.cards.find((c) => c.primary)!.brand} ending ${profile.cards.find((c) => c.primary)!.last4}`
                    : "No card attached",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-brand-muted">{label}</dt>
                  <dd
                    className={
                      label === "Status" && profile.plan !== "standard"
                        ? "font-semibold text-emerald-600"
                        : "font-medium text-brand-ink"
                    }
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card
            title="Billing history"
            description="Receipts for everything charged to your account."
          >
            {profile.plan === "standard" ? (
              <p className="text-sm text-brand-muted">
                Nothing has been charged. The Standard plan is free.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-border text-left">
                      {["Invoice", "Date", "Amount", "Status", ""].map((h) => (
                        <th
                          key={h}
                          className="pb-2 text-[10px] font-bold uppercase tracking-wide text-brand-muted"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices(profile.plan === "vip" ? 149 : 49).map((inv) => (
                      <tr key={inv.id} className="border-b border-brand-border last:border-0">
                        <td className="py-2.5 font-mono text-xs text-brand-ink">{inv.id}</td>
                        <td className="py-2.5 text-brand-muted">{inv.date}</td>
                        <td className="py-2.5 font-medium text-brand-ink">
                          £{inv.amount.toFixed(2)}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              inv.status === "Paid"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-brand-gold/20 text-brand-gold-dark"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            type="button"
                            className="text-xs font-semibold text-brand-blue hover:underline"
                          >
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card
            title="Billing address"
            description="Where invoices are addressed. Taken from your account address."
            action={
              <a
                href="#address"
                className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
              >
                Edit address
              </a>
            }
          >
            <address className="text-sm not-italic leading-relaxed text-brand-ink">
              {fullName}
              <br />
              {profile.addressLine2 && (
                <>
                  {profile.addressLine2}
                  <br />
                </>
              )}
              {profile.addressLine1}
              <br />
              {profile.city} {profile.postcode}
              <br />
              {profile.country}
            </address>
          </Card>
          </>
          )}

          {tab === "cards" && (
          <Card
            id="cards"
            title="Payment methods"
            description="Cards attached to your account for subscriptions and platform fees."
            action={
              <button
                type="button"
                onClick={() => setAddingCard((v) => !v)}
                className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
              >
                {addingCard ? "Cancel" : "Add card"}
              </button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-brand-border bg-gradient-to-br from-brand-blue-dark to-brand-ink p-4 text-white"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-mono text-xs uppercase tracking-widest text-brand-gold">
                      {card.brand}
                    </p>
                    {card.primary && (
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="mt-4 font-mono text-base tracking-widest">•••• {card.last4}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-white/70">
                    <span className="truncate">{card.holder}</span>
                    <span>{card.expiry}</span>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-white/15 pt-3">
                    {!card.primary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryCard(card.id)}
                        className="text-[11px] font-semibold text-white/80 hover:text-white"
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeCard(card.id)}
                      className="ml-auto text-[11px] font-semibold text-white/60 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {profile.cards.length === 0 && (
                <p className="text-sm text-brand-muted">No card attached yet.</p>
              )}
            </div>

            {addingCard && (
              <div className="mt-4 rounded-xl border border-brand-border bg-brand-surface p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                      Card type
                    </span>
                    <select
                      value={newCard.brand}
                      onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-blue"
                    >
                      {["Visa", "Mastercard", "Amex"].map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </label>
                  <Field
                    label="Last 4 digits"
                    value={newCard.last4}
                    onChange={(v) => setNewCard({ ...newCard, last4: v.replace(/\D/g, "").slice(0, 4) })}
                    placeholder="4242"
                  />
                  <Field
                    label="Expiry"
                    value={newCard.expiry}
                    onChange={(v) => setNewCard({ ...newCard, expiry: v })}
                    placeholder="08/29"
                  />
                  <Field
                    label="Cardholder"
                    value={newCard.holder}
                    onChange={(v) => setNewCard({ ...newCard, holder: v })}
                    placeholder={fullName}
                  />
                </div>
                <p className="mt-3 text-[11px] text-brand-muted">
                  Demo only. Enter the last four digits, not a full card number. Nothing is sent
                  anywhere and no payment is taken.
                </p>
                <button
                  type="button"
                  onClick={saveNewCard}
                  className="mt-3 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
                >
                  Attach card
                </button>
              </div>
            )}
          </Card>
          )}
        </div>

        {/* Right rail: plan and account */}
        <aside className="flex flex-col gap-5">
          <section
            className={`rounded-2xl border p-6 ${
              profile.plan === "standard"
                ? "border-brand-border bg-white"
                : "border-transparent bg-gradient-to-br from-brand-ink to-brand-blue-dark text-white"
            }`}
          >
            <p
              className={`text-[10px] font-bold uppercase tracking-wide ${
                profile.plan === "standard" ? "text-brand-muted" : "text-white/60"
              }`}
            >
              Current plan
            </p>
            <p
              className={`mt-1 font-display text-2xl font-semibold tracking-tight ${
                profile.plan === "standard" ? "text-brand-ink" : "text-white"
              }`}
            >
              {planLabel[profile.plan]}
            </p>

            {profile.plan === "standard" ? (
              <>
                <p className="mt-1 text-sm text-brand-muted">
                  Included with every account. Upgrade for priority analysis and early access to
                  tenant demand.
                </p>
                <button
                  type="button"
                  onClick={() => setPlanOpen(true)}
                  className="mt-4 w-full rounded-lg bg-brand-cta px-4 py-2.5 text-sm font-semibold text-brand-cta-text"
                >
                  See plans
                </button>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-white/75">
                  Active. Renews {profile.planRenews}.
                </p>
                <dl className="mt-4 space-y-2 border-t border-white/15 pt-4 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-white/60">Billed</dt>
                    <dd className="font-semibold">
                      £{profile.plan === "vip" ? "149" : "49"} / month
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Payment</dt>
                    <dd className="font-semibold">
                      {profile.cards.find((c) => c.primary)?.brand ?? "No card"}{" "}
                      {profile.cards.find((c) => c.primary)?.last4 ?? ""}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => setPlanOpen(true)}
                  className="mt-4 w-full rounded-lg bg-brand-cta px-4 py-2.5 text-sm font-semibold text-brand-cta-text"
                >
                  {profile.plan === "vip" ? "Manage plan" : "Upgrade to VIP"}
                </button>
                <a
                  href="#billing"
                  className="mt-2 block w-full text-center text-[11px] font-semibold text-white/70 hover:text-white"
                >
                  Plan and payment details →
                </a>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-brand-border bg-white p-6">
            <h2 className="font-display text-base font-semibold text-brand-ink">Account</h2>
            <dl className="mt-3 space-y-2 text-xs">
              {[
                ["Account ID", profile.accountId],
                ["Role", role ? roleLabel[role] : "Member"],
                ["Member since", profile.memberSince],
                ["Verification", kycComplete ? "Complete" : `${verifiedCount} of ${checks.length}`],
                ["Cards attached", `${profile.cards.length}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-brand-muted">{label}</dt>
                  <dd className="text-right font-semibold text-brand-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-brand-border bg-white p-6">
            <h2 className="font-display text-base font-semibold text-brand-ink">Privacy</h2>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              Other members see your name, role, verification status and the details relevant to a
              let. They never see your date of birth, address, contact numbers or payment methods.
            </p>
          </section>
        </aside>
      </div>

      {planOpen && <PlanModal onClose={() => setPlanOpen(false)} />}
    </div>
  );
}
