import { useState } from "react";
import { localServices, type LocalService } from "../data/mockData";

const categories: (LocalService["category"] | "All")[] = [
  "All",
  "Removals",
  "Cleaning",
  "Maintenance",
  "Conveyancing",
  "Insurance",
];

export default function LocalServices() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");

  const filtered =
    category === "All" ? localServices : localServices.filter((s) => s.category === category);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        Local Services
      </h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        Vetted removals, cleaning, maintenance, and legal partners near your
        properties. The same partners Buynidify routes support requests to.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              category === c
                ? "border-brand-blue bg-brand-blue text-white"
                : "border-brand-border text-brand-muted hover:border-brand-blue hover:text-brand-blue"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((service) => (
          <div key={service.id} className="rounded-2xl border border-brand-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-base font-semibold text-brand-ink">
                  {service.name}
                </p>
                <p className="text-xs text-brand-muted">
                  {service.category} · {service.city}
                </p>
              </div>
              <span className="flex-shrink-0 rounded-full bg-brand-blue-light px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
                ★ {service.rating}
              </span>
            </div>
            <p className="mt-2 text-sm text-brand-muted">{service.blurb}</p>
            <button className="mt-3 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
              Request a quote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
