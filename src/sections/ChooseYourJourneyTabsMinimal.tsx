import { useState } from "react";
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
import { journeyImageUrl, onJourneyImageError } from "../lib/journeyImages";

const icons: Record<JourneyCard["icon"], React.ComponentType<{ className?: string }>> = {
  investor: InvestorIcon,
  tenant: TenantIcon,
  corporate: CorporateIcon,
};

// Per-role accent, used sparingly on this one card only - it's what makes
// three otherwise-identical content cards feel distinct at a glance instead
// of interchangeable text blocks.
const accent: Record<JourneyCard["icon"], { ring: string; wash: string; icon: string }> = {
  investor: { ring: "ring-brand-gold", wash: "bg-brand-blue-light", icon: "text-brand-blue" },
  tenant: { ring: "ring-emerald-400", wash: "bg-emerald-50", icon: "text-emerald-600" },
  corporate: { ring: "ring-brand-gold", wash: "bg-brand-blue-light", icon: "text-brand-blue" },
};

// v2: kept the pill switcher with round thumbnails Véta liked, rebuilt the
// content card underneath - it read as "almost empty" before (one icon, a
// line of text, a few pills). Now it's a proper two-column card: a small
// contained photo on the right (not a big background image, just a fixed
// 220px column) and, on the left, the highlights promoted from small pills
// into a real checklist with icons, so the card has actual substance
// without reintroducing a wall of photo.
export default function ChooseYourJourneyTabsMinimal() {
  const [activeId, setActiveId] = useState(journeyCards[0].id);
  const active = journeyCards.find((c) => c.id === activeId) ?? journeyCards[0];
  const Icon = icons[active.icon];
  const a = accent[active.icon];

  return (
    <section id="journey" className="bg-brand-surface py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
          Your Path Forward
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Choose Your Journey
        </h2>
        <p className="mt-3 text-brand-muted">
          Three ways to use Buynidify. Pick the one that's you.
        </p>

        {/* Pill switcher */}
        <div className="mx-auto mt-8 inline-flex flex-wrap justify-center gap-2 rounded-full border border-brand-border bg-white p-1.5">
          {journeyCards.map((card) => {
            const isActive = card.id === activeId;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveId(card.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  isActive ? "bg-brand-ink text-white" : "text-brand-muted hover:text-brand-ink"
                }`}
              >
                <img
                  src={journeyImageUrl(card.icon, 100)}
                  onError={onJourneyImageError(card.icon, 100)}
                  alt=""
                  className={`h-6 w-6 rounded-full object-cover ring-2 ${
                    isActive ? "ring-brand-gold" : "ring-transparent"
                  }`}
                />
                {card.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content card - wider than the header column so the two-column
          split has room to breathe. */}
      <div className="mx-auto mt-8 max-w-4xl px-6">
        <div className="grid overflow-hidden rounded-3xl border border-brand-border bg-white shadow-sm sm:grid-cols-[1fr_220px]">
          <div className="p-8 text-left sm:p-10">
            <div className="flex items-start gap-4">
              <span
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${a.wash} ${a.icon}`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  {active.tag}
                </p>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-brand-ink">
                  {active.title}
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-brand-muted">{active.description}</p>

            {/* Highlights as a real checklist, not small pills - gives the
                card enough substance to not read as empty. */}
            <ul className="mt-5 space-y-2.5">
              {active.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2.5 text-sm text-brand-ink">
                  <CheckCircleIcon className={`h-4 w-4 flex-shrink-0 ${a.icon}`} />
                  {h}
                </li>
              ))}
            </ul>

            <Button as={Link} to="/login" variant="primary" className="mt-6 w-fit">
              {active.cta}
              <ArrowRightIcon />
            </Button>
          </div>

          {/* Small contained photo - a column, not a backdrop. Keeps the
              card feeling grounded in something real without becoming
              another big picture. */}
          <div className="relative hidden min-h-[220px] sm:block">
            <img
              key={active.id}
              src={journeyImageUrl(active.icon)}
              onError={onJourneyImageError(active.icon)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className={`absolute inset-0 ring-4 ring-inset ${a.ring}/40`} />
          </div>
        </div>
      </div>
    </section>
  );
}
