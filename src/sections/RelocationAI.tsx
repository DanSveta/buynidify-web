import Button from "../components/Button";
import { ArrowRightIcon, CheckCircleIcon, ZapIcon } from "../components/icons";
import { relocateTrustBadges } from "../lib/content";

// Redesigned per Véta's review: the old version was a full-bleed photo with
// text over it - a stock-photo landing block, not something that reads as a
// working AI product. This keeps the same photo/overlay treatment (still
// full-bleed, still on-brand) but adds a floating mockup panel on the right
// showing an actual snippet of the Relocate AI experience - Linda's own
// opening line and a real UK city (see src/pages/RelocateAI.tsx), plus a
// mini "AI fit score" strip echoing the home-match cards that page shows
// once you land on the homes step. The goal: a visitor glances at this and
// understands it's a real, working AI concierge, not a photo with a caption.

const sampleHomes = [
  { area: "Northern Quarter", fit: 94 },
  { area: "Ancoats", fit: 88 },
  { area: "Chorlton", fit: 81 },
];

export default function RelocationAI() {
  return (
    <section
      id="relocate"
      className="relative overflow-hidden bg-[#071a33] py-24"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url('/relocate.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071a33] via-[#071a33]/95 to-[#071a33]/70" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-gold">
            AI Solution · Relocate AI
          </p>
          <h2 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Relocating internationally?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/80 lg:mx-0">
            Linda, our Relocate AI concierge, handles the housing side of
            moving to the UK: matches you to real neighbourhoods and homes,
            walks you through the visa paperwork for your specific route, and
            estimates rent and costs before you've even landed.
          </p>

          {/* Opens in a new tab, on purpose - Relocate AI is built and dressed
              as its own product (see src/pages/RelocateAI.tsx), not another
              page inside this site's nav. */}
          <Button
            as="a"
            href="/relocate-ai"
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            className="mt-8"
          >
            <ZapIcon className="h-4 w-4" />
            Launch Relocate AI
            <ArrowRightIcon />
          </Button>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-start">
            {relocateTrustBadges.map((badge) => (
              <span
                key={badge}
                className="flex items-center gap-2 text-sm text-white/80"
              >
                <CheckCircleIcon className="h-4 w-4 text-brand-gold" />
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Floating product mockup - same chat + fit-score visual language as
            the real Relocate AI page, just condensed to a glance. */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-brand-gold/10 blur-2xl" />
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-brand-ink">
                L
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  Linda
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-gold">
                    AI
                  </span>
                </p>
                <p className="text-[11px] text-white/50">Relocate AI concierge</p>
              </div>
            </div>

            <div className="space-y-3 px-5 py-5">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl bg-white/10 px-3.5 py-2.5 text-xs leading-relaxed text-white">
                  Hi, I'm Linda. Where are you moving from, and which UK city are you thinking of?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-brand-gold px-3.5 py-2.5 text-xs font-medium leading-relaxed text-brand-ink">
                  Toronto — thinking Manchester, for work
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl bg-white/10 px-3.5 py-2.5 text-xs leading-relaxed text-white">
                  Manchester — good choice. A 1-bed typically runs £900–£1,400/month. Here are a
                  few homes worth a look, with a quick AI read on how well each fits.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-white/10 px-5 py-4">
              {sampleHomes.map((h) => (
                <div
                  key={h.area}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center"
                >
                  <span className="mx-auto mb-1 flex h-5 w-fit items-center justify-center rounded-full bg-brand-gold px-1.5 text-[9px] font-bold text-brand-ink">
                    {h.fit}%
                  </span>
                  <p className="text-[10px] font-semibold leading-tight text-white/80">{h.area}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
