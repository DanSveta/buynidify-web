import { Link } from "react-router-dom";
import Button from "../components/Button";
import {
  ArrowRightIcon,
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

export default function ChooseYourJourney() {
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
            Whether you're growing a portfolio, finding your next home, or
            managing your team's housing, pick your path.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {journeyCards.map((card) => {
            const Icon = icons[card.icon];
            return (
              <div
                key={card.id}
                className="group flex flex-col rounded-3xl border border-brand-border bg-brand-surface p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue hover:shadow-xl"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-brand-gold transition-transform duration-200 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-display text-3xl font-semibold tracking-tight text-brand-gold">
                    {card.index}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-brand-ink">
                  {card.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-brand-muted">
                  {card.description}
                </p>
                <Button as={Link} to="/login" variant="primary" className="mt-6 w-fit">
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
