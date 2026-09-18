// Greeting and date formatting for the dashboard header.

export function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** "Sveta Danielyan" -> "SD", "Andrew" -> "AN". Always two characters so
 *  the avatar never looks lopsided. */
export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** The name on its own in a greeting - first name only reads warmer than
 *  the full legal name. */
export function firstNameOf(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}
