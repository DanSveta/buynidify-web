import type { PartyProfile } from "../utils/profiles";

// The contents of a profile: identity, verification, details. Shared by the
// slide-in ProfilePanel and the profile column on the Messages page, so the
// two can't drift apart.

export const roleStyles: Record<PartyProfile["role"], string> = {
  Tenant: "bg-brand-gold text-brand-ink",
  Investor: "bg-brand-blue text-white",
  Corporate: "bg-brand-ink text-white",
};

function VerifiedRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          ok ? "bg-emerald-100 text-emerald-700" : "bg-brand-surface text-brand-muted"
        }`}
      >
        {ok ? "✓" : "–"}
      </span>
      <span className={ok ? "text-brand-ink" : "text-brand-muted"}>{label}</span>
    </li>
  );
}

export function ProfileHeader({
  profile,
  isYou,
  size = "lg",
}: {
  profile: PartyProfile;
  isYou?: boolean;
  size?: "lg" | "sm";
}) {
  const allVerified =
    profile.verified.idCheck && profile.verified.referencing && profile.verified.funds;

  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex flex-shrink-0 items-center justify-center rounded-full bg-brand-blue font-bold text-white ${
          size === "lg" ? "h-14 w-14 text-base" : "h-12 w-12 text-sm"
        }`}
      >
        {profile.initials}
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-lg font-semibold text-brand-ink">{profile.name}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${roleStyles[profile.role]}`}>
            {profile.role}
          </span>
          {allVerified && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              ✓ Verified
            </span>
          )}
          {isYou && (
            <span className="rounded-full bg-brand-blue-light px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
              You
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfileBody({ profile }: { profile: PartyProfile }) {
  return (
    <>
      <p className="text-sm text-brand-ink">{profile.about}</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Member since", profile.memberSince],
          ["Replies in", profile.responseTime],
          ["Response rate", profile.responseRate],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-brand-surface px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-brand-muted">{label}</p>
            <p className="text-xs font-semibold text-brand-ink">{value}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-brand-muted">Verification</h3>
      <ul className="mt-2 space-y-1.5">
        <VerifiedRow ok={profile.verified.idCheck} label="Identity verified" />
        <VerifiedRow
          ok={profile.verified.referencing}
          label={profile.role === "Tenant" ? "Referencing complete" : "Ownership confirmed"}
        />
        <VerifiedRow
          ok={profile.verified.funds}
          label={profile.role === "Tenant" ? "Proof of income" : "Proof of funds"}
        />
      </ul>

      <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-brand-muted">Details</h3>
      <dl className="mt-2 divide-y divide-brand-border">
        {profile.details.map((d) => (
          <div key={d.label} className="flex justify-between gap-4 py-2">
            <dt className="text-sm text-brand-muted">{d.label}</dt>
            <dd className="text-right text-sm font-medium text-brand-ink">{d.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 rounded-lg bg-brand-surface p-3 text-xs text-brand-muted">
        Contact details aren't shown. Connect through Buynidify and the team arranges introductions once both
        sides agree.
      </p>
    </>
  );
}
