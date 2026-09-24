import { Link } from "react-router-dom";
import Button from "../components/Button";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CorporateIcon,
  InvestorIcon,
  TenantIcon,
} from "../components/icons";
import { journeyCards, type JourneyCard } from "../lib/content";

const icons: Record<JourneyCard["icon"], React.ComponentType<{ className?: string }>> = {
  investor: InvestorIcon,
  tenant: TenantIcon,
  corporate: CorporateIcon,
};

// Each card is fully informative at rest (title, one-line description, and
// three short highlight chips are always visible - nothing critical is
// hidden behind hover). Hover/focus only adds a "this is your path" lift:
// the card darkens to brand-ink, its chips fill solid, and a single small
// gold check appears next to the title. That's the one deliberate spot of
// gold in the section, standing in for the "active/selected" cue from the
// reference screenshot without tinting the whole card gold.
export default function ChooseYourJourney() {
  return (
    <section id="journey" className="bg-brand-surface py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
            Your Path Forward
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
            Choose Your Journey
          </h2>
          <p className="mt-3 max-w-xl text-brand-muted">
            Three ways to use Buynidify. Pick the one that's you - each has
            its own tools built around it.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {journeyCards.map((card) => {
            const Icon = icons[card.icon];
            return (
              <div
                key={card.id}
                tabIndex={0}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-brand-border bg-white p-8 shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:border-brand-ink hover:bg-brand-ink hover:shadow-2xl focus-visible:-translate-y-1 focus-visible:border-brand-ink focus-visible:bg-brand-ink focus-visible:shadow-2xl"
              >
                {/* Faint index watermark - replaces the old gold "01/02/03"
                    with a quiet, low-contrast one that doesn't compete for
                    attention. */}
                <span className="pointer-events-none absolute -right-2 -top-3 font-display text-7xl font-bold tracking-tight text-brand-ink/[0.04] transition-colors duration-300 group-hover:text-white/[0.06]">
                  {card.index}
                </span>

                <div className="relative flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-brand-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-muted transition-colors duration-300 group-hover:border-white/20 group-hover:text-white/60">
                    {card.tag}
                  </span>
                </div>

                <div className="relative mt-6 flex items-center gap-2">
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-brand-ink transition-colors duration-300 group-hover:text-white">
                    {card.title}
                  </h3>
                  <CheckCircleIcon className="h-4 w-4 scale-0 text-brand-gold opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                </div>
                <p className="relative mt-2 text-base text-brand-muted transition-colors duration-300 group-hover:text-white/70">
                  {card.description}
                </p>

                <ul className="relative mt-5 flex flex-col gap-2.5">
                  {card.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-sm font-medium text-brand-muted transition-colors duration-300 group-hover:text-white/80"
                    >
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-blue transition-colors duration-300 group-hover:bg-brand-gold" />
                      {h}
                    </li>
                  ))}
                </ul>

                <Button
                  as={Link}
                  to="/login"
                  variant="primary"
                  className="relative mt-7 w-fit transition-transform duration-300 group-hover:scale-[1.03]"
                >
                  {card.cta}
                  <ArrowRightIcon />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
