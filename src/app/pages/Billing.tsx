export default function Billing() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        Billing
      </h1>
      <p className="mt-1 text-brand-muted">
        Your subscription and payment method.
      </p>

      <div className="mt-8 flex flex-col gap-6 sm:flex-row">
        <div className="flex-1 rounded-2xl border border-brand-border bg-white p-5">
          {[
            ["Plan", "Premium"],
            ["Status", "● Active"],
            ["Renews", "4 Oct 2026"],
            ["Amount", "£49.00 / month"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-brand-border py-2.5 text-sm last:border-b-0"
            >
              <span className="text-brand-muted">{label}</span>
              <span
                className={
                  label === "Status" ? "font-medium text-emerald-600" : "text-brand-ink"
                }
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-shrink-0">
          <div className="w-72 rounded-2xl border border-brand-blue bg-gradient-to-br from-brand-blue-dark to-brand-ink p-5 font-mono text-white">
            <p className="mb-5 text-xs tracking-widest text-brand-gold">
              VISA
            </p>
            <p className="mb-4 text-base tracking-widest">
              •••• •••• •••• 4242
            </p>
            <div className="flex justify-between text-[11px] text-white/70">
              <span>CARD ON FILE</span>
              <span>08/29</span>
            </div>
          </div>
          <button className="mt-3 w-full rounded-lg border border-brand-border py-2 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
            Update card
          </button>
        </div>
      </div>
    </div>
  );
}
