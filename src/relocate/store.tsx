import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cityById, CITIES, PROPERTIES, type CityId, type Property } from "./data";

export type View =
  | "home" | "onboarding" | "search" | "analysis" | "shortlist"
  | "documents" | "agreement" | "voice" | "services" | "corporate";

export type Profile = {
  name: string;
  budget: number;
  moveDate: string;
  household: number;
  pets: boolean;
  furnished: "any" | "furnished" | "unfurnished";
  maxCommute: number;
  visa: "has" | "applying" | "none" | "citizen";
  criteria: string[];
  language: string;
  done: boolean;
};

export type DocStatus = "todo" | "uploaded" | "verifying" | "verified";
export type AuditEntry = { at: string; actor: string; action: string };

export type ConsentRecord = { at: string; kind: string; granted: boolean };
export type VoiceSession = {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  start: string;
  end: string | null;
  participants: string[];
  languages: string[];
  consent: "granted" | "declined";
  recording: "off" | "on";
  transcript: "none" | "live" | "saved";
  summary: "none" | "ready" | "approved";
  escalation: "none" | "requested" | "handed-over";
};

type Store = {
  view: View;
  go: (v: View) => void;
  cityId: CityId;
  setCityId: (c: CityId) => void;
  profile: Profile;
  setProfile: (p: Partial<Profile>) => void;
  properties: Property[];
  activeId: string | null;
  openAnalysis: (id: string) => void;
  shortlist: string[];
  toggleShortlist: (id: string) => void;
  interest: Record<string, "sent" | "mutual">;
  sendInterest: (id: string) => void;
  docs: Record<string, DocStatus>;
  advanceDoc: (id: string) => void;
  audit: AuditEntry[];
  log: (actor: string, action: string) => void;
  consents: ConsentRecord[];
  recordConsent: (kind: string, granted: boolean) => void;
  sessions: VoiceSession[];
  addSession: (s: VoiceSession) => void;
  updateSession: (id: string, patch: Partial<VoiceSession>) => void;
  voiceProperty: string | null;
  startVoice: (propertyId?: string) => void;
  supportOpen: boolean;
  setSupportOpen: (o: boolean) => void;
};

const Ctx = createContext<Store | null>(null);

export function useRelocate(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useRelocate must be used inside <RelocateProvider>");
  return s;
}

const now = () => new Date().toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });

export function RelocateProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("home");
  const [cityId, setCity] = useState<CityId>("london");
  const [profile, setProfileState] = useState<Profile>({
    name: "", budget: 2400, moveDate: "2026-12-01", household: 1, pets: false,
    furnished: "any", maxCommute: 30, visa: "applying", criteria: [], language: "ru", done: false,
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [interest, setInterest] = useState<Record<string, "sent" | "mutual">>({});
  const [docs, setDocs] = useState<Record<string, DocStatus>>({});
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [voiceProperty, setVoiceProperty] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  const log = useCallback((actor: string, action: string) => {
    setAudit((a) => [...a, { at: now(), actor, action }]);
  }, []);

  const go = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  }, []);

  const setCityId = useCallback((c: CityId) => {
    setCity(c);
    // Re-centre the default budget on the new city's market.
    setProfileState((p) => ({ ...p, budget: Math.round((cityById(c).avg1bed * 1.15) / 50) * 50 }));
  }, []);

  const setProfile = useCallback((patch: Partial<Profile>) => setProfileState((p) => ({ ...p, ...patch })), []);

  const properties = useMemo(() => PROPERTIES.filter((p) => p.city === cityId), [cityId]);

  const openAnalysis = useCallback((id: string) => {
    setActiveId(id);
    setView("analysis");
    window.scrollTo({ top: 0 });
  }, []);

  const toggleShortlist = useCallback((id: string) => {
    setShortlist((s) => {
      const has = s.includes(id);
      log("Tenant", `${has ? "Removed from" : "Added to"} shortlist: ${PROPERTIES.find((p) => p.id === id)?.title ?? id}`);
      return has ? s.filter((x) => x !== id) : [...s, id];
    });
  }, [log]);

  const sendInterest = useCallback((id: string) => {
    setInterest((i) => (i[id] ? i : { ...i, [id]: "sent" }));
    log("Tenant", `Expressed interest in ${PROPERTIES.find((p) => p.id === id)?.title ?? id}`);
    // Demo: the landlord reciprocates shortly after, which creates a match.
    window.setTimeout(() => {
      setInterest((i) => (i[id] === "sent" ? { ...i, [id]: "mutual" } : i));
      log("Landlord / agent", `Confirmed mutual interest for ${PROPERTIES.find((p) => p.id === id)?.title ?? id}`);
    }, 2200);
  }, [log]);

  const advanceDoc = useCallback((id: string) => {
    const cur = docs[id] ?? "todo";
    if (cur === "todo") {
      setDocs((d) => ({ ...d, [id]: "uploaded" }));
      log("Tenant", `Uploaded document: ${id}`);
    } else if (cur === "uploaded") {
      setDocs((d) => ({ ...d, [id]: "verifying" }));
      log("Verification", `Verification started (demo): ${id}`);
      window.setTimeout(() => {
        setDocs((x) => ({ ...x, [id]: "verified" }));
        log("Verification", `Document verified (demo): ${id}`);
      }, 1800);
    }
  }, [docs, log]);

  const recordConsent = useCallback((kind: string, granted: boolean) => {
    setConsents((c) => [...c, { at: now(), kind, granted }]);
    log("Tenant", `Consent ${granted ? "granted" : "declined"}: ${kind}`);
  }, [log]);

  const addSession = useCallback((s: VoiceSession) => setSessions((x) => [...x, s]), []);
  const updateSession = useCallback(
    (id: string, patch: Partial<VoiceSession>) => setSessions((x) => x.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    []
  );

  const startVoice = useCallback((propertyId?: string) => {
    setVoiceProperty(propertyId ?? shortlist[0] ?? properties[0]?.id ?? null);
    setSupportOpen(false);
    setView("voice");
    window.scrollTo({ top: 0 });
  }, [shortlist, properties]);

  const value: Store = {
    view, go, cityId, setCityId, profile, setProfile, properties, activeId, openAnalysis,
    shortlist, toggleShortlist, interest, sendInterest, docs, advanceDoc, audit, log,
    consents, recordConsent, sessions, addSession, updateSession, voiceProperty, startVoice,
    supportOpen, setSupportOpen,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { CITIES };

// ---- AI-style analysis (transparent rules, not a black box) ----------------

export type Analysis = {
  score: number;
  affordability: { ratio: number; label: string };
  commute: string;
  area: string;
  flags: string[];
  next: string;
  breakdown: { label: string; delta: number }[];
};

export function analyse(p: Property, pr: Profile): Analysis {
  const breakdown: { label: string; delta: number }[] = [];
  const flags = [...p.flags];
  const add = (label: string, delta: number) => delta !== 0 && breakdown.push({ label, delta });

  const ratio = p.rent / Math.max(pr.budget, 1);
  if (ratio > 1) { add(`Rent is ${Math.round((ratio - 1) * 100)}% above your budget`, -Math.min(45, Math.round(20 + (ratio - 1) * 100))); flags.push("Over your monthly budget"); }
  else if (ratio > 0.9) add("Close to your budget ceiling", -8);

  const bedsNeeded = Math.ceil(pr.household / 2);
  if (p.beds < bedsNeeded) { add("Fewer bedrooms than your household usually needs", -18); flags.push(`${p.beds} bedroom(s) for ${pr.household} people`); }

  if (pr.pets && !p.pets) { add("Pets may not be allowed", -25); flags.push("Pets are not listed as accepted"); }
  if (pr.furnished === "furnished" && !p.furnished) add("You asked for furnished", -10);
  if (pr.furnished === "unfurnished" && p.furnished) add("You asked for unfurnished", -6);

  if (p.commute > pr.maxCommute) add(`Commute is ${p.commute - pr.maxCommute} min over your limit`, -Math.min(20, p.commute - pr.maxCommute));

  const days = (new Date(p.available).getTime() - new Date(pr.moveDate).getTime()) / 86400000;
  if (days > 30) { add("Available well after your move date", -10); flags.push("Not available by your move date"); }
  if (days < -60) add("Available much earlier than you need", -4);

  if (pr.visa === "none") { add("No status or visa route yet", -8); flags.push("Landlords commonly ask for proof of status before signing"); }

  const score = Math.max(0, Math.min(100, 100 + breakdown.reduce((s, b) => s + b.delta, 0)));
  const affordLabel =
    ratio <= 0.9 ? "Comfortable" : ratio <= 1 ? "Tight but within budget" : "Over budget";
  const area =
    p.commute <= 15 ? `${p.area} is central: short commutes, usually higher rents.`
    : p.commute <= 30 ? `${p.area} balances access and price.`
    : `${p.area} is further out: more space for the money, longer commutes.`;
  const next =
    score >= 80 ? "Strong fit. Shortlist it and express interest so the landlord can confirm."
    : score >= 60 ? "Worth a closer look. Check the flagged items with the landlord first."
    : "Weak fit on your current criteria. Compare it against other options before spending time.";

  return { score, affordability: { ratio, label: affordLabel }, commute: `${p.commute} min to the centre`, area, flags, next, breakdown };
}
