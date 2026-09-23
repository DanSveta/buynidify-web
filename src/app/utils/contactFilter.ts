// The Upwork/Fiverr pattern: a marketplace whose whole value is that both
// sides met and transacted through it can't let people trade contact
// details and quietly move the relationship to WhatsApp, Telegram, a phone
// call or an email thread the moment they've said hello. Once that happens
// the platform has no visibility into the rest of the deal, can't mediate
// if something goes wrong, and earns nothing from a match it made. Those
// platforms detect phone numbers, emails and other-platform handles in
// messages and block the send rather than just flagging it after the fact -
// this is the same idea, done client-side for the demo.

export type ContactCheck = {
  blocked: boolean;
  /** Human-readable reasons, one per thing detected - shown back to the
   *  sender so they know exactly what to remove, not just that something's
   *  wrong. */
  reasons: string[];
};

// Matches a run of 7+ digits, allowing the punctuation people actually type
// a phone number with (spaces, dashes, dots, parens, a leading +). Doesn't
// require a full valid UK format - property prices and bedroom counts don't
// look like this, so it's a safe, simple net.
const PHONE_RE = /(\+?\d[\d\s\-.()]{6,}\d)/;

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

// Named platforms people redirect to, plus generic "let's talk elsewhere"
// phrasing. Word-boundary matched so "wine" doesn't trip "wa" etc.
const PLATFORM_RE =
  /\b(whats ?app|telegram|instagram|insta\b|snapchat|snap\b|signal|we ?chat|viber|imessage|skype|facebook messenger|fb messenger|line app)\b/i;

const REDIRECT_PHRASE_RE =
  /\b(text me|call me|ring me|my number|reach me at|email me|off[\s-]?platform|outside (the )?(app|platform)|off the app)\b/i;

// A bare @handle (Instagram/Telegram-style) - deliberately narrow (letters,
// numbers, dots, underscores, 3+ chars) so it doesn't catch "@" used
// conversationally.
const HANDLE_RE = /(^|\s)@[a-z0-9_.]{3,}\b/i;

export function checkForOffPlatformContact(text: string): ContactCheck {
  const reasons: string[] = [];

  if (EMAIL_RE.test(text)) reasons.push("an email address");
  if (PHONE_RE.test(text)) reasons.push("a phone number");
  if (PLATFORM_RE.test(text)) reasons.push("a mention of another messaging app");
  if (HANDLE_RE.test(text)) reasons.push("a social handle");
  if (REDIRECT_PHRASE_RE.test(text)) reasons.push("a suggestion to talk outside Buynidify");

  return { blocked: reasons.length > 0, reasons };
}
