import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { ArrowRightIcon, CorporateIcon, InvestorIcon, TenantIcon } from "../components/icons";
import { journeyCards, type JourneyCard } from "../lib/content";

const icons: Record<JourneyCard["icon"], React.ComponentType<{ className?: string }>> = {
  investor: InvestorIcon,
  tenant: TenantIcon,
  corporate: CorporateIcon,
};

// This is the closest of the four to the reference screenshot Véta sent:
// a row of plain, equal-height cards where exactly one is "selected" (dark
// card, icon in a filled circle, small status dot in the corner) and the
// rest sit quiet and light until clicked. Unlike the reference, the status
// dot is emerald rather than the brand gold - one more place gold stays out
// of the way - and the icons are Buynidify's own line icons, not
// illustrated characters.
export default function ChooseYourJourneySelector() {
  const [activeId, setActiveId] = useState(journeyCards[0].id);

  return (
    <section id="journey" className="bg-white py-24">
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

        <div className="grid gap-5 md:grid-cols-3">
          {journeyCards.map((card) => {
            const Icon = icons[card.icon];
            const isActive = card.id === activeId;
            return (
              // A <div>, not a <button> - the selected card's CTA renders an
              // actual <Link>, and a link can't legally nest inside a
              // button. Clicking anywhere on the card still selects it;
              // role="button" + onKeyDown keeps it keyboard-operable.
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveId(card.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveId(card.id);
                  }
                }}
                className={`group relative flex cursor-pointer flex-col rounded-2xl p-7 text-left outline-none transition-all duration-200 ${
                  isActive
                    ? "bg-brand-ink shadow-xl"
                    : "border border-brand-border bg-white hover:border-brand-blue/40 hover:shadow-md"
                }`}
              >
                {isActive && (
                  <span className="absolute right-5 top-5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                )}

                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200 ${
                    isActive ? "bg-white/10 text-white" : "bg-brand-blue-light text-brand-blue"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </span>

                <span
                  className={`mt-5 text-xs font-semibold uppercase tracking-wide ${
                    isActive ? "text-white/50" : "text-brand-muted"
                  }`}
                >
                  {card.tag}
                </span>
                <span
                  className={`mt-1 font-display text-xl font-semibold tracking-tight ${
                    isActive ? "text-white" : "text-brand-ink"
                  }`}
                >
                  {card.title}
                </span>

                {/* Only the selected card unfolds its description, chips and
                    CTA - the quiet cards stay to a single line so the row
                    reads as one choice being made, not three equal essays. */}
                <div
                  className={`grid transition-all duration-300 ${
                    isActive ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm leading-relaxed text-white/70">{card.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {card.highlights.map((h) => (
                        <span
                          key={h}
                          className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                    <Button as={Link} to="/login" variant="primary" className="mt-5 w-fit">
                      {card.cta}
                      <ArrowRightIcon />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
