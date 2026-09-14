import { realPropertyTypeOptions } from "../lib/propertyTypes";

// Same 7 property types as the app's Search page (and the hero search bar
// above) - same labels, same icons, no separate invented taxonomy.
export default function PropertyNiches() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex flex-col items-center text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
          Asset Diversity
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Explore Property Niches
        </h2>
        <p className="mt-3 max-w-xl text-brand-muted">
          Select from different property types tailored to varied risk
          profiles and income objectives.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {realPropertyTypeOptions.map(({ value, label, Icon }) => (
          <div
            key={value}
            className="flex cursor-default items-center gap-2 rounded-full border border-brand-border bg-white px-5 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-md"
          >
            <span className="flex h-6 w-6 items-center justify-center text-brand-blue">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-brand-ink">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
