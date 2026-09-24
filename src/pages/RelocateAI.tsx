import { useEffect, useMemo, useRef, useState } from "react";
import { marketFor } from "../data/ukMarketData";
import { getRelocateReply, visaGuidanceFor, type ChatTurn } from "../lib/relocateAIEngine";
import { homesFor, type RelocateHome } from "../lib/relocateHomes";
import { documentsFor, LOCAL_SERVICES } from "../lib/relocateExtras";
import RelocateVoiceModal from "./RelocateVoiceModal";

// Relocate AI - deliberately built and dressed as its OWN product, not
// another page of Buynidify. No shared header, no nav links, no "back to
// Buynidify" - you arrive here in a new tab from the "Launch Relocate AI"
// button and the only way back is closing the tab, the same way you'd
// experience a genuinely separate site. Same brand colours (so it doesn't
// feel unrelated), completely different layout language: a full-bleed dark
// "passport" scene instead of Buynidify's white card-based pages.

type Purpose = "work" | "study" | "family" | "eu" | "other";

type Step = "name" | "origin" | "destination" | "purpose" | "homes" | "chat";

const purposeOptions: { id: Purpose; label: string; blurb: string }[] = [
  { id: "work", label: "A job", blurb: "Moving for work" },
  { id: "study", label: "Study", blurb: "Starting a course" },
  { id: "family", label: "Family", blurb: "Joining someone" },
  { id: "eu", label: "EU citizen", blurb: "Already settled status" },
  { id: "other", label: "Something else", blurb: "Not sure yet" },
];

function StampIcon({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="1.5" />
      <path d="M30 55l8 8 20-24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlaneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L2 9.5l7 3 3 7L22 2zM12.5 15.5L15.5 22" />
      <path d="M9 12.5L2 9.5" />
    </svg>
  );
}

function SendIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export default function RelocateAI() {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);
  const [expandedHome, setExpandedHome] = useState<string | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [docsOpen, setDocsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: "assistant",
      text: "Hi, I'm Linda, your Relocate AI concierge. I'll help you work out the housing side of moving to the UK - where to live, roughly what it costs, and what the process looks like. First, what should I call you?",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  function pushAssistant(text: string) {
    setMessages((m) => [...m, { role: "assistant", text }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { role: "user", text }]);
  }

  function submitGuided(e: React.FormEvent) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    pushUser(value);
    setInput("");

    if (step === "name") {
      setName(value);
      pushAssistant(`Nice to meet you, ${value}. Where are you moving from?`);
      setStep("origin");
    } else if (step === "origin") {
      setOrigin(value);
      pushAssistant("And which UK city are you thinking of? (If you're not sure yet, just tell me the vibe you're after - big city, smaller and calmer, near family, etc.)");
      setStep("destination");
    } else if (step === "destination") {
      setDestination(value);
      const market = marketFor(value);
      pushAssistant(
        `${value} - good choice. ${market.summary} Last one before we get into specifics: what's bringing you to the UK?`
      );
      setStep("purpose");
    }
  }

  function choosePurpose(p: Purpose) {
    setPurpose(p);
    pushUser(purposeOptions.find((o) => o.id === p)!.label);
    const guidance = visaGuidanceFor(p);
    const market = destination ? marketFor(destination) : null;
    const costLine = market
      ? ` For reference, a 1-bed in ${destination} typically runs £${market.rentByBeds[1][0].toLocaleString()}-£${market.rentByBeds[1][1].toLocaleString()}/month.`
      : "";
    pushAssistant(`${guidance}${costLine}\n\nWhile that settles, here are a few homes in ${destination || "your city"} worth a look, with a quick AI read on how well each fits.`);
    setStep("homes");
  }

  function continueToChat() {
    pushAssistant(`Good starting point. From here, ask me anything - documents, timeline, specific areas in ${destination || "your city"}, cost of living, whatever's on your mind. You can also try the voice demo below to see how a live translated call with a landlord would work.`);
    setStep("chat");
  }

  const homes: RelocateHome[] = useMemo(
    () => (destination ? homesFor(destination, purpose) : []),
    [destination, purpose]
  );

  function toggleShortlist(id: string) {
    setShortlist((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function sendChatMessage(value: string) {
    if (!value || sending) return;
    const nextHistory: ChatTurn[] = [...messages, { role: "user", text: value }];
    pushUser(value);
    setInput("");
    setSending(true);
    const { text, source } = await getRelocateReply(nextHistory, destination || null);
    setAiPowered(source === "ai");
    pushAssistant(text);
    setSending(false);
  }

  function askAbout(prompt: string) {
    if (step !== "chat") setStep("chat");
    void sendChatMessage(prompt);
  }

  async function submitChat(e: React.FormEvent) {
    e.preventDefault();
    const value = input.trim();
    if (!value || sending) return;
    const nextHistory: ChatTurn[] = [...messages, { role: "user", text: value }];
    pushUser(value);
    setInput("");
    setSending(true);
    const { text, source } = await getRelocateReply(nextHistory, destination || null);
    setAiPowered(source === "ai");
    pushAssistant(text);
    setSending(false);
  }

  const progress = ["name", "origin", "destination", "purpose", "homes", "chat"].indexOf(step);

  return (
    <div className="min-h-screen bg-[#071a33] text-white">
      {/* Decorative passport-stamp scatter - pure background texture, no interaction. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-[0.07]">
        <div className="absolute -left-10 top-10 h-56 w-56 -rotate-12 text-white">
          <StampIcon />
        </div>
        <div className="absolute right-[-4rem] top-1/3 h-72 w-72 rotate-6 text-brand-gold">
          <StampIcon />
        </div>
        <div className="absolute bottom-[-3rem] left-1/4 h-64 w-64 rotate-3 text-white">
          <StampIcon />
        </div>
      </div>

      {/* No nav, no logo bar with links - just a small mark, deliberately quiet. */}
      <header className="relative mx-auto flex max-w-3xl items-center gap-2 px-6 pt-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-brand-gold">
          <PlaneIcon className="h-4 w-4" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">Relocate AI</span>
        <span className="ml-auto text-[11px] uppercase tracking-[0.2em] text-white/40">
          by Buynidify
        </span>
      </header>

      <main className="relative mx-auto max-w-3xl px-6 pb-16 pt-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Let's plan your move.
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/60">
            A guided chat covering where to live, what it costs, and the visa route that applies to
            you - built into Buynidify's matching once you're ready.
          </p>
        </div>

        {progress >= 4 /* homes or chat: name/origin/destination/purpose are all known */ && (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs text-white/60">
            <span className="rounded-full border border-white/15 px-3 py-1">{name}</span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {origin} → {destination}
            </span>
            {purpose && (
              <span className="rounded-full border border-white/15 px-3 py-1">
                {purposeOptions.find((o) => o.id === purpose)?.blurb}
              </span>
            )}
          </div>
        )}

        {/* Progress stamps - a lightweight "passport" motif standing in for a
            progress bar, filling in as the intake questions get answered.
            Each stamp carries its own label underneath it - before this, the
            row was just five unlabelled numbered circles, which read as
            decoration rather than a "here's where you are" indicator. */}
        <div className="mb-6 flex items-start justify-center gap-1.5 sm:gap-2">
          {["Name", "From", "To", "Purpose", "Homes", "Chat"].map((label, i) => (
            <div key={label} className="flex items-start gap-1.5 sm:gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${
                    i < progress
                      ? "border-emerald-400 bg-emerald-400 text-brand-ink"
                      : i === progress
                        ? "border-brand-gold bg-brand-gold text-brand-ink"
                        : "border-white/20 text-white/40"
                  }`}
                >
                  {i < progress ? "✓" : i + 1}
                </span>
                <span
                  className={`text-[9px] font-semibold uppercase tracking-wide ${
                    i <= progress ? "text-white/70" : "text-white/30"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < 5 && <span className={`mt-3.5 h-px w-3 sm:w-4 ${i < progress ? "bg-emerald-400" : "bg-white/15"}`} />}
            </div>
          ))}
        </div>
        <p className="mb-6 text-center text-[11px] text-white/40">
          Step {Math.min(progress + 1, 6)} of 6 - a few quick questions, a shortlist, then it's a free-form chat.
        </p>

        {step === "chat" && shortlist.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
              Your shortlist:
            </span>
            {homes
              .filter((h) => shortlist.includes(h.id))
              .map((h) => (
                <span
                  key={h.id}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80"
                >
                  ♥ {h.title}
                  <button
                    type="button"
                    onClick={() => toggleShortlist(h.id)}
                    aria-label={`Remove ${h.title} from shortlist`}
                    className="text-white/40 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}

        {step === "chat" && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setServicesOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Local services checklist
              </span>
              <span className="text-[11px] font-semibold text-brand-gold">
                {servicesOpen ? "Hide" : "Show"}
              </span>
            </button>
            {servicesOpen && (
              <div className="grid gap-2 border-t border-white/10 p-4 sm:grid-cols-2">
                {LOCAL_SERVICES.map((s) => (
                  <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-xs font-semibold text-white">{s.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-white/55">{s.blurb}</p>
                    <button
                      type="button"
                      onClick={() => askAbout(s.askPrompt)}
                      className="mt-1.5 text-[11px] font-semibold text-brand-gold hover:underline"
                    >
                      Ask Linda about this
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-sm">
          <div ref={scrollRef} className="max-h-[50vh] space-y-3 overflow-y-auto p-5 sm:p-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand-gold text-brand-ink"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-white/50">
                  Typing…
                </div>
              </div>
            )}
          </div>

          {step === "homes" && (
            <div className="border-t border-white/10 p-4 sm:p-5">
              <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <button
                  type="button"
                  onClick={() => setDocsOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                    Documents you'll need
                  </span>
                  <span className="text-[11px] font-semibold text-brand-gold">
                    {docsOpen ? "Hide" : "Show checklist"}
                  </span>
                </button>
                {docsOpen && (
                  <div className="grid gap-4 border-t border-white/10 px-4 py-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-gold">
                        For your visa route
                      </p>
                      <ul className="space-y-1.5 text-xs text-white/70">
                        {documentsFor(purpose).visa.map((d) => (
                          <li key={d.label}>
                            <span className="font-semibold text-white/90">{d.label}</span> - {d.note}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-400">
                        For renting on Buynidify
                      </p>
                      <ul className="space-y-1.5 text-xs text-white/70">
                        {documentsFor(purpose).rental.map((d) => (
                          <li key={d.label}>
                            <span className="font-semibold text-white/90">{d.label}</span> - {d.note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {homes.map((home) => {
                  const isOpen = expandedHome === home.id;
                  const saved = shortlist.includes(home.id);
                  return (
                    <div
                      key={home.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                    >
                      <div className="relative h-24 w-full">
                        <img src={home.imageUrl} alt="" className="h-full w-full object-cover" />
                        <span className="absolute right-2 top-2 rounded-full bg-brand-gold px-2 py-0.5 text-[10px] font-bold text-brand-ink">
                          {home.fitScore}% fit
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShortlist(home.id)}
                          aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
                          className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors ${
                            saved ? "bg-brand-gold text-brand-ink" : "bg-black/40 text-white hover:bg-black/60"
                          }`}
                        >
                          {saved ? "♥" : "♡"}
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-white">{home.title}</p>
                        <p className="text-xs text-white/50">
                          {home.area} · {home.beds} bed · £{home.rent.toLocaleString("en-GB")}/mo
                        </p>
                        <button
                          type="button"
                          onClick={() => setExpandedHome(isOpen ? null : home.id)}
                          className="mt-2 text-[11px] font-semibold text-brand-gold hover:underline"
                        >
                          {isOpen ? "Hide AI fit analysis" : "View AI fit analysis"}
                        </button>
                        {isOpen && (
                          <div className="mt-2 space-y-2 border-t border-white/10 pt-2 text-[11px] leading-relaxed text-white/70">
                            <div>
                              <p className="font-semibold uppercase tracking-wide text-emerald-400">Why it fits</p>
                              <ul className="mt-0.5 space-y-0.5">
                                {home.fitReasons.map((r) => (
                                  <li key={r}>· {r}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="font-semibold uppercase tracking-wide text-amber-300">Worth checking</p>
                              <ul className="mt-0.5 space-y-0.5">
                                {home.redFlags.map((r) => (
                                  <li key={r}>· {r}</li>
                                ))}
                              </ul>
                            </div>
                            <p className="text-white/80">{home.nextStep}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={continueToChat}
                className="mt-4 w-full rounded-full bg-brand-gold py-2.5 text-sm font-bold text-brand-ink transition-transform hover:scale-[1.01]"
              >
                Continue to chat
              </button>
              <p className="mt-2 text-center text-[10px] text-white/35">
                Fit scores are an AI-style estimate for this demo, not a live match against real availability.
              </p>
            </div>
          )}

          <div className={`border-t border-white/10 p-4 sm:p-5 ${step === "homes" ? "hidden" : ""}`}>
            {step === "purpose" ? (
              <div className="flex flex-wrap gap-2">
                {purposeOptions.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => choosePurpose(o.id)}
                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={step === "chat" ? submitChat : submitGuided} className="flex gap-2">
                <input
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    step === "name"
                      ? "Type your name…"
                      : step === "origin"
                        ? "Where are you moving from…"
                        : step === "destination"
                          ? "Which city, or what you're after…"
                          : "Ask anything about your move…"
                  }
                  className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand-gold"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-ink transition-transform hover:scale-105 disabled:opacity-40"
                  aria-label="Send"
                >
                  <SendIcon />
                </button>
              </form>
            )}
          </div>
        </div>

        {progress >= 4 && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setVoiceOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:border-brand-gold hover:text-brand-gold"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              Talk to Linda - live translated call demo
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-[11px] text-white/35">
          {aiPowered
            ? "Responses are AI-generated."
            : "Demo mode - replies are pre-built for now, not a live model yet."}{" "}
          General information only, not immigration or legal advice.
        </p>
      </main>

      <RelocateVoiceModal open={voiceOpen} onClose={() => setVoiceOpen(false)} destination={destination} />
    </div>
  );
}
