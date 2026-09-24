import type { Analysis, ImportedProperty } from "../context/ListingsContext";

// The real AI analysis. This is a Buynidify service, not something a user
// configures - there is no key entry field anywhere in the app. The key
// lives in this build's environment (set once, by Véta, not per-user) and
// every "Run AI analysis" click uses it automatically. Claude Sonnet is the
// model: strong enough for a structured property analysis, without paying
// for a top-tier model on every click.
//
// No backend exists yet (this is still a client-only Vite app), so for now
// the key is read from a Vite env var and the call is made directly from
// the browser with Anthropic's direct-browser-access header. That's fine to
// ship a working demo, but it does mean the key ends up in the shipped JS
// bundle, inspectable by anyone - a real production deploy should move this
// call behind a small server/serverless endpoint so the key never reaches
// the browser at all.

const MODEL = "claude-sonnet-4-5";

function getApiKey(): string | undefined {
  return import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
}

// The contract: exactly what we ask the model for, and exactly what we
// require back. Both analysis cards on the property render straight off
// this shape (see ListingsContext's InvestorAnalysis / BuyerAnalysis types),
// so the model's JSON has to match it field-for-field or the UI has nothing
// to show. Keeping the schema in one place, next to the prompt that asks
// for it, is what "a good format for what we need from AI" means in code.
const INVESTOR_SCHEMA = `{
  "summary": string (1-2 sentences),
  "monthlyRent": number (GBP, whole pounds),
  "grossYield": number (percent, 1 decimal),
  "netYield": number (percent, 1 decimal),
  "locationScore": number (0-10, 1 decimal),
  "rentalDemand": "Moderate" | "High" | "Very high",
  "timeToLet": string (e.g. "2-4 weeks"),
  "tenantProfile": string (e.g. "Young professionals"),
  "positives": string[] (3-5 short bullet points),
  "consider": string[] (3-5 short bullet points, risks/caveats),
  "suggestions": string[] (2-4 short bullet points, actionable)
}`;

const BUYER_SCHEMA = `{
  "summary": string (1-2 sentences),
  "deposit": number (GBP, 10% of price unless you have reason to vary it),
  "upfrontCosts": number (GBP, stamp duty + fees estimate),
  "estimatedMonthlyRent": number (GBP, whole pounds - what a tenant would likely pay to rent this property if an investor bought it and let it out),
  "commuteScore": number (0-10, 1 decimal),
  "amenitiesScore": number (0-10, 1 decimal),
  "valueForMoney": "Fair" | "Good" | "Excellent",
  "positives": string[] (3-5 short bullet points),
  "consider": string[] (3-5 short bullet points, risks/caveats),
  "suggestions": string[] (2-4 short bullet points, actionable)
}`;

function buildPrompt(p: ImportedProperty, kind: "investor" | "buyer"): string {
  const facts = [
    `Property type: ${p.type}`,
    `Bedrooms: ${p.beds}`,
    p.baths ? `Bathrooms: ${p.baths}` : null,
    `Location: ${p.location}${p.postcode ? ` (${p.postcode})` : ""}`,
    `Asking price: £${p.price.toLocaleString("en-GB")}`,
    `Portal: ${p.portal}`,
    p.agent ? `Marketed by: ${p.agent}` : null,
    `Listing URL: ${p.url}`,
  ]
    .filter(Boolean)
    .join("\n");

  const role =
    kind === "investor"
      ? "a UK buy-to-let investor deciding whether this property is a good rental investment"
      : "a UK home buyer deciding whether this property suits their budget and needs";

  const schema = kind === "investor" ? INVESTOR_SCHEMA : BUYER_SCHEMA;

  return `You are Buynidify's property analysis assistant, helping ${role}.

Property details:
${facts}

Using UK property market knowledge (England unless the location says otherwise), analyse this property and respond with ONLY a single JSON object - no markdown fences, no commentary before or after - matching exactly this shape:
${schema}

All string arrays must be plain sentences, no leading bullet characters. Base numeric estimates on realistic UK market ranges for the location and property type given. If you are uncertain about a figure, give your best reasonable estimate rather than omitting the field - every field is required.`;
}

type ParsedResult =
  | { ok: true; analysis: Analysis }
  | { ok: false; reason: "no-key" | "request-failed" | "bad-response"; message: string };

function extractJson(text: string): unknown {
  // Models sometimes wrap JSON in ```json fences despite instructions -
  // strip those before parsing rather than failing on them.
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

async function callClaude(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      // Required to call the Anthropic API directly from a browser rather
      // than a server. Fine for this demo; see the note at the top of the
      // file about moving this server-side for production.
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string") throw new Error("Unexpected Anthropic response shape");
  return text;
}

function validate(kind: "investor" | "buyer", obj: any): obj is Record<string, unknown> {
  if (!obj || typeof obj !== "object") return false;
  const common = ["summary", "positives", "consider", "suggestions"];
  const investorFields = ["monthlyRent", "grossYield", "netYield", "locationScore", "rentalDemand", "timeToLet", "tenantProfile"];
  const buyerFields = ["deposit", "upfrontCosts", "estimatedMonthlyRent", "commuteScore", "amenitiesScore", "valueForMoney"];
  const required = kind === "investor" ? [...common, ...investorFields] : [...common, ...buyerFields];
  return required.every((k) => k in obj);
}

/** Runs the real AI analysis using the service's own key, or reports
 *  "no-key" (this build's environment has none set) so the caller falls
 *  back to the demo estimate. Never throws - every failure comes back as a
 *  typed result so the UI can show something sensible instead of breaking. */
export async function runAiAnalysis(
  p: ImportedProperty,
  kind: "investor" | "buyer"
): Promise<ParsedResult> {
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, reason: "no-key", message: "No AI key configured for this build." };

  const prompt = buildPrompt(p, kind);

  try {
    const text = await callClaude(apiKey, prompt);

    let parsed: unknown;
    try {
      parsed = extractJson(text);
    } catch {
      return { ok: false, reason: "bad-response", message: "The model didn't return valid JSON." };
    }

    if (!validate(kind, parsed)) {
      return { ok: false, reason: "bad-response", message: "The model's response was missing required fields." };
    }

    const analysis = { kind, source: "ai", ...(parsed as object) } as Analysis;
    return { ok: true, analysis };
  } catch (err) {
    return {
      ok: false,
      reason: "request-failed",
      message: err instanceof Error ? err.message : "The AI request failed.",
    };
  }
}
