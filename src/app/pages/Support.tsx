import { useEffect, useRef, useState } from "react";
import { supportCategories } from "../data/mockData";
import { AGENT_NAME, AGENT_ROLE, supportReply, type SupportCategoryId } from "../../lib/supportAgent";
import { avatarFor } from "../utils/avatars";
import Avatar from "../components/Avatar";
import { checkForOffPlatformContact, OFF_PLATFORM_WARNING } from "../utils/contactFilter";

type ChatMessage = { from: "agent" | "user"; text: string };

const rentHistory = [
  { month: "September 2026", amount: "£1,450", status: "Paid" },
  { month: "August 2026", amount: "£1,450", status: "Paid" },
  { month: "July 2026", amount: "£1,450", status: "Paid" },
];

export default function Support() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "agent",
      text: `Hi, I'm ${AGENT_NAME} from Buynidify Support. Pick a topic below, or just type what's going on and I'll help.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [blockedReasons, setBlockedReasons] = useState<string[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function sendAgentReply(reply: string) {
    setTyping(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, { from: "agent", text: reply }]);
      setTyping(false);
    }, 650);
  }

  function pickCategory(id: SupportCategoryId, label: string) {
    setMessages((m) => [...m, { from: "user", text: label }]);
    sendAgentReply(supportReply({ category: id }));
  }

  function submitFreeText(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Support is still a Buynidify channel - the same off-platform rule
    // that applies to investor/tenant messaging applies here too, so a
    // frustrated tenant can't just slip their number to "the agent" instead.
    const check = checkForOffPlatformContact(text);
    if (check.blocked) {
      setBlockedReasons(check.reasons);
      return;
    }
    setBlockedReasons(null);

    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    sendAgentReply(supportReply({ freeText: text }));
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        My Home &amp; Support
      </h1>
      <p className="mt-1 text-brand-muted">
        Your lease, rent history, and Buynidify's 24/7 AI Support for a fast
        answer when something's wrong.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-border bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-brand-ink">
            Lease details
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Property</span>
              <span className="text-brand-ink">
                14 Redchurch St, Shoreditch, London
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Rent</span>
              <span className="text-brand-ink">£1,450 / month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Lease term</span>
              <span className="text-brand-ink">12 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Renewal</span>
              <span className="text-brand-ink">15 March 2027</span>
            </div>
          </div>

          <p className="mb-2 mt-5 text-sm font-semibold text-brand-ink">
            Rent history
          </p>
          <div className="space-y-1.5 text-sm">
            {rentHistory.map((r) => (
              <div key={r.month} className="flex justify-between">
                <span className="text-brand-muted">{r.month}</span>
                <span className="text-brand-ink">
                  {r.amount} · <span className="text-emerald-600">{r.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white">
          {/* Explicit "this is AI" badge - the chat below used to give no
              visual cue it's the platform's 24/7 AI Support (Andrew's own
              feedback), so it just read as a generic human support inbox. */}
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

          <div ref={scrollRef} className="max-h-[360px] flex-1 space-y-2.5 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.from === "user"
                      ? "bg-brand-blue text-white"
                      : "border border-brand-border bg-brand-surface text-brand-ink"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-sm text-brand-muted">
                  {AGENT_NAME} is typing…
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-brand-border p-4">
            {blockedReasons && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <p className="font-semibold">
                  That message wasn't sent - it looks like it contains {blockedReasons.join(", ")}.
                </p>
                <p className="mt-1">{OFF_PLATFORM_WARNING}</p>
              </div>
            )}
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
              Quick topics
            </p>
            <div className="flex flex-wrap gap-1.5">
              {supportCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickCategory(c.id as SupportCategoryId, c.label)}
                  className="rounded-full border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
                >
                  {c.label}
                </button>
              ))}
            </div>

            <form onSubmit={submitFreeText} className="mt-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (blockedReasons) setBlockedReasons(null);
                }}
                placeholder="Or type your question…"
                className="flex-1 rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-ink px-4 py-2 text-xs font-semibold text-white hover:bg-black"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
