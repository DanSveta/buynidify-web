const steps = [
  {
    title: "1. Interest",
    description:
      "A tenant finds a home and shows interest, even before anyone owns it.",
  },
  {
    title: "2. Match",
    description:
      "An investor sees the demand and buys the property through our legal partners.",
  },
  {
    title: "3. Move in",
    description:
      "Lease signs on the platform, deposit converts, keys are handed over.",
  },
];

export default function HowItWorks() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        How It Works
      </h1>
      <p className="mt-1 text-brand-muted">
        Two people, one agreement. This is the whole idea, illustrated.
      </p>

      <div className="mt-8 flex items-center justify-center gap-0 rounded-2xl border border-brand-border bg-brand-surface py-16">
        <FlowPerson emoji="🏠" />
        <FlowArrow delay={0} />
        <FlowPerson emoji="🤝" />
        <FlowArrow delay={1.1} />
        <FlowPerson emoji="🔑" />
      </div>
      <p className="mt-3 text-center text-sm text-brand-muted">
        An investor buys the home a tenant already wants, then hands over the
        keys, all through Buynidify.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-brand-border bg-white p-5"
          >
            <p className="mb-1 font-semibold text-brand-ink">{step.title}</p>
            <p className="text-sm text-brand-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowPerson({ emoji }: { emoji: string }) {
  return (
    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-blue bg-white text-3xl">
      {emoji}
    </div>
  );
}

function FlowArrow({ delay }: { delay: number }) {
  return (
    <div className="relative mx-2 h-0.5 w-24 flex-shrink-0 bg-brand-border sm:w-32">
      <span
        className="absolute -top-1 h-2.5 w-2.5 animate-[travel_2.2s_ease-in-out_infinite] rounded-full bg-brand-blue"
        style={{ animationDelay: `${delay}s` }}
      />
      <style>{`
        @keyframes travel {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
