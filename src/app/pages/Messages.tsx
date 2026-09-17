import { useState } from "react";
import { useListings } from "../context/ListingsContext";

// Platform-wide inbox. Threads are started from a tenant's profile (or an
// investor responding to demand) and persist alongside everything else, so a
// conversation is still here after a reload or a role switch.
export default function Messages() {
  const { threads, sendMessage } = useListings();
  const [activeId, setActiveId] = useState<string | null>(threads[0]?.counterpartyId ?? null);
  const [body, setBody] = useState("");

  const active = threads.find((t) => t.counterpartyId === activeId) ?? threads[0] ?? null;

  function send() {
    if (!active || !body.trim()) return;
    sendMessage({ id: active.counterpartyId, name: active.counterpartyName, context: active.context }, body);
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
        <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-2">
            {threads.map((t) => {
              const last = t.messages[t.messages.length - 1];
              const isActive = active?.counterpartyId === t.counterpartyId;
              return (
                <button
                  key={t.counterpartyId}
                  type="button"
                  onClick={() => setActiveId(t.counterpartyId)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    isActive
                      ? "border-brand-blue bg-brand-blue-light"
                      : "border-brand-border bg-white hover:border-brand-blue"
                  }`}
                >
                  <p className="text-sm font-semibold text-brand-ink">{t.counterpartyName}</p>
                  {t.context && <p className="truncate text-[11px] text-brand-muted">{t.context}</p>}
                  {last && <p className="mt-1 truncate text-xs text-brand-muted">{last.body}</p>}
                </button>
              );
            })}
          </div>

          {active && (
            <div className="flex min-h-[320px] flex-col rounded-2xl border border-brand-border bg-white p-5">
              <div className="border-b border-brand-border pb-3">
                <p className="font-display text-lg font-semibold text-brand-ink">{active.counterpartyName}</p>
                {active.context && <p className="text-xs text-brand-muted">{active.context}</p>}
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
                  placeholder="Write a message..."
                  className="flex-1 rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
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
        </div>
      )}
    </div>
  );
}
