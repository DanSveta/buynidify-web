import { useState } from "react";
import PublicShell from "./PublicShell";

// The page Andrew flagged as missing: local service businesses (insurance,
// conveyancing, cleaning, removals, trades) applying to become a Buynidify
// partner, so they get a steady stream of referrals through the platform's
// AI-automated process instead of chasing leads themselves.

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Icon = {
  shield: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M12 3 4 6.5v5C4 16.7 7.4 21 12 22c4.6-1 8-5.3 8-10.5v-5L12 3Z" />
      <path d="m8.5 12 2.5 2.5L16 9" />
    </svg>
  ),
  scale: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M12 3v18M7 21h10M12 3 5 7l3.2 6.4a3.6 3.6 0 0 0 6.4 0L18 7l-6-4Z" />
    </svg>
  ),
  sparkle: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className} fill="currentColor" stroke="none">
      <path d="M12 2.5 13.9 9l6.5 1.9-6.5 1.9L12 19.3 10.1 12.8 3.6 10.9 10.1 9z" />
    </svg>
  ),
  truck: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M3 16V6h11v10M14 9h4l3 3.5V16h-7" />
      <circle cx="7.5" cy="17.5" r="1.7" />
      <circle cx="17" cy="17.5" r="1.7" />
    </svg>
  ),
  sofa: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
      <path d="M3.5 12h17v4a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16v-4Z" />
      <path d="M5 17.5V20M19 17.5V20" />
    </svg>
  ),
  wrench: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2-2 2.7-2.7Z" />
    </svg>
  ),
  doc: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M7 3h7l4 4v14H7Z" />
      <path d="M14 3v4h4M9.5 13h5M9.5 16.5h5" />
    </svg>
  ),
  bolt: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  ),
  users: (p: { className?: string }) => (
    <svg {...iconProps} className={p.className}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M2.5 19.5c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <path d="M16 8.7a3 3 0 1 1 1.6 5.6M21 19.5c0-2.7-1.9-4.7-4.6-5.3" />
    </svg>
  ),
};

const categories = [
  {
    title: "Property insurance",
    description: "Buildings and contents cover for buy-to-let and owner-occupied homes.",
    icon: Icon.shield,
  },
  {
    title: "Conveyancing & legal",
    description: "Solicitors and licensed conveyancers handling the purchase paperwork.",
    icon: Icon.scale,
  },
  {
    title: "Cleaning",
    description: "End-of-tenancy, move-in and regular cleaning services.",
    icon: Icon.sparkle,
  },
  {
    title: "Removals & moving",
    description: "Removals firms helping tenants and buyers move in.",
    icon: Icon.truck,
  },
  {
    title: "Furniture delivery & assembly",
    description: "Delivery, assembly and furnishing for move-in ready homes.",
    icon: Icon.sofa,
  },
  {
    title: "Plumbing & appliance repair",
    description: "Plumbers, appliance engineers and general maintenance trades.",
    icon: Icon.wrench,
  },
];

const steps = [
  {
    title: "Tell us about your company",
    description: "Fill in the form below with your company details and the areas you cover.",
    icon: Icon.doc,
  },
  {
    title: "We verify and agree terms",
    description: "Buynidify confirms your details and discusses terms and technical setup with you.",
    icon: Icon.shield,
  },
  {
    title: "Start receiving referrals",
    description:
      "Our AI agent sends you a steady stream of jobs and automates the process end to end - from taking the request to collecting payment.",
    icon: Icon.bolt,
  },
];

const benefits = [
  {
    title: "No lead-gen cost",
    description: "Referrals come from properties already moving through the platform - nothing to bid on or chase.",
    icon: Icon.bolt,
  },
  {
    title: "Verified requests only",
    description: "Every job comes from an identity-checked investor or tenant already in an active deal.",
    icon: Icon.shield,
  },
  {
    title: "Payment handled for you",
    description: "Buynidify's AI agent takes the request, coordinates the job and collects payment automatically.",
    icon: Icon.users,
  },
];

const activityOptions = [
  "Property insurance",
  "Conveyancing & legal",
  "Cleaning",
  "Removals & moving",
  "Furniture delivery & assembly",
  "Plumbing & appliance repair",
  "Home appliances & maintenance",
  "Other",
];

const fieldClass =
  "w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-ink outline-none transition-colors focus:border-brand-blue";

export default function Partners() {
  const [submitted, setSubmitted] = useState(false);
  const [confirmedEngland, setConfirmedEngland] = useState(false);

  return (
    <PublicShell active="partners">
      <div>
        {/* Hero */}
        <div className="overflow-hidden rounded-3xl bg-brand-blue px-6 py-14 text-center sm:px-14 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-gold">
            Partner programme
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Become a Buynidify partner
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-white/75">
            If your company provides insurance, conveyancing, cleaning, removals, furniture or trade
            services in England, we send you a steady stream of verified clients - and automate the
            job, from request to payment.
          </p>
          <a
            href="#apply"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-gold px-7 py-3 text-sm font-semibold text-brand-ink transition-colors hover:bg-white"
          >
            Apply to partner
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
          Who this is for
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-brand-muted">
          Six categories cover most of what a property needs to change hands or house a tenant -
          don't see yours? There's an "Other" option in the form.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.title}
              className="group rounded-2xl border border-brand-border bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-brand-gold transition-transform duration-200 group-hover:scale-110">
                <c.icon className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-base font-semibold text-brand-ink">{c.title}</p>
              <p className="mt-1.5 text-sm text-brand-muted">{c.description}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <h2 className="mt-16 text-center font-display text-2xl font-semibold tracking-tight text-brand-ink">
          How it works
        </h2>
        <div className="relative mt-8 grid gap-6 md:grid-cols-3">
          {/* Connecting line behind the cards on desktop, echoing the numbered
              flow rather than just three disconnected boxes. */}
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

        {/* Application */}
        <div id="apply" className="mt-16 grid gap-8 scroll-mt-24 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-bold text-brand-gold-dark">
              Apply
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-brand-ink">
              Ready to get started?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-muted">
              Fill in your company details and the areas you cover. A member of the Buynidify team
              reviews every application and reaches out to confirm your details and agree terms before
              anything goes live - no payment or contract is taken here.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-brand-ink">
              {[
                "No cost to apply, no obligation to accept a job",
                "Jobs come from real, active deals already on the platform",
                "Technical setup and payment collection handled by Buynidify",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue">
                    <svg viewBox="0 0 20 20" className="h-3 w-3 text-brand-gold" fill="currentColor">
                      <path d="M7.6 13.4 4 9.8l1.2-1.2 2.4 2.4 6.8-6.8L15.6 5.4z" />
                    </svg>
                  </span>
                  {line}
                </li>
              ))}
            </ul>
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
                  A member of the Buynidify team will review your details and reach out to discuss terms
                  and the technical side of getting your company connected.
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-semibold text-brand-ink">Apply to become a partner</p>
                <p className="mt-1 text-sm text-brand-muted">
                  Takes about a minute. We'll get back to you to discuss terms.
                </p>
                <form
                  className="mt-5 flex flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <input required placeholder="Company name" className={fieldClass} />
                  <select required defaultValue="" className={`${fieldClass} cursor-pointer`}>
                    <option value="" disabled>
                      Type of activity
                    </option>
                    {activityOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input required placeholder="Contact name" className={fieldClass} />
                    <input required type="tel" placeholder="Phone number" className={fieldClass} />
                  </div>
                  <input required type="email" placeholder="Work email" className={fieldClass} />
                  <input placeholder="Which areas of England do you cover?" className={fieldClass} />
                  <label className="flex items-start gap-2 text-xs text-brand-muted">
                    <input
                      required
                      type="checkbox"
                      checked={confirmedEngland}
                      onChange={(e) => setConfirmedEngland(e.target.checked)}
                      className="mt-0.5"
                    />
                    I confirm this business operates in England.
                  </label>
                  <button
                    type="submit"
                    className="mt-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
                  >
                    Submit application
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
