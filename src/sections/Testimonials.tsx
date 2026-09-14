import { testimonials } from "../lib/content";

function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex flex-col items-center text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
          Success Stories
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          What Our Users Say
        </h2>
        <p className="mt-3 max-w-xl text-brand-muted">
          Join thousands of property owners, daily renters, and digital real
          estate fractional investors.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="rounded-2xl border border-brand-border bg-brand-surface p-8"
          >
            <div className="mb-4 flex gap-1 text-brand-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} />
              ))}
            </div>
            <p className="text-brand-ink">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-6 flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-brand-ink">
                  {t.name}
                </p>
                <p className="text-xs text-brand-muted">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
