import { useState } from "react";
import PublicShell from "./PublicShell";

// Corporate used to be a third "login" scenario that dropped you into a
// dashboard shell pretending to be a company account. Véta's call: nobody
// should "sign in" as a company here - it's a real B2B offering (relocating
// employees, housing them in bulk, one bill, one point of contact), so it
// gets a proper public page explaining the service, same shape as Partners,
// ending in "talk to us" rather than a fake logged-in product.

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Icon = {
  building: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M15 21h5v-9l-5-3" />
      <path d="M8 7h.01M11.5 7h.01M8 10.5h.01M11.5 10.5h.01M8 14h.01M11.5 14h.01" />
    </svg>
  ),
  users: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M2.5 19.5c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <path d="M16 8.7a3 3 0 1 1 1.6 5.6M21 19.5c0-2.7-1.9-4.7-4.6-5.3" />
    </svg>
  ),
  chart: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M2.5 20h19" />
    </svg>
  ),
  shield: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M12 3 4 6.5v5C4 16.7 7.4 21 12 22c4.6-1 8-5.3 8-10.5v-5L12 3Z" />
      <path d="m8.5 12 2.5 2.5L16 9" />
    </svg>
  ),
  bolt: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  ),
  headset: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
      <path d="M19.5 19v.5a3 3 0 0 1-3 3H13" />
    </svg>
  ),
  doc: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M7 3h7l4 4v14H7Z" />
      <path d="M14 3v4h4M9.5 13h5M9.5 16.5h5" />
    </svg>
  ),
};

const benefits = [
  {
    title: "One dashboard, every employee",
    description: "Housing status, city, cost and lease dates for your whole relocating team in one place.",
    icon: Icon.chart,
  },
  {
    title: "AI-matched housing at scale",
    description: "The same AI matching Buynidify uses for individuals, applied across dozens of employees at once.",
    icon: Icon.bolt,
  },
  {
    title: "Compliance handled",
    description: "Right-to-rent checks, deposit protection and tenancy paperwork done properly for every placement.",
    icon: Icon.shield,
  },
];

const steps = [
  {
    title: "Tell us about your team",
    description: "How many employees, which cities, what timeline and budget - a short form to start the conversation.",
    icon: Icon.doc,
  },
  {
    title: "We set up your programme",
    description: "A dedicated account manager agrees terms, budgets and approval flow with you before anything goes live.",
    icon: Icon.building,
  },
  {
    title: "Employees get housed",
    description: "Each employee gets matched, verified and moved in - you approve budgets and see it all on one dashboard.",
    icon: Icon.users,
  },
];

const included = [
  "Bulk housing search across every Buynidify city",
  "A dedicated account manager, not a support queue",
  "Consolidated billing - one invoice, not one per employee",
  "Approval workflow: an employee requests, you approve the budget",
  "Reporting: cost by location, leases coming up for renewal, open requests",
  "24/7 AI support for every employee you house",
];

const fieldClass =
  "w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none transition-colors focus:border-brand-blue";

export default function Corporate() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <PublicShell active="corporate">
      <div>
        {/* Hero */}
        <div className="overflow-hidden rounded-3xl bg-brand-ink px-6 py-14 text-center sm:px-14 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-gold">
            For companies
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Relocating your team? We'll house them.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-white/75">
            Moving employees to a new UK city means finding each of them somewhere to live - fast,
            compliant, and within budget. Buynidify does that at scale, with one dashboard for the
            whole team instead of dozens of separate searches.
          </p>
          <a
            href="#demo"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-gold px-7 py-3 text-sm font-semibold text-brand-ink transition-colors hover:bg-white"
          >
            Request a demo
          </a>
        </div>

        {/* Benefits strip */}
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-start gap-4 rounded-2xl border border-brand-border bg-white p-5">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue">
                <b.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-brand-ink">{b.title}</p>
                <p className="mt-1 text-sm text-brand-muted">{b.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Who this is for */}
        <h2 className="mt-16 text-center font-display text-2xl font-semibold tracking-tight text-brand-ink">
          Built for teams, not just individuals
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-brand-muted">
          Whether it's 5 new hires moving to Manchester or 50 people relocating for a new office,
          the same process scales - one setup, then every employee goes through it.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {included.map((line) => (
            <div key={line} className="flex items-start gap-2.5 rounded-xl border border-brand-border bg-white p-4">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue">
                <svg viewBox="0 0 20 20" className="h-3 w-3 text-brand-gold" fill="currentColor">
                  <path d="M7.6 13.4 4 9.8l1.2-1.2 2.4 2.4 6.8-6.8L15.6 5.4z" />
                </svg>
              </span>
              <p className="text-sm text-brand-ink">{line}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <h2 className="mt-16 text-center font-display text-2xl font-semibold tracking-tight text-brand-ink">
          How it works
        </h2>
        <div className="relative mt-8 grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-brand-border md:block" />
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative flex flex-col rounded-3xl border border-brand-border bg-brand-surface p-8 transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue hover:shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-brand-gold">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="font-display text-3xl font-semibold tracking-tight text-brand-gold">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold tracking-tight text-brand-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-brand-muted">{s.description}</p>
            </div>
          ))}
        </div>

        {/* Ongoing support callout */}
        <div className="mt-16 flex flex-col items-start gap-5 rounded-3xl border border-brand-border bg-white p-8 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
            <Icon.headset className="h-7 w-7" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-brand-ink">
              Support doesn't stop at move-in
            </p>
            <p className="mt-1 text-sm text-brand-muted">
              Every employee you house gets Buynidify's 24/7 AI support for the everyday stuff -
              maintenance, payments, lease questions - so your HR team isn't the one fielding those
              calls.
            </p>
          </div>
        </div>

        {/* Request a demo */}
        <div id="demo" className="mt-16 grid gap-8 scroll-mt-24 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-bold text-brand-gold-dark">
              Get started
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-brand-ink">
              Curious if this fits your team?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-muted">
              Tell us roughly how many people you're relocating and where. A member of the Buynidify
              team will walk you through pricing, timelines and how the approval workflow works for
              your company - no payment or contract here, just a conversation.
            </p>
          </div>

          <div className="h-fit rounded-3xl border border-brand-border bg-white p-7 shadow-lg">
            {submitted ? (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg viewBox="0 0 20 20" className="h-6 w-6" fill="currentColor">
                    <path d="M7.6 13.4 4 9.8l1.2-1.2 2.4 2.4 6.8-6.8L15.6 5.4z" />
                  </svg>
                </span>
                <p className="mt-4 font-display text-lg font-semibold text-brand-ink">
                  Thanks, we'll be in touch
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  A member of the Buynidify team will reach out shortly to walk through your team's
                  housing needs.
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-semibold text-brand-ink">Request a demo</p>
                <p className="mt-1 text-sm text-brand-muted">
                  Takes about a minute. We'll get back to you to discuss the details.
                </p>
                <form
                  className="mt-5 flex flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <input required placeholder="Company name" className={fieldClass} />
                  <input required type="email" placeholder="Work email" className={fieldClass} />
                  <input placeholder="Roughly how many employees need housing?" className={fieldClass} />
                  <input placeholder="Which cities?" className={fieldClass} />
                  <button
                    type="submit"
                    className="mt-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
                  >
                    Request a demo
                  </button>
                  <p className="text-[11px] text-brand-muted">
                    No payment or contract is taken here - this just starts the conversation.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
