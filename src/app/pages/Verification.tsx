import { useRole } from "../context/RoleContext";
import {
  investorVerificationChecks,
  tenantVerificationChecks,
  type VerificationCheck,
} from "../data/mockData";

const statusStyles: Record<VerificationCheck["status"], string> = {
  verified: "bg-emerald-100 text-emerald-700",
  pending: "bg-brand-gold/20 text-brand-gold-dark",
  "needs-review": "bg-red-100 text-red-600",
};

const statusLabel: Record<VerificationCheck["status"], string> = {
  verified: "✓ Verified",
  pending: "Pending",
  "needs-review": "! Needs Review",
};

export default function Verification() {
  const { role } = useRole();
  const checks = role === "investor" ? investorVerificationChecks : tenantVerificationChecks;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        Verification
      </h1>
      <p className="mt-1 max-w-2xl text-brand-muted">
        These checks build trust across the platform. In this demo they're
        presentational only, no real identity, affordability, or AML checks
        run behind them yet.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {checks.map((check) => (
          <div key={check.id} className="rounded-2xl border border-brand-border bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-base font-semibold text-brand-ink">
                {check.label}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[check.status]}`}
              >
                {statusLabel[check.status]}
              </span>
            </div>
            <p className="mt-2 text-sm text-brand-muted">{check.detail}</p>
            {check.status !== "verified" && (
              <button className="mt-3 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
                {check.status === "pending" ? "Check status" : "Complete now"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
