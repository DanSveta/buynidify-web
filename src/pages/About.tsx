import { Link } from "react-router-dom";
import PublicShell from "./PublicShell";

const values = [
  {
    title: "Three parties, one marketplace",
    description:
      "Buynidify connects people looking for a long-term rental, the investors who own the properties, and the service providers who keep a tenancy running - not just two sides of a listing.",
  },
  {
    title: "The full transaction, automated",
    description:
      "Order processing, secure payments and the paperwork in between are handled on the platform, so a deal moves forward on its own timeline instead of waiting on emails.",
  },
  {
    title: "AI where it saves real time",
    description:
      "AI agents handle property analysis and document management, and take over day-to-day questions with 24/7 support once a lease is signed - freeing the team to focus on the parts that need a person.",
  },
  {
    title: "A network, not a directory",
    description:
      "Virtual tours, document verification, legal services and post-move-in maintenance run through Buynidify's local partner network, so a deal doesn't stall waiting on someone to go find a tradesperson.",
  },
];

export default function About() {
  return (
    <PublicShell active="about">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-bold text-brand-gold-dark">
          About Buynidify
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Property investment, without the busywork
        </h1>
        <p className="mt-3 max-w-2xl text-brand-muted">
          We don't buy or sell property ourselves. Buynidify is a marketplace connecting three
          parties: people looking for a long-term rental, the real estate investors who own the
          properties, and the service providers who support a tenancy once it's running. Our goal
          is to digitise the whole workflow between them, with one automated platform for
          transactions, order processing and secure payments.
        </p>

        <h2 className="mt-12 font-display text-lg font-semibold text-brand-ink">How it works</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          An investor picks a property from their dashboard, gets an AI analysis of its likely
          yield, and finds a pre-vetted tenant before they've even completed the purchase. Once
          both sides are happy, a letter of intent is signed and the tenant places a deposit to
          confirm they're committed - which is what lets the investor go ahead with the purchase
          and have the property earning rent from day one.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-brand-muted">
          From there, Buynidify handles the rest: virtual property tours, document verification,
          legal services and, once someone's moved in, maintenance through our network of local
          partners. AI agents accelerate the parts that used to take days - analysis and document
          handling - and provide 24/7 support once a lease is signed. Tenants don't have to be
          individuals, either: companies looking for rental housing for their employees use
          Buynidify the same way.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-brand-border bg-white p-5">
              <p className="font-semibold text-brand-ink">{v.title}</p>
              <p className="mt-1 text-sm text-brand-muted">{v.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-brand-border bg-brand-surface p-6 text-center">
          <p className="font-display text-lg font-semibold text-brand-ink">
            Want to see it in action?
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            Paste a property link and get an AI analysis in seconds - no account needed to try it.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/search"
              className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              Try a property search
            </Link>
            <Link
              to="/partners"
              className="rounded-lg border border-brand-border px-5 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              Become a service partner
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
