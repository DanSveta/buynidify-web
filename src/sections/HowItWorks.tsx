import { CompassIcon, HandshakeIcon, VrIcon } from "../components/icons";
import { steps, type Step } from "../lib/content";

const icons: Record<Step["icon"], React.ComponentType<{ className?: string }>> = {
  discover: CompassIcon,
  tour: VrIcon,
  secure: HandshakeIcon,
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-14 flex flex-col items-center text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
          Simplified Journey
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          How Buynidify Works
        </h2>
        <p className="mt-3 max-w-xl text-brand-muted">
          Whether you're moving into your dream residence or investing in
          high-growth rental portfolios, we've automated the path.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = icons[step.icon];
          return (
            <div
              key={step.index}
              className="group flex flex-col rounded-3xl border border-brand-border bg-brand-surface p-8 transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue hover:shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-brand-gold transition-transform duration-200 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="font-display text-3xl font-semibold tracking-tight text-brand-gold">
                  {step.index}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold tracking-tight text-brand-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-brand-muted">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Placeholder only - marks where a real animation goes later, not a
          finished asset. */}
      <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-brand-gold/60 bg-brand-surface p-10 text-center">
        <span className="animate-bounce text-4xl" aria-hidden>
          🎬
        </span>
        <p className="font-display text-base font-semibold tracking-tight text-brand-ink">
          [ Animation goes here ]
        </p>
        <p className="max-w-sm text-sm text-brand-muted">
          Placeholder for later - picture the three steps above playing out as
          a short, friendly animation right in this spot.
        </p>
      </div>
    </section>
  );
}
