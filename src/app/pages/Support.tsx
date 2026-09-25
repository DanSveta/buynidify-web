import { useMemo, useState } from "react";
import { useRole } from "../context/RoleContext";
import { useListings, type ImportedProperty } from "../context/ListingsContext";
import { AGENT_NAME, AGENT_ROLE, supportReply } from "../../lib/supportAgent";
import { avatarFor } from "../utils/avatars";
import Avatar from "../components/Avatar";
import { checkForOffPlatformContact, OFF_PLATFORM_WARNING } from "../utils/contactFilter";
import { exampleDeal } from "../data/exampleDeal";

// Support used to mix a hardcoded "lease details / rent history" panel with a
// generic AI chat box - two unrelated things bolted together, and the
// founder's own complaint: "why do I have some billing information in
// support and some lease details in support". This is a rebuild: a guided
// triage flow (what's this about -> which property -> describe it -> Emil's
// acknowledgment), plus a real-looking request history underneath, instead
// of a chat window that assumes you already know what to type.

type Topic = "property-issue" | "tenant-issue" | "property-management" | "other";
type TicketStatus = "in-progress" | "resolved";

type Ticket = {
  id: string;
  topic: Topic;
  topicLabel: string;
  propertyLabel: string;
  description: string;
  status: TicketStatus;
  createdLabel: string;
  ackText: string;
  isExample?: boolean;
  paymentLabel?: string;
  resolutionNote?: string;
};

const topicMeta: Record<Topic, { label: string; icon: string }> = {
  "property-issue": { label: "Something's wrong at my property", icon: "🔧" },
  "tenant-issue": { label: "My tenant has an issue", icon: "🔧" },
  "property-management": { label: "I need help managing this property", icon: "🏢" },
  other: { label: "Something else", icon: "💬" },
};

const statusMeta: Record<TicketStatus, { label: string; className: string }> = {
  "in-progress": { label: "In progress", className: "bg-brand-gold/20 text-brand-gold-dark" },
  resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-700" },
};

// The one concrete, fully worked example - always here, always resolved, on
// the fixed Embankment Exchange fixture (see exampleDeal.ts). It's linked to
// both the fixture investor and the fixture tenant, so it shows up in
// request history for whichever role Véta is demoing as, exactly like the
// deal itself already does on Matches/Deal Tracker.
const exampleTicket: Ticket = {
  id: "example-ticket-embankment-washer",
  topic: "property-issue",
  topicLabel: "Maintenance",
  propertyLabel: `${exampleDeal.title}, ${exampleDeal.address}`,
  description:
    "The washing machine has stopped draining properly - clothes are coming out soaking wet and water's pooling underneath it. Not urgent, but it needs sorting.",
  status: "resolved",
  createdLabel: "3 weeks ago",
  ackText: `Don't worry, I'm coordinating this - I've logged it against ${exampleDeal.address} and let ${exampleDeal.investor.name} know a repair's needed. I'll keep ${exampleDeal.tenant.name} posted while it's arranged.`,
  isExample: true,
  paymentLabel: `£145 paid by ${exampleDeal.investor.name} · callout + parts`,
  resolutionNote: `Resolved - an appliance engineer replaced the drain pump. ${exampleDeal.investor.name} covered the callout and parts; ${exampleDeal.tenant.name} confirmed it's working.`,
};

// A couple of older, role-appropriate tickets so request history reads like
// an inbox that's actually been used, not an empty first run - separate from
// the one fixture ticket above, which is the only one that's non-removable.
const seedTicketsByRole: Record<"investor" | "tenant", Ticket[]> = {
  investor: [
    {
      id: "seed-investor-gas-safety",
      topic: "property-management",
      topicLabel: "Property management",
      propertyLabel: "Your property portfolio",
      description: "Reminder to renew the annual gas safety certificate before it lapses.",
      status: "resolved",
      createdLabel: "1 month ago",
      ackText:
        "Don't worry, I'm coordinating this - I've passed it to the property management team to book the engineer and file the certificate.",
      resolutionNote: "Resolved - certificate renewed and filed on your account.",
    },
  ],
  tenant: [
    {
      id: "seed-tenant-extractor-fan",
      topic: "property-issue",
      topicLabel: "Maintenance",
      propertyLabel: "Your home",
      description: "Bathroom extractor fan has started rattling when it's switched on.",
      status: "resolved",
      createdLabel: "5 weeks ago",
      ackText:
        "Don't worry, I'm coordinating this - I've logged it and flagged your investor so a repair can be arranged.",
      resolutionNote: "Resolved - fan bearing replaced, no more noise.",
    },
  ],
};

function ackIntro(topic: Topic, propertyLabel: string | null): string {
  const where = propertyLabel ? ` on ${propertyLabel}` : "";
  switch (topic) {
    case "property-issue":
      return `Don't worry, I'm coordinating this - I've logged the issue${where} and I'm on it.`;
    case "tenant-issue":
      return `Don't worry, I'm coordinating this - I've flagged it to the tenant${where} and I'm managing the fix.`;
    case "property-management":
      return `Don't worry, I'm coordinating this - I've passed${where ? ` ${propertyLabel}` : " this"} to the property management team and someone will confirm next steps.`;
    default:
      return "Don't worry, I'm coordinating this - I've logged your message and the right person will follow up.";
  }
}

function ownedPropertiesFor(
  role: "investor" | "tenant" | null,
  importedProperties: ImportedProperty[]
): { id: string; label: string }[] {
  if (role === "investor") {
    return importedProperties
      .filter((p) => p.owner === "investor")
      .map((p) => ({ id: p.id, label: `${p.title}, ${p.location}` }));
  }
  if (role === "tenant") {
    // Prefer the home they're actually renting (an agreement in their name);
    // fall back to what they've published as demand if nothing's matched yet.
    const rented = importedProperties.filter(
      (p) => p.agreement && p.agreement.tenantId === "you"
    );
    if (rented.length > 0) {
      return rented.map((p) => ({ id: p.id, label: `${p.title}, ${p.location}` }));
    }
    return importedProperties
      .filter((p) => p.owner === "tenant")
      .map((p) => ({ id: p.id, label: `${p.title}, ${p.location}` }));
  }
  return [];
}

export default function Support() {
  const { role } = useRole();
  const { importedProperties } = useListings();
  const viewerRole: "investor" | "tenant" = role === "investor" ? "investor" : "tenant";

  const ownProperties = useMemo(
    () => ownedPropertiesFor(viewerRole, importedProperties),
    [viewerRole, importedProperties]
  );

  const topics: Topic[] =
    viewerRole === "investor"
      ? ["tenant-issue", "property-management", "other"]
      : ["property-issue", "other"];

  const [tickets, setTickets] = useState<Ticket[]>(seedTicketsByRole[viewerRole]);

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [propertyId, setPropertyId] = useState<string | "none" | null>(null);
  const [description, setDescription] = useState("");
  const [blockedReasons, setBlockedReasons] = useState<string[] | null>(null);
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);

  function selectTopic(t: Topic) {
    setTopic(t);
    setPropertyId(null);
    setStep(1);
  }

  function selectProperty(id: string | "none") {
    setPropertyId(id);
    setStep(2);
  }

  function backTo(target: 0 | 1 | 2) {
    setStep(target);
  }

  function propertyLabelFor(id: string | "none" | null): string | null {
    if (!id || id === "none") return null;
    return ownProperties.find((p) => p.id === id)?.label ?? null;
  }

  function submitDescription(e: React.FormEvent) {
    e.preventDefault();
    const text = description.trim();
    if (!text || !topic) return;

    // Support is still a Buynidify channel - the same off-platform rule that
    // applies to investor/tenant messaging applies here too.
    const check = checkForOffPlatformContact(text);
    if (check.blocked) {
      setBlockedReasons(check.reasons);
      return;
    }
    setBlockedReasons(null);

    const propertyLabel = propertyLabelFor(propertyId);
    const reply = supportReply({ freeText: text });
    const ack = `${ackIntro(topic, propertyLabel)}\n\n${reply}`;

    const ticket: Ticket = {
      id: `ticket-${Date.now()}`,
      topic,
      topicLabel: topicMeta[topic].label,
      propertyLabel: propertyLabel ?? "Not tied to a specific property",
      description: text,
      status: "in-progress",
      createdLabel: "Just now",
      ackText: ack,
    };

    setTickets((t) => [ticket, ...t]);
    setLastTicket(ticket);
    setDescription("");
    setStep(3);
  }

  function startAnother() {
    setTopic(null);
    setPropertyId(null);
    setDescription("");
    setBlockedReasons(null);
    setLastTicket(null);
    setStep(0);
  }

  const allTickets = [exampleTicket, ...tickets];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        Help &amp; Support
      </h1>
      <p className="mt-1 text-brand-muted">
        {viewerRole === "investor"
          ? "Tenant issues, day-to-day property management, or anything else - tell " +
            AGENT_NAME +
            " what's going on and we'll coordinate it."
          : "An issue with your property, or anything else - tell " +
            AGENT_NAME +
            " what's going on and we'll coordinate it."}
      </p>
      {viewerRole === "investor" && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-blue-light px-3 py-1 text-xs font-semibold text-brand-blue">
          🏢 Buynidify offers full property management, not just tenant-issue triage - ask below.
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Guided triage flow */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white">
          <div className="flex items-center gap-2.5 border-b border-brand-border p-4">
            <div className="relative flex-shrink-0">
              <Avatar name={AGENT_NAME} initials={AGENT_NAME.slice(0, 2)} photoUrl={avatarFor(AGENT_NAME)} size="sm" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[9px] font-bold text-brand-ink ring-2 ring-white">
                ✦
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
                {AGENT_NAME}
                <span className="rounded-full bg-brand-blue-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-blue">
                  AI
                </span>
              </p>
              <p className="text-xs text-brand-muted">{AGENT_ROLE}</p>
            </div>
          </div>

          <div className="p-5">
            {/* Step 0: what's this about */}
            {step === 0 && (
              <div>
                <p className="text-sm font-semibold text-brand-ink">What's this about?</p>
                <p className="mt-1 text-xs text-brand-muted">Pick the closest match to get started.</p>
                <div className="mt-3 space-y-2">
                  {topics.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => selectTopic(t)}
                      className="flex w-full items-center gap-3 rounded-xl border border-brand-border px-4 py-3 text-left text-sm font-medium text-brand-ink transition-colors hover:border-brand-blue hover:bg-brand-blue-light/40"
                    >
                      <span className="text-lg">{topicMeta[t].icon}</span>
                      {topicMeta[t].label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: which property */}
            {step === 1 && topic && (
              <div>
                <button
                  type="button"
                  onClick={() => backTo(0)}
                  className="mb-3 text-xs font-semibold text-brand-muted hover:text-brand-ink"
                >
                  ← Back
                </button>
                <p className="text-sm font-semibold text-brand-ink">Which property is this about?</p>
                {ownProperties.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {ownProperties.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectProperty(p.id)}
                        className="w-full rounded-xl border border-brand-border px-4 py-3 text-left text-sm font-medium text-brand-ink transition-colors hover:border-brand-blue hover:bg-brand-blue-light/40"
                      >
                        {p.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => selectProperty("none")}
                      className="w-full rounded-xl border border-dashed border-brand-border px-4 py-3 text-left text-sm font-medium text-brand-muted transition-colors hover:border-brand-blue hover:text-brand-blue"
                    >
                      Not tied to a specific property
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="rounded-xl border border-dashed border-brand-border px-4 py-3 text-sm text-brand-muted">
                      No properties on file yet - that's fine, just mention it in your message.
                    </p>
                    <button
                      type="button"
                      onClick={() => selectProperty("none")}
                      className="mt-2 rounded-lg bg-brand-ink px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: describe it */}
            {step === 2 && topic && (
              <div>
                <button
                  type="button"
                  onClick={() => backTo(1)}
                  className="mb-3 text-xs font-semibold text-brand-muted hover:text-brand-ink"
                >
                  ← Back
                </button>
                <p className="text-sm font-semibold text-brand-ink">
                  Tell {AGENT_NAME} what's going on, in your own words
                </p>
                {propertyLabelFor(propertyId) && (
                  <p className="mt-1 text-xs text-brand-muted">
                    Re: <span className="text-brand-ink">{propertyLabelFor(propertyId)}</span>
                  </p>
                )}
                <form onSubmit={submitDescription} className="mt-3">
                  {blockedReasons && (
                    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                      <p className="font-semibold">
                        That message wasn't sent - it looks like it contains {blockedReasons.join(", ")}.
                      </p>
                      <p className="mt-1">{OFF_PLATFORM_WARNING}</p>
                    </div>
                  )}
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (blockedReasons) setBlockedReasons(null);
                    }}
                    rows={4}
                    placeholder="Describe what's happening…"
                    className="w-full resize-none rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
                  />
                  <button
                    type="submit"
                    disabled={!description.trim()}
                    className="mt-3 rounded-lg bg-brand-ink px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Send to {AGENT_NAME}
                  </button>
                </form>
              </div>
            )}

            {/* Step 3: acknowledgment */}
            {step === 3 && lastTicket && (
              <div>
                <div className="flex items-start gap-2.5">
                  <Avatar name={AGENT_NAME} initials={AGENT_NAME.slice(0, 2)} photoUrl={avatarFor(AGENT_NAME)} size="sm" />
                  <div className="max-w-[85%] whitespace-pre-line rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2.5 text-sm leading-relaxed text-brand-ink">
                    {lastTicket.ackText}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  ✓ Added to your request history below
                </div>
                <button
                  type="button"
                  onClick={startAnother}
                  className="mt-4 rounded-lg border border-brand-border px-4 py-2 text-xs font-semibold text-brand-ink hover:border-brand-blue hover:text-brand-blue"
                >
                  Start another request
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Context panel */}
        <div className="rounded-2xl border border-brand-border bg-white p-5">
          <p className="text-sm font-semibold text-brand-ink">What Support can help with</p>
          <div className="mt-3 space-y-3 text-sm">
            {viewerRole === "investor" ? (
              <>
                <div className="flex gap-2.5">
                  <span className="text-base">🔧</span>
                  <p className="text-brand-muted">
                    <span className="font-medium text-brand-ink">Tenant issues</span> - a repair or complaint
                    from your tenant, triaged and coordinated for you.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-base">🏢</span>
                  <p className="text-brand-muted">
                    <span className="font-medium text-brand-ink">Property management</span> - certificates,
                    compliance, day-to-day upkeep. This is a fully supported service, not just issue triage.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-base">💬</span>
                  <p className="text-brand-muted">
                    <span className="font-medium text-brand-ink">Anything else</span> - {AGENT_NAME} will
                    route it to the right person.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2.5">
                  <span className="text-base">🔧</span>
                  <p className="text-brand-muted">
                    <span className="font-medium text-brand-ink">Something's broken</span> - a repair at your
                    property, triaged and, if urgent, fast-tracked to a local repair partner.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-base">💬</span>
                  <p className="text-brand-muted">
                    <span className="font-medium text-brand-ink">Anything else</span> - {AGENT_NAME} will
                    route it to the right person.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Request history */}
      <div className="mt-8 rounded-2xl border border-brand-border bg-white p-5">
        <p className="text-sm font-semibold text-brand-ink">Request history</p>
        <p className="mt-1 text-xs text-brand-muted">Everything you've raised with {AGENT_NAME}, including resolved requests.</p>

        <div className="mt-4 space-y-3">
          {allTickets.map((t) => (
            <div key={t.id} className="rounded-xl border border-brand-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                    {t.topicLabel}
                  </span>
                  {t.isExample && (
                    <span className="rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-gold-dark">
                      Worked example
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusMeta[t.status].className}`}>
                    {statusMeta[t.status].label}
                  </span>
                  <span className="text-[11px] text-brand-muted">{t.createdLabel}</span>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-brand-ink">{t.propertyLabel}</p>
              <p className="mt-1 text-sm text-brand-muted">{t.description}</p>
              {t.resolutionNote && (
                <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {t.resolutionNote}
                </p>
              )}
              {t.paymentLabel && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-ink px-3 py-1 text-[11px] font-bold text-brand-gold">
                  💷 {t.paymentLabel}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
