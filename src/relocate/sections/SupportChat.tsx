import { useEffect, useRef, useState } from "react";
import { cityById, langLabel, VOICE_DISCLOSURE } from "../data";
import { useRelocate } from "../store";

type Turn = { role: "user" | "assistant"; text: string };

// Offline fallback so the demo works with no server key. It is deliberately
// simple: city rules for money/document questions, escalation for regulated
// topics, an honest "I'm not sure" otherwise.
function fallbackReply(text: string, cityId: Parameters<typeof cityById>[0]): string {
  const t = text.toLowerCase();
  const c = cityById(cityId);
  if (/(visa|immigra|lawyer|legal|tax|sue|court|contract valid)/.test(t))
    return "That touches on legal or immigration rules, which I can't advise on. A qualified local professional can. I can connect you with a verified adviser or a human support operator if you like.";
  if (/(deposit|залог)/.test(t)) return `${c.rules[0]} This is general information, so please confirm the exact terms with the landlord.`;
  if (/(document|paper|докум)/.test(t)) return `Landlords in ${c.city} typically ask for: ${c.docs.join("; ")}, plus ID and proof of income. You can prepare them in the Documents section.`;
  if (/(rent|price|cost|budget|аренд)/.test(t)) return `A typical 1-bed in ${c.city} is around ${c.currency}${c.avg1bed.toLocaleString()} per month, but it varies a lot by area. Use the Search section for homes ranked against your budget.`;
  if (/(human|operator|person|человек)/.test(t)) return "Of course. Use \"Human support\" during a voice session, or tell me what you need and I'll summarise it for a human operator.";
  return "I'm not sure about that, and I don't want to guess. I can help with rent levels, deposits, documents, local rules, comparing homes, or talking to a landlord. For anything legal I'd suggest a qualified local professional.";
}

export default function SupportChat() {
  const { supportOpen, setSupportOpen, startVoice, cityId, profile } = useRelocate();
  const [turns, setTurns] = useState<Turn[]>([{ role: "assistant", text: VOICE_DISCLOSURE }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [turns, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next: Turn[] = [...turns, { role: "user", text }];
    setTurns(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/relocate-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next,
          context: { city: cityById(cityId).city, country: cityById(cityId).country, language: langLabel(profile.language), budget: profile.budget, household: profile.household, visa: profile.visa },
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { text?: string };
      if (!data.text) throw new Error("empty");
      setLive(true);
      setTurns((t) => [...t, { role: "assistant", text: data.text as string }]);
    } catch {
      setLive(false);
      setTurns((t) => [...t, { role: "assistant", text: fallbackReply(text, cityId) }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={() => setSupportOpen(!supportOpen)} aria-label="24/7 AI support"
        className="fixed bottom-5 right-5 z-40 flex cursor-pointer items-center gap-2 rounded-full bg-[#00529f] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#003b73]">
        <span className="h-2 w-2 rounded-full bg-emerald-300" /> 24/7 AI support
      </button>
      {supportOpen && (
        <div className="fixed bottom-20 right-4 z-40 flex h-[32rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#00529f] px-4 py-3 text-white">
            <div><p className="text-sm font-semibold">Relocate AI support</p><p className="text-[11px] opacity-80">{live ? "Live AI" : "Demo replies"} · AI assistant, not a human</p></div>
            <button onClick={() => setSupportOpen(false)} className="cursor-pointer text-lg leading-none" aria-label="Close">×</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {turns.map((t, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${t.role === "user" ? "ml-auto bg-[#00529f] text-white" : "bg-slate-100 text-slate-800"}`}>{t.text}</div>
            ))}
            {busy && <div className="w-12 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-400">...</div>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-200 p-3">
            <button type="button" onClick={() => startVoice()} aria-label="Start voice conversation" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#e8f0fa] text-[#00529f]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
            </button>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask in any language..." className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#00529f]" />
            <button type="submit" disabled={busy} className="cursor-pointer rounded-xl bg-[#00529f] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
