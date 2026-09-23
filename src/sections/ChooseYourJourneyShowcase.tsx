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

const images: Record<JourneyCard["icon"], string> = {
  investor:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=75",
  tenant:
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=75",
  corporate:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=75",
};

// One big photo, a tab list beside it. Picking a tab swaps the photo and the
// copy rather than presenting three cards side by side - the most "visual"
// of the three directions, closer to a single hero moment than a grid.
// Still no illustrated characters; the seriousness comes from a single large
// photograph with a navy scrim, not from any cartoon iconography.
export default function ChooseYourJourneyShowcase() {
  const [activeId, setActiveId] = useState(journeyCards[0].id);
  const active = journeyCards.find((c) => c.id === activeId) ?? journeyCards[0];
  const Icon = icons[active.icon];

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

        <div className="grid overflow-hidden rounded-3xl border border-brand-border bg-white shadow-lg lg:grid-cols-[360px_1fr]">
          {/* Tab list */}
          <div className="flex flex-row border-b border-brand-border lg:flex-col lg:border-b-0 lg:border-r">
            {journeyCards.map((card) => {
              const TabIcon = icons[card.icon];
              const isActive = card.id === activeId;
              return (
                <button
                  key={card.id}
                  type="button"
                  onMouseEnter={() => setActiveId(card.id)}
                  onClick={() => setActiveId(card.id)}
                  className={`group flex flex-1 items-center gap-3 border-b border-brand-border p-5 text-left transition-colors duration-200 last:border-b-0 lg:border-b lg:border-r-0 ${
                    isActive ? "bg-brand-ink" : "bg-white hover:bg-brand-surface"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                      isActive ? "bg-white/10 text-white" : "bg-brand-blue-light text-brand-blue"
                    }`}
                  >
                    <TabIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-xs font-semibold uppercase tracking-wide ${
                        isActive ? "text-white/50" : "text-brand-muted"
                      }`}
                    >
                      {card.tag}
                    </span>
                    <span
                      className={`block font-display text-base font-semibold ${
                        isActive ? "text-white" : "text-brand-ink"
                      }`}
                    >
                      {card.title}
                    </span>
                  </span>
                  <span
                    className={`ml-auto hidden h-1.5 w-1.5 flex-shrink-0 rounded-full transition-opacity duration-200 lg:block ${
                      isActive ? "bg-brand-gold opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Photo + content panel */}
          <div className="relative min-h-[420px]">
            <img
              key={active.id}
              src={images[active.icon]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <div className="relative flex h-full flex-col justify-end p-8 sm:p-10">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="font-display text-3xl font-semibold tracking-tight text-white">
                {active.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
                {active.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {active.highlights.map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm"
                  >
                    {h}
                  </span>
                ))}
              </div>
              <Button as={Link} to="/login" variant="primary" className="mt-6 w-fit">
                {active.cta}
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
