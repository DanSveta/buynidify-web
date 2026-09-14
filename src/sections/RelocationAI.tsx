import Button from "../components/Button";
import { ArrowRightIcon, CheckCircleIcon, ZapIcon } from "../components/icons";
import { relocateTrustBadges } from "../lib/content";

export default function RelocationAI() {
  return (
    <section
      id="relocate"
      className="relative flex min-h-[700px] items-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/relocate.png')" }}
      />
      <div className="absolute inset-0 bg-brand-ink/35" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-24 text-center [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Relocating internationally?
        </h2>
        <p className="max-w-xl text-white/90">
          Our partner AI agent finds verified rentals, audits leases, checks
          local laws, and matches you with your perfect home across major
          cities worldwide.
        </p>
        <Button variant="primary" className="mt-2">
          <ZapIcon className="h-4 w-4" />
          Launch Relocate AI
          <ArrowRightIcon />
        </Button>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {relocateTrustBadges.map((badge) => (
            <span
              key={badge}
              className="flex items-center gap-2 text-sm text-white/90"
            >
              <CheckCircleIcon className="h-4 w-4 text-brand-cta" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
