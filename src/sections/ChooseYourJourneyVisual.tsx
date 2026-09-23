import { Link } from "react-router-dom";
import Button from "../components/Button";
import { ArrowRightIcon, CorporateIcon, InvestorIcon, TenantIcon } from "../components/icons";
import { journeyCards, type JourneyCard } from "../lib/content";

const icons: Record<JourneyCard["icon"], React.ComponentType<{ className?: string }>> = {
  investor: InvestorIcon,
  tenant: TenantIcon,
  corporate: CorporateIcon,
};

// Real photography instead of flat icon cards - a tri-split of tall image
// panels, each with a dark navy/black gradient so the copy reads as an
// overlay rather than a caption underneath. This is the "more visual, still
// serious" direction from the first reference screenshot: photography and a
// dark scrim standing in for their dark "selected" card, no illustrated
// characters anywhere. Gold only shows up as a single thin accent line under
// the title on hover.
const images: Record<JourneyCard["icon"], string> = {
  investor:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=70",
  tenant:
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=70",
  corporate:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=70",
};

export default function ChooseYourJourneyVisual() {
  return (
    <section id="journey" className="bg-brand-ink py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-gold">
            Your Path Forward
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Choose Your Journey
          </h2>
          <p className="mt-3 max-w-xl text-white/60">
            Three ways to use Buynidify. Pick the one that's you - each has
            its own tools built around it.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {journeyCards.map((card) => {
            const Icon = icons[card.icon];
            return (
              <Link
                key={card.id}
                to="/login"
                className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-3xl shadow-lg"
              >
                <img
                  src={images[card.icon]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10 transition-opacity duration-300 group-hover:from-black/95" />

                <div className="relative flex flex-col p-7">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm">
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
                    {card.tag}
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white">
                    {card.title}
                  </h3>
                  <span className="mt-2 h-0.5 w-8 origin-left scale-x-0 rounded-full bg-brand-gold transition-transform duration-300 group-hover:scale-x-100" />

                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {card.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {card.highlights.map((h) => (
                      <span
                        key={h}
                        className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm"
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  <Button
                    as="span"
                    variant="primary"
                    className="mt-5 w-fit translate-y-1 opacity-90 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    {card.cta}
                    <ArrowRightIcon />
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
