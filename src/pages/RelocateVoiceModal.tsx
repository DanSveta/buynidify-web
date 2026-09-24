import { useEffect, useState } from "react";
import {
  AI_DISCLOSURE,
  DEMO_CALL_SCRIPT,
  DEMO_CALL_SUMMARY,
  DEMO_LANGUAGES,
} from "../lib/voiceAssistantScript";

// Trimmed-down, fully simulated Voice AI demo. No real telephony, speech
// recognition or translation - a scripted transcript that plays out on a
// timer, dressed as a live call. Follows the brief's own required shape:
// consent before anything starts, the AI's self-disclosure line spoken
// first, original + translated text shown together, and a bilingual
// summary with next steps at the end.

type Phase = "consent" | "calling" | "summary";

function MicIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 19v3M8 22h8" />
    </svg>
  );
}

function speakerLabel(speaker: string, destination: string) {
  if (speaker === "ai") return "Linda (AI)";
  if (speaker === "tenant") return "You";
  return `Landlord${destination ? ` · ${destination}` : ""}`;
}

export default function RelocateVoiceModal({
  open,
  onClose,
  destination,
}: {
  open: boolean;
  onClose: () => void;
  destination: string;
}) {
  const [phase, setPhase] = useState<Phase>("consent");
  const [language, setLanguage] = useState(DEMO_LANGUAGES[0].code);
  const [consented, setConsented] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showOriginalOnly, setShowOriginalOnly] = useState(false);

  useEffect(() => {
    if (!open) {
      setPhase("consent");
      setConsented(false);
      setVisibleLines(0);
      setMuted(false);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== "calling") return;
    if (visibleLines >= DEMO_CALL_SCRIPT.length) {
      const t = setTimeout(() => setPhase("summary"), 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleLines((n) => n + 1), 1900);
    return () => clearTimeout(t);
  }, [phase, visibleLines]);

  if (!open) return null;

  const langLabel = DEMO_LANGUAGES.find((l) => l.code === language)?.label ?? "Russian";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#071a33] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
              <MicIcon className="h-4 w-4" />
            </span>
            <span className="font-display text-sm font-semibold">Voice AI · demo</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70 hover:border-white/30 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {phase === "consent" && (
            <div className="flex flex-col gap-5">
              <p className="rounded-2xl bg-white/5 p-4 text-sm leading-relaxed text-white/80">
                {AI_DISCLOSURE}
              </p>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                  Your language
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLanguage(l.code)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        language === l.code
                          ? "border-brand-gold bg-brand-gold text-brand-ink"
                          : "border-white/15 text-white/70 hover:border-white/30"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                  This call will
                </p>
                <ul className="space-y-1.5 text-sm text-white/70">
                  <li>· Ask the landlord in {destination || "the destination city"} your questions, live-translated both ways</li>
                  <li>· Show you the original and translated text as it happens</li>
                  <li>· End with a written, bilingual summary and next steps - nothing is agreed without your say-so</li>
                </ul>
              </div>

              <label className="flex items-start gap-2.5 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 accent-brand-gold"
                />
                I understand this call is AI-assisted and consent to it being translated and summarised.
              </label>

              <button
                type="button"
                disabled={!consented}
                onClick={() => setPhase("calling")}
                className="flex items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-3 text-sm font-bold text-brand-ink transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <MicIcon className="h-4 w-4" />
                Start AI-assisted call
              </button>
              <p className="text-center text-[11px] text-white/35">
                Simulated for this demo - no real call is placed. In {langLabel}, translated live to English.
              </p>
            </div>
          )}

          {phase === "calling" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  Call in progress · {langLabel} ↔ English
                </span>
              </div>

              <div className="space-y-3">
                {DEMO_CALL_SCRIPT.slice(0, visibleLines).map((line, i) => (
                  <div
                    key={i}
                    className={`flex ${line.speaker === "tenant" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        line.speaker === "tenant"
                          ? "bg-brand-gold text-brand-ink"
                          : line.speaker === "ai"
                            ? "bg-white/10 text-white/90 italic"
                            : "bg-white/15 text-white"
                      }`}
                    >
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide opacity-60">
                        {speakerLabel(line.speaker, destination)} · {line.language}
                      </p>
                      <p>{line.original}</p>
                      {line.translated && !showOriginalOnly && (
                        <p className="mt-1.5 border-t border-current/20 pt-1.5 text-xs opacity-75">
                          {line.translated}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {visibleLines < DEMO_CALL_SCRIPT.length && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white/10 px-4 py-2.5 text-xs text-white/40">
                      {DEMO_CALL_SCRIPT[visibleLines]?.speaker === "tenant" ? "Speaking…" : "Translating…"}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setMuted((v) => !v)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    muted ? "border-brand-gold text-brand-gold" : "border-white/15 text-white/60 hover:border-white/30"
                  }`}
                >
                  {muted ? "Unmute" : "Mute"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOriginalOnly((v) => !v)}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/60 hover:border-white/30"
                >
                  {showOriginalOnly ? "Show translation" : "Hide translation"}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/60 hover:border-white/30"
                >
                  Request human support
                </button>
                <button
                  type="button"
                  onClick={() => setPhase("summary")}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
                >
                  End call
                </button>
              </div>
            </div>
          )}

          {phase === "summary" && (
            <div className="flex flex-col gap-4">
              <p className="text-center text-sm font-semibold text-white/80">Call summary</p>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">Key answers</p>
                <ul className="space-y-1.5 text-sm text-white/75">
                  {DEMO_CALL_SUMMARY.keyAnswers.map((a) => (
                    <li key={a}>· {a}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-gold">Agreed</p>
                <ul className="space-y-1.5 text-sm text-white/75">
                  {DEMO_CALL_SUMMARY.agreedTerms.map((a) => (
                    <li key={a}>· {a}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Still to confirm</p>
                <ul className="space-y-1.5 text-sm text-white/75">
                  {DEMO_CALL_SUMMARY.unresolved.map((a) => (
                    <li key={a}>· {a}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Next steps</p>
                <ol className="space-y-1.5 text-sm text-white/75">
                  {DEMO_CALL_SUMMARY.nextSteps.map((a, i) => (
                    <li key={a}>{i + 1}. {a}</li>
                  ))}
                </ol>
              </div>

              <p className="text-center text-[11px] text-white/35">
                A written copy of this summary would normally be sent to both parties in their own language.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-brand-gold px-5 py-3 text-sm font-bold text-brand-ink transition-transform hover:scale-[1.02]"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
