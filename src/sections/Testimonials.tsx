import { useRef } from "react";
import { testimonials, testimonialAvatar } from "../lib/content";

function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function ArrowIcon({ className = "h-4 w-4", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${flip ? "rotate-180" : ""}`}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// A row of cards, 3-4 visible at a time depending on screen width, that
// scrolls sideways rather than stacking every review into one long column -
// ten real-feature testimonials fit comfortably this way instead of
// crowding two giant cards onto the screen.
export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = (card?.offsetWidth ?? 320) + 24;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex flex-col items-center text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
          Success Stories
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          What Our Users Say
        </h2>
        <p className="mt-3 max-w-xl text-brand-muted">
          From investors who never have to chase an agent to tenants who never have to chase a
          listing - real feedback from both sides of the platform.
        </p>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="scrollbar-none flex gap-6 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              data-card
              className="flex w-[300px] flex-shrink-0 flex-col rounded-2xl border border-brand-border bg-brand-surface p-7 sm:w-[320px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="mb-4 flex gap-1 text-brand-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-brand-ink">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src={testimonialAvatar(t.name, t.gender)}
                  alt={t.name}
                  className="h-10 w-10 flex-shrink-0 rounded-full bg-white object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-brand-ink">{t.name}</p>
                  <p className="text-xs text-brand-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous reviews"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
          >
            <ArrowIcon flip />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="More reviews"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
          >
            <ArrowIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
