import { topLocations } from "../lib/content";

export default function TopLocations() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex flex-col items-center text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
          Local Insights
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Top Investment Locations
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {topLocations.map((loc) => (
          <div
            key={loc.city}
            className="group relative h-64 overflow-hidden rounded-2xl"
          >
            <img
              src={loc.image}
              alt={loc.city}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="font-display text-xl font-semibold tracking-tight">{loc.city}</p>
              <div className="mt-2 flex gap-2">
                <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-semibold backdrop-blur">
                  {loc.yieldValue}
                </span>
                <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-semibold backdrop-blur">
                  {loc.growth}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
