import { Link } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { premiumTiers } from "../data/mockData";

export default function Pricing() {
  const { role } = useRole();

  if (role !== "investor") {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
          Pricing
        </h1>
        <p className="mt-1 max-w-xl text-brand-muted">
          Renting through Buynidify is free for tenants, no subscription or
          finder's fee. Whether that changes for premium tenant features is
          still being decided.
        </p>

        <div className="mt-8 max-w-md rounded-2xl border border-brand-border bg-brand-surface p-6">
          <p className="font-display text-2xl font-semibold tracking-tight text-brand-ink">£0</p>
          <p className="mt-1 text-sm text-brand-muted">
            Search, express interest, and move through the Deal Tracker at no
            cost.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        Pricing
      </h1>
      <p className="mt-1 text-brand-muted">
        Get more from Buynidify with priority access and deeper insight.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {premiumTiers.map((tier) => (
          <div
            key={tier.id}
            className={`rounded-2xl border p-6 ${
              tier.featured
                ? "border-brand-blue bg-brand-blue-light"
                : "border-brand-border bg-white"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                tier.featured ? "text-brand-blue" : "text-brand-muted"
              }`}
            >
              {tier.name}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-brand-ink">
              £{tier.price}
              <span className="text-sm font-normal text-brand-muted">/mo</span>
            </p>
            <p className="mt-1 text-xs text-brand-muted">{tier.tagline}</p>
            <hr className="my-4 border-brand-border" />
            <ul className="space-y-2 text-sm text-brand-ink">
              {tier.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <button
              className={`mt-5 w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
                tier.featured
                  ? "bg-brand-blue text-white hover:bg-brand-blue-dark"
                  : "border border-brand-border text-brand-ink hover:border-brand-blue"
              }`}
            >
              {tier.price === 0 ? "Current plan" : `Upgrade to ${tier.name}`}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-brand-muted">
        Already on a paid plan?{" "}
        <Link to="/app/billing" className="font-semibold text-brand-blue hover:underline">
          Manage billing and payment method →
        </Link>
      </p>
    </div>
  );
}
