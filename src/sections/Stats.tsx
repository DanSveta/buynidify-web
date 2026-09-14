import { CheckCircleIcon } from "../components/icons";
import { stats, wealthBullets } from "../lib/content";

export default function Stats() {
  return (
    <section className="bg-brand-surface py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
            Real Estate Wealth
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
            Diversify Safely with Fractional Real Estate
          </h2>
          <p className="mt-4 max-w-md text-brand-muted">
            Traditional property investing requires massive capital upfront.
            Buynidify breaks boundaries by allowing you to purchase
            fractional stakes in premium residential properties.
          </p>
          <ul className="mt-6 space-y-3">
            {wealthBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm font-semibold text-brand-ink">
                {/* Solid navy badge with a gold check, not just an outlined
                    icon - matches the Figma checklist treatment. */}
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue">
                  <CheckCircleIcon className="h-4 w-4 text-brand-gold [&_circle]:hidden" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-brand-border bg-white p-6 text-center shadow-sm"
            >
              <p className="font-display text-4xl font-bold tracking-tight text-brand-blue">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-brand-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
