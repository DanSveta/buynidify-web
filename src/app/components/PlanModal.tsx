import { useState } from "react";
import { useRole } from "../context/RoleContext";
import { useProfile, planLabel, type Plan } from "../context/ProfileContext";
import { premiumTiers } from "../data/mockData";

// Plans open in place, over whatever you were doing, instead of sending you
// to a separate Pricing page and losing your context. Two steps: compare, then
// confirm against the card on file.

const order: Plan[] = ["standard", "premium", "vip"];

export default function PlanModal({ onClose }: { onClose: () => void }) {
  const { role } = useRole();
  const { profile, setPlan } = useProfile();
  const [confirming, setConfirming] = useState<Plan | null>(null);
  const [done, setDone] = useState(false);

  const current = profile.plan;
  const primaryCard = profile.cards.find((c) => c.primary) ?? profile.cards[0];
  const tier = confirming ? premiumTiers.find((t) => t.id === confirming) : null;

  function confirm() {
    if (!confirming) return;
    setPlan(confirming);
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-brand-border bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
              {done ? "You're all set" : confirming ? "Confirm your upgrade" : "Your plan"}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              {done
                ? `You're now on ${planLabel[current]}. The new features are available straight away.`
                : confirming
                  ? "Nothing is charged in this demo."
                  : role === "investor"
                    ? "You're on " + planLabel[current] + ". Change it at any time, and keep what you've already set up."
                    : "Renting through Buynidify is free for tenants."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-brand-muted hover:text-brand-ink"
          >
            ✕
          </button>
        </div>

        {/* Tenants have nothing to buy, so say so plainly rather than showing
            an upsell they can't act on. */}
        {role !== "investor" ? (
          <div className="mt-6 rounded-2xl border border-brand-border bg-brand-surface p-6">
            <p className="font-display text-2xl font-semibold tracking-tight text-brand-ink">£0</p>
            <p className="mt-1 text-sm text-brand-muted">
              Search, express interest, and move through your matches at no cost. There is no
              subscription and no finder's fee.
            </p>
          </div>
        ) : done ? (
          <div className="mt-6 rounded-2xl border border-brand-border bg-brand-surface p-6 text-center">
            <p className="text-4xl">✓</p>
            <p className="mt-2 font-display text-lg font-semibold text-brand-ink">
              {planLabel[current]} is active
            </p>
            <p className="mt-1 text-sm text-brand-muted">
              Renews {profile.planRenews}. Manage it any time from your profile.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              Done
            </button>
          </div>
        ) : confirming && tier ? (
          <div className="mt-6">
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-lg font-semibold text-brand-ink">{tier.name}</p>
                <p className="font-display text-2xl font-semibold text-brand-ink">
                  £{tier.price}
                  <span className="text-sm font-normal text-brand-muted">/mo</span>
                </p>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-brand-ink">
                {tier.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-brand-border p-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Paying with
                </p>
                <p className="mt-0.5 text-sm font-semibold text-brand-ink">
                  {primaryCard
                    ? `${primaryCard.brand} ending ${primaryCard.last4}`
                    : "No card on file"}
                </p>
              </div>
              {primaryCard && (
                <span className="text-xs text-brand-muted">Expires {primaryCard.expiry}</span>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="flex-1 rounded-lg border border-brand-border px-4 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-surface"
              >
                Back
              </button>
              <button
                type="button"
                onClick={confirm}
                className="flex-1 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
              >
                Confirm {tier.name}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {premiumTiers.map((t) => {
              const id = t.id as Plan;
              const isCurrent = id === current;
              const isDowngrade = order.indexOf(id) < order.indexOf(current);
              return (
                <div
                  key={t.id}
                  className={`flex flex-col rounded-2xl border p-5 ${
                    isCurrent ? "border-brand-blue bg-brand-blue-light" : "border-brand-border bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent ? "text-brand-blue" : "text-brand-muted"
                      }`}
                    >
                      {t.name}
                    </p>
                    {isCurrent && (
                      <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-bold text-white">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-brand-ink">
                    £{t.price}
                    <span className="text-sm font-normal text-brand-muted">/mo</span>
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">{t.tagline}</p>
                  <hr className="my-4 border-brand-border" />
                  <ul className="flex-1 space-y-2 text-sm text-brand-ink">
                    {t.features.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={isCurrent}
                    onClick={() => (t.price === 0 ? setPlan(id) : setConfirming(id))}
                    className={`mt-5 w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
                      isCurrent
                        ? "cursor-default bg-white text-brand-blue"
                        : isDowngrade
                          ? "border border-brand-border text-brand-ink hover:border-brand-blue"
                          : "bg-brand-blue text-white hover:bg-brand-blue-dark"
                    }`}
                  >
                    {isCurrent ? "Your plan" : isDowngrade ? `Switch to ${t.name}` : `Upgrade to ${t.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
