import { useState } from "react";

const features = [
  {
    title: "One dashboard",
    description:
      "See every employee's housing status, location, and cost in one place.",
  },
  {
    title: "Simple approvals",
    description: "An employee requests housing, you approve the budget, done.",
  },
  {
    title: "Clear reporting",
    description:
      "Cost by location, leases coming up for renewal, requests still open.",
  },
];

export default function B2B() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        Housing for your team
      </h1>
      <p className="mt-1 max-w-xl text-brand-muted">
        Relocating employees to a new city? Buynidify handles the housing
        search, so your team doesn't have to.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-brand-border bg-white p-5"
          >
            <p className="mb-1 font-semibold text-brand-ink">{f.title}</p>
            <p className="text-sm text-brand-muted">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 max-w-lg rounded-2xl border border-brand-border bg-brand-surface p-6 text-center">
        {submitted ? (
          <>
            <p className="text-lg font-semibold text-brand-ink">
              Thanks, we'll be in touch
            </p>
            <p className="mt-1 text-sm text-brand-muted">
              A member of the Buynidify team will reach out shortly to walk
              through your team's housing needs.
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-brand-ink">
              Curious if this fits your team?
            </p>
            <p className="mt-1 text-sm text-brand-muted">
              Tell us a bit about what you need, we'll walk you through it.
            </p>
            <form
              className="mt-4 flex flex-col gap-3 text-left"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <input
                required
                placeholder="Company name"
                className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
              <input
                required
                type="email"
                placeholder="Work email"
                className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
              <input
                placeholder="Roughly how many employees need housing?"
                className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
              >
                Request a demo
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
