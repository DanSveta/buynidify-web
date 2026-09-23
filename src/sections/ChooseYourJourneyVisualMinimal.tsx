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
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=65",
  tenant:
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=500&q=65",
  corporate:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=65",
};

// A lighter take on the photo tri-split: the photo is a short strip (h-32)
// at the top of an otherwise ordinary white card, not the whole card. Same
// real-photography idea, a fraction of the visual weight - meant to sit
// comfortably below a hero that's already a big image, not repeat it.
export default function ChooseYourJourneyVisualMinimal() {
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

        <div className="grid gap-6 md:grid-cols-3">
          {journeyCards.map((card) => {
            const Icon = icons[card.icon];
            return (
              <div
                key={card.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-32 flex-shrink-0 overflow-hidden">
                  <img
                    src={images[card.icon]}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-brand-ink/25" />
                  <span className="absolute bottom-3 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-blue shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    {card.tag}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-brand-ink">
                    {card.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-brand-muted">{card.description}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {card.highlights.map((h) => (
                      <span
                        key={h}
                        className="rounded-full bg-brand-blue-light px-2.5 py-1 text-[11px] font-medium text-brand-blue"
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
