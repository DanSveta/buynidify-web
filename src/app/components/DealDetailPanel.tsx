import type { Agreement, AgreementActor } from "../context/ListingsContext";
import type { PartyProfile } from "../utils/profiles";
import { avatarFor } from "../utils/avatars";
import AgreementTimeline from "./AgreementTimeline";

// The full deal view, shared by the Deal Tracker and Mutual Matches so a
// matched connection opens straight into its real progress instead of
// bouncing to another page just to show the same card again.

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export type DealCard = {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  price: number;
  agreement: Agreement;
  investor: PartyProfile;
  tenant: PartyProfile;
  isExample: boolean;
  /** Missing for the example deal - it's read-only. */
  onAdvance?: (by: AgreementActor) => void;
};

/** A tenant chosen from the seeded "other people interested" list, not this
 *  browser's own persona - there's no full profile stored for them, so this
 *  is built from what the agreement does know (name, initials) rather than
 *  showing nothing. */
export function fallbackTenantProfile(agreement: Agreement): PartyProfile {
  return {
    id: `tenant-${agreement.tenantId}`,
    name: agreement.tenantName,
    initials: agreement.tenantInitials,
    role: "Tenant",
    location: "",
    memberSince: "",
    responseTime: "",
    responseRate: "",
    photoUrl: avatarFor(agreement.tenantName),
    verified: { idCheck: true, referencing: true, funds: true },
    about: "",
    details: [],
  };
}

export default function DealDetailPanel({
  deal,
  viewerRole,
  onClose,
}: {
  deal: DealCard;
  viewerRole: "investor" | "tenant";
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-brand-border p-5">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold leading-tight text-brand-ink">{deal.title}</p>
            <p className="truncate text-sm text-brand-muted">{deal.location}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex-shrink-0 text-brand-muted hover:text-brand-ink">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <img src={deal.imageUrl} alt="" className="h-48 w-full rounded-xl object-cover" />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-brand-muted">
              {gbp.format(deal.price)}
              {deal.isExample && (
                <span className="ml-2 rounded-full bg-brand-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-gold-dark">
                  Worked example
                </span>
              )}
            </p>
          </div>
          <div className="mt-5">
            <AgreementTimeline
              agreement={deal.agreement}
              investor={deal.investor}
              tenant={deal.tenant}
              viewerRole={viewerRole}
              onAdvance={deal.onAdvance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
