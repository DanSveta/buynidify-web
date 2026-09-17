import { ChartIcon, LockIcon, ShieldIcon, SupportIcon } from "../components/icons";
import { whyFeatures, type WhyFeature } from "../lib/content";

const icons: Record<WhyFeature["icon"], React.ComponentType<{ className?: string }>> = {
  shield: ShieldIcon,
  chart: ChartIcon,
  lock: LockIcon,
  support: SupportIcon,
};

export default function WhyBuynidify() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
            The Platform Edge
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
            Why New-Generation Investors Choose Buynidify
          </h2>
          <p className="mt-3 max-w-xl text-brand-muted">
            Combining real estate industry security with next-generation
            automated asset management.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {whyFeatures.map((feature) => {
            const Icon = icons[feature.icon];
            return (
              <div
                key={feature.title}
                className="group flex gap-4 rounded-2xl border border-brand-border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue hover:shadow-xl"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-blue text-brand-gold transition-transform duration-200 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold tracking-tight text-brand-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-brand-muted">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
