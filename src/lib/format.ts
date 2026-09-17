// Number formatting shared by the search inputs.
//
// Price fields keep raw digits in state ("200000") because that's what the
// filters and the portal deep-link URLs need - the separators are display
// only, added on the way out and stripped on the way back in.

/** "200000" -> "200,000". Blank stays blank. */
export function formatThousands(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-GB");
}

/** "200,000" -> "200000", so state and URLs never see a separator. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}
