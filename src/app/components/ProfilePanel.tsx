import type { PartyProfile } from "../utils/profiles";
import ProfileBody, { ProfileHeader } from "./ProfileBody";

// Slides in from the right so you keep your place in the list behind it.
// Same panel for both sides - a tenant looking at an investor sees the same
// shape of information an investor sees looking at a tenant.
export default function ProfilePanel({
  profile,
  contextLabel,
  onClose,
  onConnect,
  connected,
  isYou,
  onViewYourListing,
}: {
  profile: PartyProfile;
  contextLabel: string;
  onClose: () => void;
  onConnect: () => void;
  connected: boolean;
  isYou?: boolean;
  onViewYourListing?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden />
      <aside className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-brand-border bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-brand-border p-5">
          <ProfileHeader profile={profile} isYou={isYou} />
          <button type="button" onClick={onClose} aria-label="Close" className="text-brand-muted hover:text-brand-ink">
            ✕
          </button>
        </div>

        <div className="flex-1 p-5">
          <ProfileBody profile={profile} />
        </div>

        <div className="border-t border-brand-border p-5">
          <p className="mb-2 text-xs text-brand-muted">{contextLabel}</p>
          {isYou ? (
            <button
              type="button"
              onClick={onViewYourListing}
              className="w-full rounded-lg bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              Manage in My Properties
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              disabled={connected}
              className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                connected
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-brand-blue text-white hover:bg-brand-blue-dark"
              }`}
            >
              {connected ? "Connection request sent ✓" : "Connect via Buynidify"}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
