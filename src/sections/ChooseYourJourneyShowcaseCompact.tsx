import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { ArrowRightIcon, CorporateIcon, InvestorIcon, TenantIcon } from "../components/icons";
import { journeyCards, type JourneyCard } from "../lib/content";
import { journeyImageUrl, onJourneyImageError } from "../lib/journeyImages";

const icons: Record<JourneyCard["icon"], React.ComponentType<{ className?: string }>> = {
  investor: InvestorIcon,
  tenant: TenantIcon,
  corporate: CorporateIcon,
};

// Same tabs-swap-the-photo idea as option C, but the photo is a contained,
// rounded panel with breathing room around it instead of a full-bleed
// edge-to-edge image - much less "wall of photo" when it lands right under
// a hero that's already a big image. The photo column is narrower than the
// text column and stretches to match its height exactly (no floating gap
// at top/bottom), and its badge now carries the role's own icon, not just
// a name, since a plain property photo alone doesn't say "this one's for
// investors" on its own.
export default function ChooseYourJourneyShowcaseCompact() {
  const [activeId, setActiveId] = useState(journeyCards[0].id);
  const active = journeyCards.find((c) => c.id === activeId) ?? journeyCards[0];
  const ActiveIcon = icons[active.icon];

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
            Three ways to use Buynidify. Pick the one that's you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[3fr_2fr] md:items-stretch">
          {/* Text + tabs */}
          <div className="order-2 flex flex-col md:order-1">
            <div className="flex flex-col gap-2">
              {journeyCards.map((card) => {
                const TabIcon = icons[card.icon];
                const isActive = card.id === activeId;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setActiveId(card.id)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors duration-200 ${
                      isActive
                        ? "border-brand-ink bg-brand-ink"
                        : "border-brand-border bg-white hover:border-brand-blue/40"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                        isActive ? "bg-white/10 text-white" : "bg-brand-blue-light text-brand-blue"
                      }`}
                    >
                      <TabIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-base font-semibold ${isActive ? "text-white" : "text-brand-ink"}`}>
                        {card.title}
                      </span>
                      {isActive && (
                        <span className="mt-0.5 block text-sm text-white/60">{card.tag}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-5 text-base leading-relaxed text-brand-muted">{active.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {active.highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-full bg-brand-blue-light px-3 py-1.5 text-sm font-medium text-brand-blue"
                >
                  {h}
                </span>
              ))}
            </div>
            <Button as={Link} to="/login" variant="primary" className="mt-5 w-fit">
              {active.cta}
              <ArrowRightIcon />
            </Button>
          </div>

          {/* Contained photo panel - narrower than the text column, and
              stretched (h-full) to start and end exactly where the tabs +
              text column does. */}
          <div className="order-1 min-h-[280px] md:order-2">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-3xl border border-brand-border">
              <img
                key={active.id}
                src={journeyImageUrl(active.icon)}
                onError={onJourneyImageError(active.icon)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-ink backdrop-blur-sm">
                <ActiveIcon className="h-3.5 w-3.5" />
                {active.title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
