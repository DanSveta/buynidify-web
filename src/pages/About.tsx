import { Link } from "react-router-dom";
import PublicShell from "./PublicShell";

const values = [
  {
    title: "Automated, end to end",
    description:
      "From an AI analysis of a pasted listing to a tenant moving in, the process runs through the platform - matching, terms, deposit and paperwork are coordinated for you, not chased over email.",
  },
  {
    title: "Verified on both sides",
    description:
      "Investors and tenants are identity-checked before a conversation starts, so every introduction Buynidify makes is between two real, verified people.",
  },
  {
    title: "Built around UK property",
    description:
      "Rightmove, Zoopla, OnTheMarket, PrimeLocation, stamp duty, EPC ratings, tenancy law - the platform is built for how property actually works in England, not a generic template.",
  },
  {
    title: "A network, not a directory",
    description:
      "Insurance, conveyancing, cleaning, removals and maintenance run through Buynidify's partner network, so a deal doesn't stall waiting on someone to go find a tradesperson.",
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
          Buynidify connects UK property investors with tenants and automates everything between an
          interesting listing and a signed tenancy: analysis, matching, terms, deposit and the
          services that come after. The goal is simple - a busy investor should be able to grow a
          rental portfolio without being present for any of it, and a tenant should be able to find
          somewhere to live without chasing agents for answers.
        </p>

        <h2 className="mt-12 font-display text-lg font-semibold text-brand-ink">What we're building</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Property investing is usually slow and manual: reading listings by hand, guessing at
          yields, waiting on replies, chasing solicitors and tradespeople separately. Buynidify's AI
          agent handles the analysis and coordination, and our team and partner network handle
          everything that still needs a human - so investors get the returns of active property
          management with the effort of a few clicks.
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
