import { Link } from "react-router-dom";
import { CompassIcon, HandshakeIcon, VrIcon } from "../components/icons";
import { steps, serviceCategories, type Step } from "../lib/content";
// Animation experiments are intentionally disabled for now.
// Uncomment this import and the component below when they are ready to ship.
// import HowItWorksShowcase from "./HowItWorksShowcase";

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

      {/* <HowItWorksShowcase /> */}

      {/* Fully automated is the pitch for a busy investor: nothing here
          requires being present, and every step is done through the
          platform rather than chased over email or phone. */}
      <div className="mt-14 rounded-3xl border border-brand-border bg-brand-ink p-8 text-center sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-gold">
          Built for busy investors
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Fully automated. No need to be present.
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70">
          From the first AI analysis to a tenant moving in, everything runs through the platform -
          matching, terms, deposit, paperwork and the services below. You approve each step online;
          Buynidify's team and AI agent do the coordinating, wherever you are.
        </p>
      </div>

      {/* The concierge side - what Buynidify actually coordinates once a
          deal is moving, and where the new Partners programme feeds in. */}
      <div className="mt-10">
        <h3 className="text-center font-display text-xl font-semibold text-brand-ink">
          Services, coordinated for you
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-brand-muted">
          Insurance, legal, cleaning, removals, furnishing and maintenance - Buynidify's network of
          vetted local partners handles it, arranged automatically through the platform.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((s) => (
            <div key={s.title} className="rounded-2xl border border-brand-border bg-white p-4">
              <p className="text-sm font-semibold text-brand-ink">{s.title}</p>
              <p className="mt-0.5 text-xs text-brand-muted">{s.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-brand-muted">
          Run one of these businesses?{" "}
          <Link to="/partners" className="font-semibold text-brand-blue hover:underline">
            Become a Buynidify partner →
          </Link>
        </p>
      </div>
    </section>
  );
}
