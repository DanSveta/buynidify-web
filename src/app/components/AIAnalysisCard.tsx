// The single "Buynidify AI analysis" card design, shared by every place an
// analysis renders (investor listing, buyer/home-purchase listing, tenant
// demand) - previously each had its own plain pale-blue box with a grid of
// identical small pills. This is the "beautiful, organized" version: a dark
// header banner that states the headline number up front, a proper metric
// grid with icons, and clearly separated positives/consider/suggestions
// sections instead of everything mashed into two half-width lists.

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const MetricIcon = {
  money: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M12 2v20M17 5.5c0-1.9-2.2-3.5-5-3.5S7 3.6 7 5.5 9.2 9 12 9s5 1.6 5 3.5-2.2 3.5-5 3.5-5-1.6-5-3.5" />
    </svg>
  ),
  trend: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M3 17l6-6 4 4 8-8M21 7v6h-6" />
    </svg>
  ),
  pin: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M12 21s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.3" />
    </svg>
  ),
  users: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20a6.5 6.5 0 0113 0M16 8.2a3 3 0 110 5.8M17 14a6.5 6.5 0 016.5 6" />
    </svg>
  ),
  clock: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  ),
  scale: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M12 3v18M7 8l-4 6a4 4 0 008 0l-4-6zM17 8l-4 6a4 4 0 008 0l-4-6zM7 8h10M9 21h6" />
    </svg>
  ),
  wallet: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <rect x="2.5" y="6" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19M16 15h2.5" />
    </svg>
  ),
  compass: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-6 2 2-6z" />
    </svg>
  ),
  spark: (p: { className?: string }) => (
    <svg {...iconProps} fill="currentColor" stroke="none" className={p.className}>
      <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
    </svg>
  ),
};

export type AnalysisMetric = {
  key: string;
  label: string;
  value: string;
  icon: keyof typeof MetricIcon;
  /** Picks the accent tile out for emphasis - use for the one number that
   *  matters most (the rent suggestion), not every metric. */
  featured?: boolean;
};

export function AIAnalysisCard({
  summary,
  metrics,
  positives,
  consider,
  suggestions,
  source,
  marketNote,
}: {
  summary: string;
  metrics: AnalysisMetric[];
  positives: string[];
  consider: string[];
  suggestions?: string[];
  /** "ai" once the real model is wired up, "demo" for the researched
   *  fallback estimate this build ships with. */
  source: "ai" | "demo";
  /** Optional one-line "why this number" context, e.g. the city market
   *  summary the rent suggestion was pulled from. */
  marketNote?: string;
}) {
  const featured = metrics.find((m) => m.featured);
  const rest = metrics.filter((m) => !m.featured);

  return (
    <div className="overflow-hidden rounded-3xl border border-brand-border bg-white shadow-sm">
      <div className="bg-gradient-to-br from-brand-blue to-brand-blue-dark px-6 py-5 text-white sm:px-7">
        <div className="flex flex-wrap items-center gap-2">
          <MetricIcon.spark className="h-4 w-4 text-brand-gold" />
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/80">
            Buynidify AI analysis
          </span>
          <span
            className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              source === "ai" ? "bg-emerald-400/20 text-emerald-200" : "bg-white/15 text-white/70"
            }`}
          >
            {source === "ai" ? "AI-generated" : "Estimated"}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/90">{summary}</p>

        {featured && (
          <div className="mt-4 inline-flex items-baseline gap-2 rounded-2xl bg-white/10 px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
              {featured.label}
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight text-white">
              {featured.value}
            </span>
          </div>
        )}
      </div>

      {marketNote && (
        <p className="border-b border-brand-border bg-brand-surface px-6 py-3 text-xs leading-relaxed text-brand-muted sm:px-7">
          {marketNote}
        </p>
      )}

      <div className="grid grid-cols-2 gap-px bg-brand-border sm:grid-cols-3">
        {rest.map((m) => {
          const Icon = MetricIcon[m.icon];
          return (
            <div key={m.key} className="flex items-center gap-3 bg-white p-4">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                  {m.label}
                </p>
                <p className="truncate text-sm font-semibold text-brand-ink">{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-7">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Positives
          </p>
          <ul className="mt-2 space-y-1.5">
            {positives.map((i) => (
              <li key={i} className="text-sm leading-snug text-brand-ink">
                {i}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Consider
          </p>
          <ul className="mt-2 space-y-1.5">
            {consider.map((i) => (
              <li key={i} className="text-sm leading-snug text-brand-ink">
                {i}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="border-t border-brand-border bg-brand-blue-light/40 p-6 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-blue">
            Suggested next steps
          </p>
          <ul className="mt-2 space-y-1.5">
            {suggestions.map((i) => (
              <li key={i} className="text-sm leading-snug text-brand-ink">
                {i}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="border-t border-brand-border px-6 py-3 text-[11px] italic text-brand-muted sm:px-7">
        An estimate only, not financial or legal advice.
      </p>
    </div>
  );
}

export { MetricIcon };
