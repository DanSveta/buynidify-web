import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useListings, type MessageThread, type AgreementActor } from "../context/ListingsContext";
import { useRole } from "../context/RoleContext";
import ProfileSummary from "../components/ProfileSummary";
import Avatar from "../components/Avatar";
import AgreementTimeline from "../components/AgreementTimeline";
import { fallbackTenantProfile } from "../components/DealDetailPanel";
import { minimalProfile, selfProfile, type PartyProfile, type PartyRole } from "../utils/profiles";
import { checkForOffPlatformContact, OFF_PLATFORM_WARNING } from "../utils/contactFilter";

// Platform-wide inbox, in three columns: conversations, the conversation
// itself, and who you're talking to. The profile column is the point - on
// Buynidify you're deciding whether to let to someone or rent from them, so
// the answer to "who is this?" belongs beside the thread, not behind a click.
//
// A conversation that's about a matched property also shows that match, and
// its live deal progress, right here - so the person you're talking to and
// the reason you're talking to them are never two separate lookups.

/** `investor-<id>` / `tenant-<id>` is the convention every property thread
 *  uses everywhere else in the app (Matches, My Properties, the agreement
 *  narration) - unwrapping it here is what connects a conversation back to
 *  the property and agreement it's actually about. */
function propertyIdFromCounterpartyId(id: string): string | null {
  if (id.startsWith("investor-")) return id.slice("investor-".length);
  if (id.startsWith("tenant-")) return id.slice("tenant-".length);
  return null;
}

export default function Messages() {
  const {
    threads,
    sendMessage,
    isThreadUnread,
    markThreadRead,
    importedProperties,
    connectionFor,
    advanceAgreement,
  } = useListings();
  const { role, namesByRole } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeId, setActiveId] = useState<string | null>(threads[0]?.counterpartyId ?? null);
  const [body, setBody] = useState("");
  const [blockedReasons, setBlockedReasons] = useState<string[] | null>(null);

  // A notification for "new message from X" links here as
  // /app/messages?thread=<counterpartyId> - open that conversation on
  // arrival instead of whatever happened to be first, then drop the param
  // so it doesn't fight future manual thread switches.
  useEffect(() => {
    const wanted = searchParams.get("thread");
    if (wanted && threads.some((t) => t.counterpartyId === wanted)) {
      setActiveId(wanted);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("thread");
        return next;
      }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, threads]);

  const active = threads.find((t) => t.counterpartyId === activeId) ?? threads[0] ?? null;

  // Opening a conversation reads it, including the one shown on arrival.
  useEffect(() => {
    if (active) markThreadRead(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.counterpartyId, active?.messages.length]);

  // Whoever you are, the other side is the opposite role - used only as a
  // fallback guess for old threads with no profile snapshot at all.
  const fallbackCounterpartyRole: PartyRole = role === "tenant" ? "Investor" : "Tenant";

  // A message renders on your side of the conversation if the persona you're
  // currently signed in as is the one who wrote it - checked fresh against
  // the active role, not against a direction baked in when it was sent. That
  // matters here specifically because one browser plays both sides: a
  // message sent as investor has to flip sides when you switch to tenant and
  // look at the same thread, instead of always reading as "me".
  function isMine(m: { from: "me" | "them"; senderRole?: "investor" | "tenant" | "system" }) {
    if (m.senderRole === "system") return false;
    if (m.senderRole) return m.senderRole === role;
    return m.from === "me";
  }

  /** Who's really on the other end of a thread, from the CURRENT persona's
   *  point of view. For a self-dealing thread (both ends are you, playing
   *  investor and tenant in the same browser) a name/profile saved when the
   *  thread was created is wrong the moment you look at it from the other
   *  side - "Alex Morgan" doesn't stop being the investor's name just
   *  because the tenant persona opens the same conversation. So this is
   *  recomputed live from whichever persona you are NOT currently signed in
   *  as, every time, rather than trusted from a stored snapshot. A thread
   *  with a real or seeded counterparty keeps its stored snapshot, since
   *  that person doesn't change depending on who's looking. */
  function counterpartyFor(t: MessageThread): { name: string; profile: PartyProfile } {
    if (t.selfDealing) {
      const otherRole: PartyRole = role === "investor" ? "Tenant" : "Investor";
      const otherName = role === "investor" ? namesByRole.tenant : namesByRole.investor;
      return { name: otherName, profile: selfProfile(t.counterpartyId, otherName, otherRole) };
    }
    return {
      name: t.counterpartyName,
      profile: t.profile ?? minimalProfile(t.counterpartyId, t.counterpartyName, fallbackCounterpartyRole),
    };
  }

  const activeCounterparty = active ? counterpartyFor(active) : null;

  // The property and connection this conversation is actually about, if any
  // - so the sidebar can say why you're talking, not just who.
  const relatedPropertyId = active ? propertyIdFromCounterpartyId(active.counterpartyId) : null;
  const relatedProperty = useMemo(
    () => (relatedPropertyId ? importedProperties.find((p) => p.id === relatedPropertyId) : undefined),
    [relatedPropertyId, importedProperties]
  );
  const relatedConnection = relatedPropertyId ? connectionFor(relatedPropertyId) : undefined;

  const viewerRole: "investor" | "tenant" = role === "tenant" ? "tenant" : "investor";
  const agreementInvestor = relatedProperty
    ? selfProfile(`investor-${relatedProperty.id}`, namesByRole.investor, "Investor")
    : null;
  const agreementTenant =
    relatedProperty?.agreement
      ? relatedProperty.agreement.tenantId === "you"
        ? selfProfile(`tenant-${relatedProperty.id}`, namesByRole.tenant, "Tenant")
        : fallbackTenantProfile(relatedProperty.agreement)
      : null;

  function send() {
    if (!active || !body.trim()) return;

    // Buynidify's whole value is that the relationship - and the deal -
    // happens on the platform, where both sides are verified and Buynidify
    // can step in if something goes wrong. A number, an email or "let's
    // move to WhatsApp" is exactly the thing that lets people quietly walk
    // off it, so the send is blocked (not just flagged) until it's removed -
    // the same rule Upwork and similar platforms enforce on their chat.
    const check = checkForOffPlatformContact(body);
    if (check.blocked) {
      setBlockedReasons(check.reasons);
      return;
    }
    setBlockedReasons(null);

    sendMessage(
      {
        id: active.counterpartyId,
        name: active.counterpartyName,
        context: active.context,
        profile: active.profile,
        audience: active.audience,
        selfDealing: active.selfDealing,
      },
      body
    );
    setBody("");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">Messages</h1>
      <p className="mt-1 text-brand-muted">
        Conversations with tenants and investors you've connected with on Buynidify.
      </p>

      {threads.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
          No conversations yet. Open an interested tenant's profile from My Properties and send them a
          message to start one.
        </div>
      ) : (
        // The three columns share one height that fills what's left of the
        // viewport, so the conversation grows with the window instead of
        // sitting in a short box with dead space under it.
        <div className="mt-6 grid gap-4 lg:h-[calc(100vh-15rem)] lg:min-h-[520px] lg:grid-cols-[300px_minmax(0,1fr)_320px]">
          {/* Conversations */}
          <div className="flex max-h-56 flex-col gap-2 overflow-y-auto rounded-2xl border border-brand-border bg-white p-2 lg:max-h-none lg:h-full">
            {threads.map((t) => {
              const last = t.messages[t.messages.length - 1];
              const isActive = active?.counterpartyId === t.counterpartyId;
              const unread = isThreadUnread(t);
              const counterparty = counterpartyFor(t);
              return (
                <button
                  key={t.counterpartyId}
                  type="button"
                  onClick={() => setActiveId(t.counterpartyId)}
                  className={`flex items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors ${
                    isActive ? "bg-brand-blue-light" : "hover:bg-brand-surface"
                  }`}
                >
                  <Avatar
                    name={counterparty.name}
                    initials={counterparty.profile.initials}
                    photoUrl={counterparty.profile.photoUrl}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-ink">
                        {counterparty.name}
                      </span>
                      {unread && (
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-cta" aria-label="Unread" />
                      )}
                    </span>
                    {t.context && (
                      <span className="block truncate text-[11px] text-brand-muted">{t.context}</span>
                    )}
                    {last && (
                      <span
                        className={`mt-0.5 block truncate text-xs ${
                          unread ? "font-semibold text-brand-ink" : "text-brand-muted"
                        }`}
                      >
                        {last.body}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Conversation */}
          {active && activeCounterparty && (
            <div className="flex min-h-[380px] flex-col rounded-2xl border border-brand-border bg-white p-4 sm:p-5 lg:h-full lg:min-h-0">
              <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                <Avatar
                  name={activeCounterparty.name}
                  initials={activeCounterparty.profile.initials}
                  photoUrl={activeCounterparty.profile.photoUrl}
                />
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold leading-tight text-brand-ink">
                    {activeCounterparty.name}
                  </p>
                  {active.context && <p className="truncate text-xs text-brand-muted">{active.context}</p>}
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto py-4">
                {active.messages.map((m) =>
                  m.senderRole === "system" ? (
                    // Buynidify's own narration of a deal update - not a
                    // message from either party, so it doesn't sit on
                    // either side of the conversation like one.
                    <div key={m.id} className="my-2 flex justify-center">
                      <div className="flex max-w-[85%] items-start gap-2 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3.5 py-1.5 text-center text-xs font-medium text-brand-ink">
                        <span aria-hidden className="text-brand-gold-dark">●</span>
                        <span>{m.body}</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={m.id}
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        isMine(m)
                          ? "ml-auto bg-brand-blue text-white"
                          : "bg-brand-surface text-brand-ink"
                      }`}
                    >
                      {m.body}
                    </div>
                  )
                )}
              </div>

              {blockedReasons && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                  <p className="font-semibold">
                    This message wasn't sent - it looks like it contains {blockedReasons.join(", ")}.
                  </p>
                  <p className="mt-1">{OFF_PLATFORM_WARNING}</p>
                </div>
              )}
              <div className="flex gap-2 border-t border-brand-border pt-3">
                <input
                  type="text"
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    if (blockedReasons) setBlockedReasons(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-blue"
                />
                <button
                  type="button"
                  onClick={send}
                  className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Who you're talking to, and why */}
          {activeCounterparty && (
            <aside className="overflow-y-auto rounded-2xl border border-brand-border bg-white p-5 lg:h-full">
              {relatedProperty && relatedConnection && (
                <div className="mb-4 rounded-xl bg-brand-surface p-3">
                  {relatedConnection.accepted ? (
                    <p className="text-xs font-semibold text-emerald-700">
                      ✓ Mutually matched on {relatedProperty.title}
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-brand-gold-dark">
                      {relatedConnection.by === "tenant" ? "Interest sent" : "Request sent"} on{" "}
                      {relatedProperty.title} - not matched yet
                    </p>
                  )}
                  <Link
                    to="/app/matches"
                    className="mt-1 inline-block text-[11px] font-semibold text-brand-blue hover:underline"
                  >
                    View in Mutual Matches →
                  </Link>

                  {relatedProperty.agreement && agreementInvestor && agreementTenant && (
                    <div className="mt-3">
                      <AgreementTimeline
                        agreement={relatedProperty.agreement}
                        investor={agreementInvestor}
                        tenant={agreementTenant}
                        viewerRole={viewerRole}
                        onAdvance={(by: AgreementActor) => advanceAgreement(relatedProperty.id, by)}
                        compact
                      />
                    </div>
                  )}
                </div>
              )}

              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-muted">Profile</p>
              <ProfileSummary
                profile={activeCounterparty.profile}
                context={active?.context}
                propertyHref={
                  <Link
                    to={role === "tenant" ? "/listings" : "/app/my-properties"}
                    className="mt-1 inline-block text-[11px] font-semibold text-brand-blue hover:underline"
                  >
                    View property →
                  </Link>
                }
              />
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
