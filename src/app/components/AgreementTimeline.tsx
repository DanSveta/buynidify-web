import {
  agreementSteps,
  actorForViewer,
  type Agreement,
  type AgreementActor,
} from "../context/ListingsContext";
import type { PartyProfile } from "../utils/profiles";
import Avatar from "./Avatar";

// The one place the deal's progress is drawn, used by My Properties, the
// Deal Tracker and the match detail panel alike, so the same deal never
// looks different depending on where you're looking at it from.
//
// Three things kept this confusing before:
//  1. Every step used the same visual whether it was waiting on you, on the
//     other person, or on Buynidify. Now Buynidify's own steps are visually
//     distinct (amber/red) - that's the platform team working in the
//     background, not something either side can act on, and it needs to
//     read as different at a glance.
//  2. "You" in the data always meant the investor, so a tenant looking at
//     their own deal saw it described from the wrong side. `actorForViewer`
//     re-reads it relative to whoever's actually looking.
//  3. There was nothing to look at except initials. Both people are shown
//     as photos at the top, side by side - who this deal is actually
//     between, at a glance.

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const demoLabel: Partial<Record<Agreement["stage"], string>> = {
  matched: "Buynidify confirms the match (demo)",
  "viewing-arranged": "Confirm the viewing took place (demo)",
  "terms-agreed": "Buynidify agrees terms with both sides (demo)",
  "agreement-signed": "Both sides sign the agreement (demo)",
  "deposit-secured": "Pay the deposit (demo)",
  "searches-survey": "Confirm searches & survey are back (demo)",
  "mortgage-finalised": "Confirm the mortgage is finalised (demo)",
  "contracts-exchanged": "Confirm contracts are exchanged (demo)",
  completion: "Confirm completion (demo)",
  "tenancy-prep": "Confirm the purchase is complete (demo)",
  "tenancy-active": "Buynidify completes tenancy prep (demo)",
};

/** Who actually does this step, regardless of who's looking at it right
 *  now - "You" in the step data always means the investor and "Tenant"
 *  always means the tenant, whichever persona happens to be signed in when
 *  it gets clicked. Attributing the history entry to the correct fixed role
 *  (rather than whoever's viewer role happened to press the button) is what
 *  lets "confirmed by Sam Carter" show up correctly even when it was Alex
 *  who clicked it while walking through both sides of the demo alone. */
function fixedActorFor(actor: (typeof agreementSteps)[number]["actor"]): AgreementActor {
  if (actor === "Buynidify") return "buynidify";
  if (actor === "Tenant") return "tenant";
  return "investor"; // "You" and "You and the tenant"
}

export default function AgreementTimeline({
  agreement,
  investor,
  tenant,
  viewerRole,
  onAdvance,
  compact = false,
}: {
  agreement: Agreement;
  investor: PartyProfile;
  tenant: PartyProfile;
  viewerRole: "investor" | "tenant";
  /** Omit for a read-only view (the worked example). */
  onAdvance?: (by: AgreementActor) => void;
  /** A shorter rendering for embedding inside a card that already has its
   *  own property header. */
  compact?: boolean;
}) {
  const currentIndex = agreementSteps.findIndex((s) => s.id === agreement.stage);
  const current = agreementSteps[currentIndex];
  const next = agreementSteps[currentIndex + 1];
  const historyFor = (stage: string) => agreement.history?.find((h) => h.stage === stage);
  const otherName = viewerRole === "investor" ? tenant.name : investor.name;

  const nextActor = next ? actorForViewer(next.actor, viewerRole) : "done";

  function advance(by: AgreementActor) {
    onAdvance?.(by);
  }

  return (
    <div className={compact ? "" : "rounded-2xl border border-brand-border bg-white p-5"}>
      {/* Both parties, "doing this together". */}
      <div className="flex items-center gap-3">
        <div className="flex items-center -space-x-3">
          <Avatar
            name={investor.name}
            initials={investor.initials}
            photoUrl={investor.photoUrl}
            size="md"
            ring="ring-4 ring-white"
          />
          <Avatar
            name={tenant.name}
            initials={tenant.initials}
            photoUrl={tenant.photoUrl}
            size="md"
            ring="ring-4 ring-white"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-ink">
            {investor.name} <span className="font-normal text-brand-muted">(investor)</span>
            {" · "}
            {tenant.name} <span className="font-normal text-brand-muted">(tenant)</span>
          </p>
          <p className="text-xs text-brand-muted">
            Started {formatDate(agreement.startedAt)} · you're the {viewerRole}
          </p>
        </div>
      </div>

      {/* Where things stand right now. */}
      <div className="mt-4 rounded-xl bg-brand-surface p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
          Current stage
        </p>
        <p className="mt-1 font-display text-base font-semibold text-brand-ink">{current.label}</p>
        <p className="mt-0.5 text-xs text-brand-muted">{current.detail}</p>

        {next && (
          <div className="mt-3 border-t border-brand-border pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Next: {next.label}
            </p>
            <p className="mt-1 text-xs text-brand-muted">
              {nextActor === "you" && "Your turn."}
              {nextActor === "them" &&
                `Waiting on ${otherName} - you can continue for them here to keep the demo moving.`}
              {nextActor === "both" && "Both sides need to sign off - continuing for both in this demo."}
              {nextActor === "buynidify" && (
                <span>
                  <span className="font-semibold text-red-600">Buynidify</span> is handling this step,
                  not you or {otherName}.
                </span>
              )}
            </p>
            {/* Always actionable, even when it's "waiting" on someone else -
             *  this is a solo demo of both sides, so nothing should be a
             *  dead end just because it isn't technically your turn. The
             *  history still records the step against whoever really does
             *  it (fixedActorFor), not whoever happened to click. */}
            {onAdvance && (
              <button
                type="button"
                onClick={() => advance(fixedActorFor(next.actor))}
                className={`mt-2 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  nextActor === "buynidify"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-brand-blue text-white hover:bg-brand-blue-dark"
                }`}
              >
                {demoLabel[next.id] ?? `Mark "${next.label}" done (demo)`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* The whole timeline, colour-coded by who it waits on. */}
      <ol className="mt-4 space-y-2">
        {agreementSteps.map((step, i) => {
          const done = i < currentIndex || (i === currentIndex && !next);
          const isCurrent = i === currentIndex;
          const rel = actorForViewer(step.actor, viewerRole);
          const entry = historyFor(step.id);
          return (
            <li key={step.id} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  done
                    ? "bg-emerald-100 text-emerald-700"
                    : isCurrent
                      ? "bg-brand-blue text-white"
                      : rel === "buynidify"
                        ? "bg-red-50 text-red-400"
                        : "bg-brand-surface text-brand-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`text-sm ${
                      isCurrent ? "font-semibold text-brand-ink" : done ? "text-brand-ink" : "text-brand-muted"
                    }`}
                  >
                    {step.label}
                  </span>
                  {rel === "buynidify" && (
                    <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600">
                      Buynidify
                    </span>
                  )}
                </span>
                {entry && (
                  <span className="block text-[11px] text-brand-muted">
                    {formatDate(entry.at)}
                    {entry.by !== "buynidify" && ` · confirmed by ${entry.by === "investor" ? investor.name : tenant.name}`}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      {!next && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-700">
          Tenancy active - rent is being collected.
        </p>
      )}
    </div>
  );
}
