import { Link } from "react-router-dom";
import { ArrowRightIcon, ZapIcon } from "../components/icons";

// Véta's ask, verbatim: "we should ... feature three AI solutions on our
// website: AI-powered real estate analysis, Relocate AI, and 24/7 AI
// support." None of the three had a proper landing-page presence before -
// analysis and support only ever showed up once you were signed into the
// app, and Relocate AI was a single line under a photo (see RelocationAI.tsx
// just above, redesigned separately). This section puts all three together
// as one confident "three AI solutions" showcase, each with a small,
// specific mockup grounded in what that feature actually renders elsewhere
// in the product - not generic "AI-powered" marketing copy.

function SparkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
    </svg>
  );
}

function TrendIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 17l6-6 4 4 8-8M21 7v6h-6" />
    </svg>
  );
}

function CompassIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-6 2 2-6z" strokeLinejoin="round" />
    </svg>
  );
}

function HeadsetIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" className={className}>
      <path d="M12 2a7 7 0 00-7 7v3M12 2a7 7 0 017 7v3" />
      <rect x="2" y="12" width="5" height="7" rx="1.5" />
      <rect x="17" y="12" width="5" height="7" rx="1.5" />
      <path d="M19 19v1a3 3 0 01-3 3h-3" />
    </svg>
  );
}

export default function AISolutions() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col items-center text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
            Built on AI
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
            Three AI Solutions, One Platform
          </h2>
          <p className="mt-3 max-w-2xl text-brand-muted">
            Buynidify isn't a listings board with a chatbot bolted on. Every property, every move,
            and every issue is backed by a purpose-built AI - here's what each one actually does.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 1. AI-Powered Real Estate Analysis */}
          <div className="group flex flex-col rounded-3xl border border-brand-border bg-brand-surface p-7 transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue hover:shadow-xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-brand-gold transition-transform duration-200 group-hover:scale-110">
              <TrendIcon />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-brand-ink">
              AI-Powered Real Estate Analysis
            </h3>
            <p className="mt-2 text-sm text-brand-muted">
              Every listing gets a real analysis, not a generic score: gross rental yield against
              the local market average, an editable return calculator, and a full Stamp Duty Land
              Tax breakdown using actual gov.uk bands.
            </p>

            {/* Mini mockup: the analysis card's own header + metrics, condensed. */}
            <div className="mt-5 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
              <div className="flex items-center gap-2 bg-gradient-to-br from-brand-blue to-brand-blue-dark px-4 py-3">
                <SparkIcon className="h-3.5 w-3.5 text-brand-gold" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/80">
                  Buynidify AI analysis
                </span>
                <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase text-white/70">
                  AI
                </span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-brand-border">
                <div className="bg-white p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-muted">Gross yield</p>
                  <p className="mt-0.5 text-base font-bold text-brand-gold-dark">6.8%</p>
                  <span className="mt-1 inline-block rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700">
                    Above market
                  </span>
                </div>
                <div className="bg-white p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-muted">Est. SDLT</p>
                  <p className="mt-0.5 text-base font-bold text-brand-ink">£12,500</p>
                  <p className="mt-1 text-[8px] text-brand-muted">Standard scenario</p>
                </div>
              </div>
              <div className="space-y-1 px-4 py-3 text-[10px] leading-relaxed text-brand-muted">
                <div className="flex items-center justify-between">
                  <span>This property</span>
                  <span className="font-semibold text-brand-ink">6.8%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-border">
                  <div className="h-full w-[85%] rounded-full bg-brand-gold" />
                </div>
              </div>
            </div>

            <Link
              to="/search"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
            >
              See it on a live listing
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 2. Relocate AI */}
          <div className="group flex flex-col rounded-3xl border border-brand-border bg-brand-surface p-7 transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue hover:shadow-xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-brand-gold transition-transform duration-200 group-hover:scale-110">
              <CompassIcon />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-brand-ink">
              Relocate AI
            </h3>
            <p className="mt-2 text-sm text-brand-muted">
              Linda, our relocation concierge, guides international movers through where to live,
              what it costs, and the visa route that applies to them - then shortlists real homes
              with an AI fit score for each one.
            </p>

            {/* Mini mockup: a condensed chat bubble exchange, Linda's voice. */}
            <div className="mt-5 overflow-hidden rounded-2xl border border-[#0d2444] bg-[#071a33] p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-ink">
                  L
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-white/60">Linda · Relocate AI</span>
              </div>
              <div className="space-y-2">
                <div className="max-w-[90%] rounded-xl bg-white/10 px-3 py-2 text-[11px] leading-snug text-white">
                  Manchester - good choice. A 1-bed runs £900-£1,400/month.
                </div>
                <div className="ml-auto max-w-[75%] rounded-xl bg-brand-gold px-3 py-2 text-[11px] font-medium leading-snug text-brand-ink">
                  Perfect, show me homes
                </div>
              </div>
            </div>

            <a
              href="/relocate-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
            >
              <ZapIcon className="h-3.5 w-3.5" />
              Launch Relocate AI
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* 3. 24/7 AI Support */}
          <div className="group flex flex-col rounded-3xl border border-brand-border bg-brand-surface p-7 transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue hover:shadow-xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-brand-gold transition-transform duration-200 group-hover:scale-110">
              <HeadsetIcon />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-brand-ink">
              24/7 AI Support
            </h3>
            <p className="mt-2 text-sm text-brand-muted">
              Emil triages any issue the moment it's raised - a maintenance problem, a tenant
              complaint, a management question - logs it, coordinates the fix, and keeps everyone
              posted until it's resolved.
            </p>

            {/* Mini mockup: Emil's acknowledgment message, same shape as Support.tsx. */}
            <div className="mt-5 rounded-2xl border border-brand-border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white">
                  E
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-ink">
                    Emil
                    <span className="rounded-full bg-brand-blue-light px-1.5 py-0.5 text-[8px] font-bold uppercase text-brand-blue">AI</span>
                  </p>
                  <p className="text-[9px] text-brand-muted">Support agent</p>
                </div>
              </div>
              <p className="mt-2.5 rounded-xl bg-brand-surface px-3 py-2 text-[11px] leading-snug text-brand-ink">
                Don't worry, I'm coordinating this — I've logged the issue and I'm on it.
              </p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                ✓ Added to your request history
              </p>
            </div>

            <Link
              to="/app/support"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
            >
              See Emil in the app
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
            <p className="mt-1.5 text-[11px] text-brand-muted">
              Available to every signed-in tenant and investor account.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
