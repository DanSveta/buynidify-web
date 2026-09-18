import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useListings } from "../context/ListingsContext";
import { useRole } from "../context/RoleContext";
import ProfileSummary from "../components/ProfileSummary";
import { minimalProfile, type PartyProfile } from "../utils/profiles";

// Platform-wide inbox, in three columns: conversations, the conversation
// itself, and who you're talking to. The profile column is the point - on
// Buynidify you're deciding whether to let to someone or rent from them, so
// the answer to "who is this?" belongs beside the thread, not behind a click.
export default function Messages() {
  const { threads, sendMessage, isThreadUnread, markThreadRead } = useListings();
  const { role } = useRole();
  const [activeId, setActiveId] = useState<string | null>(threads[0]?.counterpartyId ?? null);
  const [body, setBody] = useState("");

  const active = threads.find((t) => t.counterpartyId === activeId) ?? threads[0] ?? null;

  // Opening a conversation reads it, including the one shown on arrival.
  useEffect(() => {
    if (active) markThreadRead(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.counterpartyId, active?.messages.length]);

  // Whoever you are, the other side is the opposite role.
  const counterpartyRole: PartyProfile["role"] = role === "tenant" ? "Investor" : "Tenant";

  const profile: PartyProfile | null = active
    ? active.profile ??
      minimalProfile(active.counterpartyId, active.counterpartyName, counterpartyRole)
    : null;

  function send() {
    if (!active || !body.trim()) return;
    sendMessage(
      {
        id: active.counterpartyId,
        name: active.counterpartyName,
        context: active.context,
        profile: active.profile,
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
              return (
                <button
                  key={t.counterpartyId}
                  type="button"
                  onClick={() => setActiveId(t.counterpartyId)}
                  className={`flex items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors ${
                    isActive ? "bg-brand-blue-light" : "hover:bg-brand-surface"
                  }`}
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
                    {t.profile?.initials ?? t.counterpartyName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-ink">
                        {t.counterpartyName}
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
          {active && (
            <div className="flex min-h-[380px] flex-col rounded-2xl border border-brand-border bg-white p-4 sm:p-5 lg:h-full lg:min-h-0">
              <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
                  {profile?.initials}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold leading-tight text-brand-ink">
                    {active.counterpartyName}
                  </p>
                  {active.context && <p className="truncate text-xs text-brand-muted">{active.context}</p>}
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto py-4">
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      m.from === "me"
                        ? "ml-auto bg-brand-blue text-white"
                        : "bg-brand-surface text-brand-ink"
                    }`}
                  >
                    {m.body}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 border-t border-brand-border pt-3">
                <input
                  type="text"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
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

          {/* Who you're talking to */}
          {profile && (
            <aside className="overflow-y-auto rounded-2xl border border-brand-border bg-white p-5 lg:h-full">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-muted">Profile</p>
              <ProfileSummary
                profile={profile}
                context={active?.context}
                propertyHref={
                  <Link
                    to={role === "tenant" ? "/app/platform-listings" : "/app/my-properties"}
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
