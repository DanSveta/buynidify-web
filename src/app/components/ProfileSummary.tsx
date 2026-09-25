import type { PartyProfile } from "../utils/profiles";
import { roleStyles } from "./ProfileBody";
import Avatar from "./Avatar";

// Compact profile for the Messages column. Same data as the full ProfilePanel,
// but laid out to be read in one go rather than scrolled: verification becomes
// a row of chips instead of a list, details are tight two-column rows, and the
// long reassurance paragraph shrinks to a single line at the foot.

function Chip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        ok ? "bg-emerald-100 text-emerald-700" : "bg-brand-surface text-brand-muted"
      }`}
    >
      {ok ? "✓" : "–"} {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-brand-border pt-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function ProfileSummary({
  profile,
  context,
  propertyHref,
}: {
  profile: PartyProfile;
  context?: string;
  propertyHref?: React.ReactNode;
}) {
  const allVerified =
    profile.verified.idCheck && profile.verified.referencing && profile.verified.funds;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Avatar name={profile.name} initials={profile.initials} photoUrl={profile.photoUrl} size="md" />
        <div className="min-w-0">
          <p className="font-display text-base font-semibold leading-tight text-brand-ink">
            {profile.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${roleStyles[profile.role]}`}>
              {profile.role}
            </span>
            {allVerified && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                ✓ Verified
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-brand-muted">
            {[profile.location, `Member since ${profile.memberSince}`].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-brand-ink">{profile.about}</p>

      {context && (
        <Section title="This conversation">
          <p className="text-xs font-medium text-brand-ink">{context}</p>
          {propertyHref}
        </Section>
      )}

      <Section title="Verification">
        <div className="flex flex-wrap gap-1.5">
          <Chip ok={profile.verified.idCheck} label="Identity" />
          <Chip
            ok={profile.verified.referencing}
            label={profile.role === "Tenant" ? "Referencing" : "Ownership"}
          />
          <Chip
            ok={profile.verified.funds}
            label={profile.role === "Tenant" ? "Income" : "Funds"}
          />
        </div>
      </Section>

      <Section title="Details">
        <dl className="grid gap-1">
          {profile.details.map((d) => (
            <div key={d.label} className="flex items-baseline justify-between gap-3">
              <dt className="text-[11px] text-brand-muted">{d.label}</dt>
              <dd className="text-right text-[11px] font-semibold text-brand-ink">{d.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <p className="border-t border-brand-border pt-3 text-[10px] leading-relaxed text-brand-muted">
        Replies {profile.responseTime} · {profile.responseRate} response rate. Contact details are
        shared through Buynidify only.
      </p>
    </div>
  );
}
