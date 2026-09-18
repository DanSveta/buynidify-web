// Copied field-for-field from the live buynidify.eu marketplace: clicking
// "Connect via Buynidify" opens this confirmation explaining what the team
// does next, rather than firing anything immediately.
const steps = [
  "Verify the tenant's details and rental criteria",
  "Share your property details with the tenant",
  "Arrange a call between both parties",
  "Support the pre-agreement process if there's a match",
];

export default function ConnectTenantModal({
  propertyTitle,
  onCancel,
  onConfirm,
}: {
  propertyTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-2xl">
        <h3 className="font-display text-xl font-semibold text-brand-ink">Connect with this tenant</h3>
        <p className="mt-1 text-sm text-brand-muted">{propertyTitle}</p>

        <p className="mt-4 text-sm font-semibold text-brand-ink">The Buynidify team will:</p>
        <ul className="mt-2 space-y-2">
          {steps.map((step) => (
            <li key={step} className="flex gap-2 text-sm text-brand-ink">
              <span aria-hidden className="flex-shrink-0 text-brand-blue">
                →
              </span>
              {step}
            </li>
          ))}
        </ul>

        <p className="mt-4 rounded-lg bg-brand-surface p-3 text-xs text-brand-muted">
          No personal contact details are shared without consent from both parties.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-brand-border px-4 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Send connection request
          </button>
        </div>
      </div>
    </div>
  );
}
