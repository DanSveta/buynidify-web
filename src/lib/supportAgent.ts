// The Support chat's "agent" persona and canned reply logic. Name confirmed
// by Andrew: Emil for 24/7 support (Relocate AI's persona is Linda, in
// relocateAIEngine.ts).
export const AGENT_NAME = "Emil";
// Was just "Buynidify Support" - Andrew's own feedback was that this page
// didn't read as "our AI" at all, just a generic human support chat. This
// is the site's own "24/7 AI Support" feature, so the page now says so.
export const AGENT_ROLE = "AI Support · replies instantly, 24/7";

export type SupportCategoryId = "maintenance" | "payments" | "lease" | "moving" | "other";

const CATEGORY_REPLIES: Record<SupportCategoryId, string> = {
  maintenance:
    "Sorry to hear something needs fixing. Tell me what's going on (which appliance/room, and whether it's urgent - e.g. no heating or a leak) and I'll get it triaged. For anything urgent, I can fast-track a local repair partner today.",
  payments:
    "I can help with that. Are you looking for a receipt or statement, flagging a payment that didn't go through, or something else on the billing side? Let me know and I'll pull up the right details.",
  lease:
    "Happy to talk through your lease - renewal terms, notice periods, or an amendment. What specifically did you want to check? For anything that changes the agreement itself, I'll loop in your Buynidify coordinator to confirm it properly.",
  moving:
    "Let's sort that out. Is this about key handover, move-in access, or move-out logistics? Give me the date you're working with and I'll get it arranged.",
  other:
    "No problem, tell me what's on your mind and I'll either help directly or point you to the right person.",
};

const KEYWORD_REPLIES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["boiler", "heating", "no hot water", "radiator"],
    reply:
      "That's urgent - I've flagged it as priority. A local maintenance partner should be in touch within a few hours. In the meantime, is the property completely without heating/hot water, or is it intermittent?",
  },
  {
    keywords: ["leak", "flood", "water damage", "burst pipe"],
    reply:
      "Water issues we treat as emergencies. If it's actively leaking, shut off the stopcock if you can safely reach it, and I'm escalating this to an emergency plumber right now.",
  },
  {
    keywords: ["rent", "payment", "receipt", "statement", "invoice"],
    reply:
      "I can see your payment history from here - three months on file, all marked paid. Want me to email you a statement, or is something specific not matching what you expected?",
  },
  {
    keywords: ["notice", "move out", "moving out", "end lease", "leaving"],
    reply:
      "For giving notice, the standard requirement is written notice before your renewal date (yours is 15 March 2027) - check your lease's exact notice period, and I can confirm the process and what happens to your deposit once you're ready.",
  },
  {
    keywords: ["key", "lock", "locked out", "access"],
    reply:
      "Locked out right now, or planning ahead for a handover? If it's right now, tell me the property address and I'll get an emergency locksmith or the on-site contact to you.",
  },
  {
    keywords: ["deposit"],
    reply:
      "Your deposit is protected in a government-approved scheme for the length of your tenancy - I can send you the protection certificate if you don't have it on hand. Are you asking because you're moving out, or something else?",
  },
];

/** Deliberately simple keyword + category matching, not a real model - same
 *  "clearly a demo, swap for the real thing later" pattern as the other AI
 *  features in this app. */
export function supportReply(input: { category?: SupportCategoryId; freeText?: string }): string {
  if (input.category) return CATEGORY_REPLIES[input.category];
  const text = (input.freeText ?? "").toLowerCase();
  const match = KEYWORD_REPLIES.find((k) => k.keywords.some((kw) => text.includes(kw)));
  if (match) return match.reply;
  return "Got it, thanks for the detail. I'll pass this to the right team and you'll hear back shortly - in the meantime, is there anything else I can help clarify?";
}
