// Trimmed-down slice of the multilingual Voice AI mediation spec: a fully
// scripted, simulated call (no real telephony/speech/translation APIs -
// consistent with the demo-mode pattern already used in relocateAIEngine.ts
// and supportAgent.ts). Shows the shape - consent first, live transcript
// with original + translated text side by side, bilingual summary - without
// building real infra a demo doesn't need.

export type Speaker = "tenant" | "ai" | "landlord";

export type TranscriptLine = {
  speaker: Speaker;
  language: string; // BCP-47-ish label, just for display
  original: string;
  translated?: string; // shown as a caption under the line, in the other party's language
};

export const DEMO_LANGUAGES = [
  { code: "ru", label: "Russian" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Mandarin" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "tr", label: "Turkish" },
  { code: "hi", label: "Hindi" },
  { code: "pl", label: "Polish" },
  { code: "uk", label: "Ukrainian" },
  { code: "it", label: "Italian" },
];

export const AI_DISCLOSURE =
  "I am the Relocate AI assistant. I can help explain, translate, summarise and coordinate the rental process. I am not a lawyer, estate agent or immigration adviser.";

/** A short, fully scripted tenant (Russian) <-> AI <-> landlord (English)
 * call, per the brief's own explicit demo instruction. Every line is fixed
 * text - nothing here calls a real speech or translation API. */
export const DEMO_CALL_SCRIPT: TranscriptLine[] = [
  { speaker: "ai", language: "English", original: AI_DISCLOSURE },
  {
    speaker: "tenant",
    language: "Russian",
    original: "Здравствуйте, я звоню по поводу квартиры. Можно узнать, включена ли мебель?",
    translated: "Hello, I'm calling about the flat. Could I ask if it comes furnished?",
  },
  {
    speaker: "ai",
    language: "English",
    original: "Translating for the landlord: the tenant is asking whether the flat is furnished.",
  },
  {
    speaker: "landlord",
    language: "English",
    original: "Yes, it's fully furnished - bed, sofa, washing machine, and a fridge-freezer.",
    translated: "Да, квартира полностью меблирована: кровать, диван, стиральная машина и холодильник.",
  },
  {
    speaker: "tenant",
    language: "Russian",
    original: "Отлично. А можно заехать через две недели? И какой залог нужен?",
    translated: "Great. Would move-in in two weeks work? And what deposit is required?",
  },
  {
    speaker: "landlord",
    language: "English",
    original: "Two weeks works for me. The deposit is one month's rent, protected in a government scheme.",
    translated: "Через две недели - без проблем. Залог составляет месячную арендную плату, защищён государственной схемой.",
  },
  {
    speaker: "ai",
    language: "English",
    original: "Both sides have agreed on move-in timing and deposit. Shall I put together a summary and next steps for you both?",
  },
];

export type CallSummary = {
  keyAnswers: string[];
  agreedTerms: string[];
  unresolved: string[];
  nextSteps: string[];
};

export const DEMO_CALL_SUMMARY: CallSummary = {
  keyAnswers: [
    "Flat is fully furnished (bed, sofa, washing machine, fridge-freezer)",
    "Deposit is one month's rent, held in a government-backed deposit scheme",
  ],
  agreedTerms: ["Move-in date: two weeks from today", "Deposit: one month's rent"],
  unresolved: ["Exact move-in time on the day", "Whether bills are included in the rent"],
  nextSteps: [
    "Buynidify sends both parties a written summary in their own language",
    "Tenant reviews and confirms the reference and ID documents needed",
    "Landlord issues a tenancy agreement for e-signature",
  ],
};
