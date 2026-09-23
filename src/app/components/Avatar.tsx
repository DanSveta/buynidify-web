// One small circular avatar, used everywhere a person needs a chip-sized
// picture: message lists, match cards, interested-tenant rows. Shows the
// real photo when the profile has one, the initials mark otherwise (always
// true for companies, which should look like a company, not a person) - and
// falls back to initials the moment the photo itself fails to load, rather
// than showing the browser's broken-image icon.

import { useState } from "react";

const sizes = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-[11px]",
  md: "h-11 w-11 text-xs",
  lg: "h-14 w-14 text-base",
} as const;

export default function Avatar({
  name,
  initials,
  photoUrl,
  size = "sm",
  ring,
}: {
  name?: string;
  initials: string;
  photoUrl?: string;
  size?: keyof typeof sizes;
  /** A coloured ring, for picking someone out of a pair (e.g. investor vs
   *  tenant in a deal card). */
  ring?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-blue font-bold text-white ${sizes[size]} ${ring ?? ""}`}
    >
      {photoUrl && !failed ? (
        <img
          src={photoUrl}
          alt={name ?? ""}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
