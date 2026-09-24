import { marketFor } from "../data/ukMarketData";

// The Relocate AI chat brain. Two modes, same shape either way:
//
// 1. Real mode - once VITE_ANTHROPIC_API_KEY is set (same env var the
//    property AI analysis already uses, see app/utils/aiAnalysis.ts for the
//    identical pattern), every reply is a real Claude call using the system
//    prompt below. THIS is "training the AI the way it answers" - edit
//    RELOCATE_SYSTEM_PROMPT and the persona changes for every reply, no
//    other code needs to touch this file.
// 2. Demo mode - no key configured (this build's default). Replies come
//    from the small rule-based responder further down: the guided intake
//    questions are fixed, and free-form replies after that match on
//    keywords against a short UK-relocation knowledge base. It's honest
//    about being a placeholder (the intro message says so) rather than
//    pretending to be the real thing.
//
// Swap point for tomorrow: nothing else in RelocateAI.tsx needs to change -
// getRelocateReply() already tries the real API first and only falls back
// to the canned responder if no key is present or the call fails.

const MODEL = "claude-sonnet-4-5";

export const RELOCATE_SYSTEM_PROMPT = `You are Linda, Buynidify's Relocate AI concierge. You help someone moving to a UK city work out where to live, roughly what it costs, and what the process of getting there looks like (visa route, timeline, documents).

Tone: warm, concise, genuinely helpful - like a well-travelled friend who's done this before, not a legal document. Use short paragraphs or a few bullet points, never a wall of text.

Ground cost-of-living answers in realistic UK rental figures for the city mentioned. For visa/immigration questions, give general, directionally-correct guidance about the likely route (Skilled Worker visa for a UK job offer, Student visa for study, family/partner visa for joining a family member already settled, EU Settlement Scheme status for EU citizens who moved before the cutoff) and the kind of documents typically needed - but always make clear this is general orientation, not legal advice, and that gov.uk and a licensed immigration adviser are the authoritative source for their specific situation.

Never invent specific fees, processing times, or dates - immigration rules change often. Speak in ranges and "typically" language instead.`;

function getApiKey(): string | undefined {
  return import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
}

export type ChatTurn = { role: "user" | "assistant"; text: string };

async function callClaude(apiKey: string, history: ChatTurn[]): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      system: RELOCATE_SYSTEM_PROMPT,
      messages: history.map((t) => ({ role: t.role, content: t.text })),
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string") throw new Error("Unexpected Anthropic response shape");
  return text;
}

/* --------------------------- demo-mode responder --------------------------- */

const VISA_INFO: Record<string, string> = {
  work: `For a job-based move, the usual route is the **Skilled Worker visa** - it needs a job offer from a UK employer licensed to sponsor you, at or above the going rate for that role. Your employer issues a "certificate of sponsorship" that you use to apply. Typical documents: passport, the sponsorship certificate, proof of your qualifications, and proof you can support yourself initially.`,
  study: `For a course-based move, that's the **Student visa** - you need an unconditional offer from a licensed UK education provider (they'll issue a "CAS" - confirmation of acceptance for studies), proof you can cover tuition and living costs, and in some cases an English-language test.`,
  family: `Joining a partner or family member already settled in the UK usually goes through a **family/partner visa** - the core requirement is proving the relationship is genuine and ongoing, plus meeting a minimum income threshold (met by either of you, or savings). It's one of the more document-heavy routes, so starting the paperwork early really helps.`,
  eu: `If you're an EU, EEA or Swiss citizen who was already living in the UK before the free-movement cutoff, you'd hold **EU Settlement Scheme** status rather than needing a fresh visa. Moving now as an EU citizen without prior UK residence puts you on the same routes as anyone else (work, study, family) - freedom of movement itself has ended.`,
  other: `There are a few other routes depending on your situation - a High Potential Individual visa (recent graduate of a top global university), Global Talent, or Youth Mobility for some nationalities. Tell me a bit more about your situation and I can point you toward the likeliest one.`,
};

const FAQ: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["document", "paperwork", "papers", "need to bring"],
    reply:
      "Typically you'll want: a valid passport, proof of the reason you're moving (job offer/CAS/relationship evidence), proof of funds, and any qualification certificates relevant to your visa route. For the housing side specifically, landlords/investors on Buynidify usually ask for ID, proof of income or savings, and references once you're matched with a property.",
  },
  {
    keywords: ["timeline", "how long", "when should i", "how much time"],
    reply:
      "As a rough shape: visa applications are often processed within a few weeks once submitted, but gathering the supporting documents (sponsorship, financial evidence, translations) is usually the slower part - most people start that 2-3 months before their planned move. Housing itself can move faster once you're actually in the country or have a firm move-in date, since landlords generally want to let to someone who can move in soon.",
  },
  {
    keywords: ["cost", "afford", "budget", "expensive", "cheap", "rent", "price"],
    reply: "__CITY_COST__",
  },
  {
    keywords: ["bank", "account", "open an account"],
    reply:
      "Most UK banks will open an account once you have a UK address and proof of ID - some now offer accounts you can open before you land, which is worth doing early since a lot of things (a tenancy, a phone contract, payroll) expect one.",
  },
  {
    keywords: ["nhs", "health", "doctor", "gp", "medical"],
    reply:
      "Once you're a resident you register with a local GP practice (free) for everyday healthcare - the NHS surcharge, paid as part of most visa applications, covers this. It's worth registering as soon as you have a fixed address rather than waiting until you need care.",
  },
  {
    keywords: ["school", "children", "kids", "education"],
    reply:
      "State schools are free and allocated by catchment area, so where you end up living can genuinely affect which schools are realistic - worth checking a specific area's school ratings before committing to a lease if you're moving with children.",
  },
  {
    keywords: ["area", "neighbourhood", "neighborhood", "where should i live", "which area"],
    reply: "__CITY_AREAS__",
  },
];

function matchCity(text: string): string | null {
  const lower = text.toLowerCase();
  const cities = ["london", "manchester", "birmingham", "edinburgh", "glasgow", "liverpool", "leeds", "bristol", "sheffield", "newcastle", "cardiff", "nottingham", "oxford", "cambridge", "brighton", "southampton"];
  return cities.find((c) => lower.includes(c)) ?? null;
}

function demoReply(userText: string, knownCity: string | null): string {
  const lower = userText.toLowerCase();
  const mentioned = matchCity(userText) ?? knownCity;

  const faq = FAQ.find((f) => f.keywords.some((k) => lower.includes(k)));
  if (faq) {
    if (faq.reply === "__CITY_COST__") {
      if (!mentioned) return "Which city are you thinking of? I can give you real rent ranges once I know where.";
      const m = marketFor(mentioned);
      return `In ${mentioned[0].toUpperCase()}${mentioned.slice(1)}, a 1-bed typically runs ${gbpRange(m.rentByBeds[1])}/month and a 2-bed ${gbpRange(m.rentByBeds[2])}/month. ${m.summary}`;
    }
    if (faq.reply === "__CITY_AREAS__") {
      if (!mentioned) return "Tell me which city and I'll point you to a few areas worth a look.";
      const m = marketFor(mentioned);
      return `Worth a look in ${mentioned[0].toUpperCase()}${mentioned.slice(1)}: ${m.popularAreas.join(", ")}. Once you register on Buynidify I can match you against live listings in whichever of these fits your budget.`;
    }
    return faq.reply;
  }

  if (/(visa|immigration|apply|application)/.test(lower)) {
    return "What's bringing you to the UK - a job, study, joining family, or something else? That decides which visa route actually applies to you.";
  }

  return "Got it. Ask me anything about the move - visas, cost of living in a specific city, what documents you'll need, or where to live - and I'll help however I can from here.";
}

function gbpRange([low, high]: [number, number]): string {
  const f = (n: number) => `£${n.toLocaleString("en-GB")}`;
  return `${f(low)}-${f(high)}`;
}

export function visaGuidanceFor(purpose: "work" | "study" | "family" | "eu" | "other"): string {
  return VISA_INFO[purpose];
}

/** Runs the real AI when a key is configured, otherwise the rule-based demo
 *  responder. Never throws - always resolves to something to show. */
export async function getRelocateReply(
  history: ChatTurn[],
  knownCity: string | null
): Promise<{ text: string; source: "ai" | "demo" }> {
  const apiKey = getApiKey();
  if (apiKey) {
    try {
      const text = await callClaude(apiKey, history);
      return { text, source: "ai" };
    } catch {
      // Fall through to the demo responder rather than breaking the chat.
    }
  }
  const lastUser = [...history].reverse().find((t) => t.role === "user");
  return { text: demoReply(lastUser?.text ?? "", knownCity), source: "demo" };
}
