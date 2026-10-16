// Relocate AI chat: a real Claude call, made on the server so the API key
// never reaches the browser. Set ANTHROPIC_API_KEY in Vercel's environment
// variables. Without it this returns 503 and the app falls back to its
// built-in scripted replies, so the demo never breaks.
//
// The system prompt below encodes the rules from the Relocate AI brief:
// always disclose being an AI, never give legal/immigration/financial advice,
// ask for consent before contacting anyone, never invent facts, escalate to a
// human or qualified professional when the topic is regulated.

export const config = { runtime: "edge" };

const MODEL = "claude-sonnet-4-5";

const SYSTEM = `You are the Relocate AI assistant, a multilingual assistant that helps people who move abroad find and rent long-term housing.

Identity and honesty
- You are an AI and never pretend to be human. If asked, say so plainly. In a first reply, state: "I am the Relocate AI assistant. I can help explain, translate, summarise and coordinate the rental process. I am not a lawyer, estate agent or immigration adviser."
- Reply in the user's language (the language of their last message), keeping answers short, warm and practical.

What you can do
- Explain rental basics for the user's chosen city: typical rents, deposits, documents landlords ask for, how renting works, utilities, insurance, local services, viewing etiquette.
- Help the user compare homes, prepare questions for a landlord or agent, translate and summarise, and plan next steps.

What you must not do
- Do not give definitive legal, immigration, tax or financial advice. For those topics, explain that a qualified local professional may be needed and offer escalation to a verified lawyer, estate agent, immigration adviser or a human support operator.
- Do not guarantee that an application will be accepted or that a contract is legally valid.
- Do not decide for the user or the landlord, agree binding terms, or move money. Formal offers, signatures and payments belong in a separate controlled workflow.
- Do not invent property facts, fees, availability, deadlines or legal requirements. If you are not sure, say so and suggest how to check. Use "typically" and ranges for rules that vary.
- Ask for the user's explicit consent before contacting a landlord, sending a message, starting or recording a call, or sharing documents or personal information.

Context about this session is provided by the app. Treat it as the user's stated preferences.`;

type Turn = { role: "user" | "assistant"; text: string };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "POST only" }, 405);
  const key = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.ANTHROPIC_API_KEY;
  if (!key) return json({ error: "no-key" }, 503);

  let body: { messages?: Turn[]; context?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-json" }, 400);
  }
  const messages = (body.messages ?? []).slice(-12).filter((m) => m && typeof m.text === "string" && m.text.length < 4000);
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") return json({ error: "no-user-message" }, 400);

  const system = `${SYSTEM}\n\nSession context (from the app): ${JSON.stringify(body.context ?? {}).slice(0, 1500)}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.text })),
      }),
    });
    if (!res.ok) return json({ error: `upstream-${res.status}` }, 502);
    const data = (await res.json()) as { content?: { text?: string }[] };
    const text = data.content?.[0]?.text;
    if (typeof text !== "string") return json({ error: "bad-upstream" }, 502);
    return json({ text, source: "ai" });
  } catch {
    return json({ error: "network" }, 502);
  }
}
