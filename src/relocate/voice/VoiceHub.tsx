import { useEffect, useMemo, useRef, useState } from "react";
import { CALL_SCRIPT, CALL_SUMMARY, cityById, langLabel, LANGUAGES, PROPERTIES, VOICE_DISCLOSURE, type CallLine } from "../data";
import { useRelocate, type VoiceSession } from "../store";
import { Btn, Card, Disclaimer, Pill, SectionTitle } from "../ui";

type Stage = "setup" | "approval" | "call" | "summary";
type Mode = "ask" | "contact" | "mediate";

const MODES: { id: Mode; title: string; blurb: string }[] = [
  { id: "ask", title: "1. Talk to the AI", blurb: "Ask the assistant about rent, deposits, documents and local rules." },
  { id: "contact", title: "2. AI contacts the landlord", blurb: "The AI writes to the landlord or agent for you, after you approve." },
  { id: "mediate", title: "3. Live mediated call", blurb: "You and the landlord speak different languages. The AI translates live." },
];

const CANNOT = [
  "give definitive legal advice", "guarantee an application or contract", "decide for you or the landlord",
  "agree binding terms without your approval", "move money without a separate payment flow", "share documents without permission",
];

function buildScript(mode: Mode, depositRule: string, agent: string, landlordLang: string): CallLine[] {
  if (mode === "mediate") return CALL_SCRIPT;
  if (mode === "ask") {
    return [
      { speaker: "ai", lang: "en", original: VOICE_DISCLOSURE },
      { speaker: "tenant", lang: "ru", original: "Сколько обычно составляет залог и как он защищён?", translated: "How much is the deposit usually, and how is it protected?", confidence: 0.96 },
      { speaker: "ai", lang: "ru", original: `${depositRule} Это общая информация, а не юридическая консультация.`, translated: `${depositRule} This is general information, not legal advice.`, confidence: 0.9 },
      { speaker: "ai", lang: "en", original: "For anything legal or immigration-related, I can connect you with a qualified local professional or a human operator.", clarify: "Legal topic: escalation offered" },
    ];
  }
  return [
    { speaker: "ai", lang: "en", original: VOICE_DISCLOSURE },
    { speaker: "ai", lang: landlordLang, original: `Hello ${agent}. I'm the Relocate AI assistant writing on behalf of a tenant who is interested in your listing. The tenant would like to confirm availability, deposit and whether bills are included.`, translated: "(Sent only after the tenant approved this message.)" },
    { speaker: "landlord", lang: landlordLang, original: "Thanks for getting in touch. The home is still available. The deposit follows local rules and bills are partly included.", translated: "Спасибо! Жильё ещё свободно. Залог по местным правилам, часть коммунальных платежей включена.", confidence: 0.93 },
    { speaker: "ai", lang: "en", original: "I'll summarise this for the tenant. I won't agree any binding terms on their behalf." },
  ];
}

export default function VoiceHub() {
  const { properties, voiceProperty, profile, cityId, setProfile, consents, recordConsent, sessions, addSession, updateSession, log, go, openAnalysis, interest } = useRelocate();
  const city = cityById(cityId);
  const [stage, setStage] = useState<Stage>("setup");
  const [mode, setMode] = useState<Mode>("mediate");
  const [propId, setPropId] = useState<string>(voiceProperty ?? properties[0]?.id ?? "");
  const [consent, setConsent] = useState(false);
  const [recordingWanted, setRecordingWanted] = useState(false);
  const [lines, setLines] = useState<CallLine[]>([]);
  const [cursor, setCursor] = useState(0);
  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "ended">("idle");
  const [muted, setMuted] = useState(false);
  const [translate, setTranslate] = useState(true);
  const [showText, setShowText] = useState(true);
  const [slow, setSlow] = useState(false);
  const [docShare, setDocShare] = useState(false);
  const [msgApproved, setMsgApproved] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [handover, setHandover] = useState(false);
  const [handedOver, setHandedOver] = useState(false);
  const [approvedNext, setApprovedNext] = useState(false);
  const [retention, setRetention] = useState(30);
  const [deleted, setDeleted] = useState(false);
  const [tasks, setTasks] = useState<Record<string, boolean>>({});
  const endRef = useRef<HTMLDivElement>(null);

  const p = PROPERTIES.find((x) => x.id === propId) ?? properties[0];
  const script = useMemo(() => buildScript(mode, cityById(p?.city ?? cityId).rules[0], p?.agent ?? "the landlord", p?.landlordLang ?? "en"), [mode, p, cityId]);
  const session = sessions.find((s) => s.id === sessionId);
  const exactDemo = profile.language === "ru" || profile.language === "en";

  // Plays the scripted call: one line at a time, slower when "slow down" is on.
  useEffect(() => {
    if (stage !== "call") return;
    if (status === "connecting") {
      const t = window.setTimeout(() => setStatus("live"), 1200);
      return () => window.clearTimeout(t);
    }
    if (status !== "live") return;
    if (cursor >= script.length) {
      setStatus("ended");
      return;
    }
    const t = window.setTimeout(() => {
      setLines((l) => [...l, script[cursor]]);
      setCursor((c) => c + 1);
    }, slow ? 4200 : 2200);
    return () => window.clearTimeout(t);
  }, [stage, status, cursor, script, slow]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [lines.length]);

  function startCall() {
    if (!p) return;
    const id = `VS-${Date.now().toString().slice(-6)}`;
    const s: VoiceSession = {
      id, propertyId: p.id, tenantId: "TEN-1042", landlordId: `LL-${p.agent.slice(0, 3).toUpperCase()}`,
      start: new Date().toLocaleString("en-GB"), end: null,
      participants: ["Tenant", "Relocate AI", ...(mode === "ask" ? [] : ["Landlord / agent"])],
      languages: [profile.language, p.landlordLang], consent: "granted",
      recording: recordingWanted ? "on" : "off", transcript: "live", summary: "none", escalation: "none",
    };
    addSession(s);
    setSessionId(id);
    recordConsent("Contact the landlord / agent via AI", true);
    recordConsent("Transcribe this conversation", true);
    recordConsent(`Record audio (${recordingWanted ? "all participants agreed" : "not requested"})`, recordingWanted);
    log("Tenant", `Started AI-assisted ${mode === "ask" ? "voice chat" : "call"} about ${p.title}`);
    setLines([]);
    setCursor(0);
    setStatus("connecting");
    setStage("call");
  }

  function endCall() {
    setStatus("ended");
    if (sessionId) updateSession(sessionId, { end: new Date().toLocaleString("en-GB"), transcript: "saved", summary: "ready" });
    log("Relocate AI", "Call ended and bilingual summary generated");
    setStage("summary");
  }

  function repeatLast() {
    const last = lines[lines.length - 1];
    if (last) setLines((l) => [...l, { ...last, original: `Repeated: ${last.original}`, translated: last.translated }]);
  }
  function translateAgain() {
    const last = lines[lines.length - 1];
    if (last?.translated) setLines((l) => [...l, { speaker: "ai", lang: "en", original: `Translating again (original wording kept): ${last.translated}`, confidence: 0.97 }]);
  }

  function requestHuman() {
    setHandover(true);
    if (sessionId) updateSession(sessionId, { escalation: "requested" });
    log("Tenant", "Requested human support");
  }
  function confirmHandover() {
    setHandedOver(true);
    if (sessionId) updateSession(sessionId, { escalation: "handed-over" });
    log("Relocate AI", "Handover recorded: human operator given summary and authorised case information only");
  }

  const label = (sp: CallLine["speaker"]) => (sp === "tenant" ? profile.name || "Tenant" : sp === "ai" ? "Relocate AI" : p?.agent ?? "Landlord");
  const tone = (sp: CallLine["speaker"]) => (sp === "ai" ? "border-[#00529f]/25 bg-[#e8f0fa]/60" : sp === "tenant" ? "border-slate-200 bg-white" : "border-emerald-200 bg-emerald-50/60");

  if (!p) return <div><SectionTitle title="Voice AI" /><p className="text-sm text-slate-600">No homes available for this city.</p></div>;

  return (
    <div>
      <SectionTitle title="Voice AI" sub="A multilingual assistant that helps you talk to landlords and agents. It always says it is an AI, asks before it contacts anyone, and never records by default." />

      {/* STEP 1-4: setup */}
      {stage === "setup" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {MODES.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)} className={`cursor-pointer rounded-2xl border p-4 text-left transition-colors ${mode === m.id ? "border-[#00529f] bg-[#e8f0fa]" : "border-slate-200 bg-white hover:border-slate-400"}`}>
                <p className="font-semibold text-slate-900">{m.title}</p><p className="mt-1 text-sm text-slate-600">{m.blurb}</p>
              </button>
            ))}
          </div>

          <Card className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-700">Property
              <select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={propId} onChange={(e) => setPropId(e.target.value)}>
                {properties.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
              </select></label>
            <label className="text-sm text-slate-700">Your language
              <select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={profile.language} onChange={(e) => setProfile({ language: e.target.value })}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select></label>
            <p className="text-sm text-slate-600 sm:col-span-2">The landlord or agent speaks <strong>{langLabel(p.landlordLang)}</strong>. {!exactDemo && "The demo script is Russian and English; other languages are supported by the architecture but not scripted here."}</p>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-900">What the AI will say first</h2>
            <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm italic text-slate-700">"{VOICE_DISCLOSURE}"</p>
            <p className="mt-4 text-sm font-medium text-slate-900">The AI will not:</p>
            <ul className="mt-1 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">{CANNOT.map((c) => <li key={c}>• {c}</li>)}</ul>
          </Card>
          <Btn onClick={() => setStage("approval")}>Review the contact plan</Btn>
        </div>
      )}

      {/* STEP 5-6: contact approval screen */}
      {stage === "approval" && (
        <Card className="mx-auto max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-900">Approve this contact</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="font-medium text-slate-500">Property</dt><dd className="text-slate-900">{p.title}, {p.area}, {city.city}</dd></div>
            <div><dt className="font-medium text-slate-500">Party being contacted</dt><dd className="text-slate-900">{p.agent} ({langLabel(p.landlordLang)})</dd></div>
            <div><dt className="font-medium text-slate-500">Reason for contact</dt><dd className="text-slate-900">Confirm availability, deposit, move-in timing and bills.</dd></div>
            <div><dt className="font-medium text-slate-500">Proposed questions</dt>
              <dd><ul className="list-disc pl-5 text-slate-900"><li>Is it still available and furnished?</li><li>Can I move in around two weeks after approval?</li><li>What deposit is required and how is it protected?</li><li>Which bills are included?</li></ul></dd></div>
            <div><dt className="font-medium text-slate-500">Information that will be shared</dt><dd className="text-slate-900">Your first name and preferred language only. No documents or personal details are shared.</dd></div>
            <div><dt className="font-medium text-slate-500">Language</dt><dd className="text-slate-900">You: {langLabel(profile.language)}. Landlord: {langLabel(p.landlordLang)}.</dd></div>
          </dl>
          <label className="mt-5 flex items-start gap-2 text-sm text-slate-800"><input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />I agree that the Relocate AI may contact this party, transcribe the conversation, and translate and forward the questions above.</label>
          <label className="mt-2 flex items-start gap-2 text-sm text-slate-800"><input type="checkbox" className="mt-1" checked={recordingWanted} onChange={(e) => setRecordingWanted(e.target.checked)} />Ask all participants for permission to record audio (off by default; the landlord can decline and the call continues with live translation).</label>
          <div className="mt-5 flex flex-wrap gap-2">
            <Btn disabled={!consent} onClick={startCall}>Start AI-assisted call</Btn>
            <Btn variant="ghost" disabled={!consent} onClick={() => { recordConsent("Send a text message instead of calling", true); log("Tenant", "Chose to send a text message instead of a call"); setMode("contact"); startCall(); }}>Send text message instead</Btn>
            <Btn variant="ghost" onClick={() => setStage("setup")}>Back</Btn>
          </div>
        </Card>
      )}

      {/* STEP 7-9: live call */}
      {stage === "call" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="flex flex-col items-center text-center">
            <Pill tone={status === "live" ? "green" : "amber"}>{status === "connecting" ? "Connecting..." : status === "live" ? "Live" : "Ended"}</Pill>
            <button onClick={() => setMuted((m) => !m)} aria-label="Microphone" className={`mt-5 flex h-24 w-24 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition ${muted ? "bg-slate-400" : "bg-[#00529f]"} ${status === "live" && !muted ? "animate-pulse" : ""}`}>
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" />{muted && <path d="M4 4l16 16" />}</svg>
            </button>
            <p className="mt-3 text-sm text-slate-600">{muted ? "Muted" : "Listening"} · {langLabel(profile.language)}</p>
            <p className="mt-1 text-xs"><span className={`rounded px-1.5 py-0.5 font-semibold ${session?.recording === "on" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{session?.recording === "on" ? "● REC (all consented)" : "Not recording"}</span></p>
            <div className="mt-5 grid w-full grid-cols-2 gap-2">
              <Btn variant={translate ? "soft" : "ghost"} onClick={() => setTranslate((t) => !t)}>{translate ? "Translation on" : "Translation off"}</Btn>
              <Btn variant={showText ? "soft" : "ghost"} onClick={() => setShowText((t) => !t)}>{showText ? "Text shown" : "Show text"}</Btn>
              <Btn variant="ghost" onClick={repeatLast}>Repeat</Btn>
              <Btn variant={slow ? "soft" : "ghost"} onClick={() => setSlow((s) => !s)}>{slow ? "Slower: on" : "Slow down"}</Btn>
              <Btn variant="ghost" onClick={translateAgain}>Translate again</Btn>
              <Btn variant="ghost" onClick={requestHuman}>Human support</Btn>
              <Btn variant={msgApproved ? "soft" : "ghost"} onClick={() => { setMsgApproved(true); log("Tenant", "Approved the proposed follow-up message"); }}>{msgApproved ? "Message approved" : "Approve message"}</Btn>
              <Btn variant={docShare ? "soft" : "ghost"} onClick={() => { setDocShare((d) => !d); recordConsent("Share documents with the landlord", !docShare); }}>{docShare ? "Documents shared" : "Approve doc sharing"}</Btn>
            </div>
            <Btn variant="danger" className="mt-3 w-full" onClick={endCall}>End call</Btn>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="font-semibold text-slate-900">Live captions</h2>
            {showText ? (
              <div className="mt-3 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                {lines.map((l, i) => (
                  <div key={i} className={`rounded-xl border p-3 ${l.clarify ? "border-amber-300 bg-amber-50" : tone(l.speaker)}`}>
                    <p className="text-xs font-semibold text-slate-500">{label(l.speaker)} · {langLabel(l.lang)}{l.confidence !== undefined && ` · confidence ${Math.round(l.confidence * 100)}%`}</p>
                    <p className="mt-1 text-sm text-slate-900">{l.original}</p>
                    {translate && l.translated && <p className="mt-1.5 text-sm text-slate-600"><span className="mr-1 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">AI translation</span>{l.translated}</p>}
                    {l.clarify && <p className="mt-1.5 text-xs font-medium text-amber-800">⚠ {l.clarify}</p>}
                  </div>
                ))}
                {status === "live" && cursor < script.length && <p className="text-xs text-slate-400">Transcribing...</p>}
                <div ref={endRef} />
              </div>
            ) : <p className="mt-3 text-sm text-slate-500">Text hidden. Tap "Show text" to read the captions.</p>}
            {status === "ended" && <div className="mt-4"><Btn onClick={endCall}>View summary</Btn></div>}
          </Card>
        </div>
      )}

      {/* STEP 10-13: summary */}
      {stage === "summary" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Summary (English)</h2><Pill tone="green">Ready for review</Pill></div>
              <Block title="Key answers" items={CALL_SUMMARY.keyAnswers} /><Block title="Agreed (not binding)" items={CALL_SUMMARY.agreedTerms} />
              <Block title="Unresolved" items={CALL_SUMMARY.unresolved} /><Block title="Next steps" items={CALL_SUMMARY.nextSteps} />
            </Card>
            <Card>
              <h2 className="font-semibold text-slate-900">Резюме ({langLabel(profile.language) === "Russian" ? "русский" : "your language"})</h2>
              {exactDemo ? (<>
                <Block title="Ключевые ответы" items={["Квартира полностью меблирована, есть стиральная машина", "Вода включена в аренду; электричество и интернет отдельно"]} />
                <Block title="Договорённости (не обязывают)" items={["Предварительный заезд: через две недели после одобрения", "Залог: около месячной аренды, будет подтверждён письменно"]} />
                <Block title="Открытые вопросы" items={["Точное время заезда", "Варианты интернет-провайдеров"]} />
                <Block title="Дальнейшие шаги" items={["Вы проверяете и одобряете резюме", "Арендодатель проверяет резюме на своём языке", "Переход к документам и договору (отдельный контролируемый шаг)"]} />
              </>) : <p className="mt-3 text-sm text-slate-600">The bilingual demo summary is scripted for Russian and English. Other languages plug into the same layer.</p>}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="font-semibold text-slate-900">Tasks and reminders</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-800">
                {["Upload ID and proof of income", "Confirm bills with the landlord", "Book a viewing or video tour"].map((t) => (
                  <li key={t}><label className="flex items-center gap-2"><input type="checkbox" checked={!!tasks[t]} onChange={(e) => setTasks((x) => ({ ...x, [t]: e.target.checked }))} />{t}</label></li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn disabled={approvedNext} onClick={() => { setApprovedNext(true); if (sessionId) updateSession(sessionId, { summary: "approved" }); log("Tenant", "Approved summary and next steps"); }}>{approvedNext ? "Next step approved" : "Approve next step"}</Btn>
                <Btn variant="ghost" onClick={requestHuman}>Request human support</Btn>
              </div>
              <p className="mt-3 text-xs text-slate-500">Landlord review: {approvedNext ? "summary sent to the landlord in their language." : "pending your approval."}</p>
            </Card>
            <Card>
              <h2 className="font-semibold text-slate-900">Continue the rental process</h2>
              <p className="mt-1 text-sm text-slate-600">Offers, signatures and payments move into separate controlled workflows.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn variant="soft" onClick={() => openAnalysis(p.id)}>View property</Btn>
                <Btn variant="soft" onClick={() => go("documents")}>Documents</Btn>
                <Btn variant="soft" disabled={!Object.values(interest).includes("mutual")} onClick={() => go("agreement")}>Agreement</Btn>
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="font-semibold text-slate-900">Conversation record</h2>
            <p className="mt-1 text-xs text-slate-500">Two layers are stored separately: the original conversation and the translation.</p>
            {deleted ? <p className="mt-3 text-sm text-slate-600">Transcripts for this session were deleted. The audit entry remains.</p> : (
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Layer 1: original</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-700">{lines.map((l, i) => <li key={i}><strong>{label(l.speaker)}</strong> ({l.lang}): {l.original}</li>)}</ul></div>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Layer 2: translation</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-700">{lines.filter((l) => l.translated || l.clarify).map((l, i) => <li key={i}>{l.translated ?? ""}{l.confidence !== undefined && ` (confidence ${Math.round(l.confidence * 100)}%)`}{l.clarify && ` Clarification: ${l.clarify}`}</li>)}</ul></div>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <label className="text-slate-700">Keep transcripts for
                <select className="ml-2 rounded-lg border border-slate-300 px-2 py-1" value={retention} onChange={(e) => setRetention(Number(e.target.value))}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select></label>
              <Btn variant="danger" disabled={deleted} onClick={() => { setDeleted(true); log("Tenant", "Deleted transcripts for this voice session"); }}>Delete transcripts now</Btn>
            </div>
            {session && (
              <details className="mt-4 text-xs text-slate-600"><summary className="cursor-pointer font-medium text-slate-800">Session record (voice_session)</summary>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries({ "Session ID": session.id, "Property ID": session.propertyId, "Tenant ID": session.tenantId, "Landlord / agent ID": session.landlordId, Start: session.start, End: session.end ?? "-", Participants: session.participants.join(", "), Languages: session.languages.map(langLabel).join(" / "), Consent: session.consent, Recording: session.recording, Transcript: deleted ? "deleted" : session.transcript, Summary: session.summary, Escalation: session.escalation }).map(([k, v]) => <div key={k} className="contents"><dt className="font-medium">{k}</dt><dd>{v}</dd></div>)}
                </dl></details>
            )}
          </Card>
          <Btn variant="ghost" onClick={() => { setStage("setup"); setLines([]); setCursor(0); setStatus("idle"); setConsent(false); setApprovedNext(false); setDeleted(false); setHandover(false); setHandedOver(false); }}>Start another conversation</Btn>
        </div>
      )}

      {/* Human handover */}
      {handover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <Card className="w-full max-w-md">
            <h2 className="font-semibold text-slate-900">Human handover</h2>
            {!handedOver ? (<>
              <p className="mt-2 text-sm text-slate-700">A human support agent can join. They will see the conversation summary first and only the case information you have authorised: the property, the summary and any documents you shared. The handover is recorded in the audit trail.</p>
              <div className="mt-4 flex gap-2"><Btn onClick={confirmHandover}>Hand over to a human</Btn><Btn variant="ghost" onClick={() => setHandover(false)}>Cancel</Btn></div>
            </>) : (<>
              <p className="mt-2 text-sm text-emerald-800">Handover recorded. A human operator will join shortly, in {langLabel(profile.language)}.</p>
              <div className="mt-4"><Btn onClick={() => setHandover(false)}>Close</Btn></div>
            </>)}
          </Card>
        </div>
      )}

      {consents.length > 0 && stage !== "setup" && (
        <details className="mt-8 text-xs text-slate-500"><summary className="cursor-pointer">Consent records ({consents.length})</summary>
          <ul className="mt-2 space-y-1">{consents.map((c, i) => <li key={i}>{c.at}: {c.kind} - {c.granted ? "granted" : "declined / not requested"}</li>)}</ul></details>
      )}
      <div className="mt-8"><Disclaimer text="Demo: this is a simulated voice experience with scripted responses. No real calls, recordings, speech recognition or translation take place. The architecture keeps voice, translation, telephony and verification providers swappable. Legal, immigration and financial questions need a qualified local professional." /></div>
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <ul className="mt-1.5 space-y-1 text-sm text-slate-800">{items.map((i) => <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00529f]" />{i}</li>)}</ul></div>
  );
}
