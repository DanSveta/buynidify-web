import { useEffect, useState } from "react";

/**
 * Decides whether a dropdown should open downwards or upwards.
 *
 * The hero search bar sits near the bottom of the viewport, so a list that
 * always opens downwards lands off-screen and has to be scrolled to. This
 * measures the space below the trigger when the list opens and flips it
 * above instead when there isn't room - the behaviour every native select
 * already has.
 */
export function useDropDirection(
  open: boolean,
  ref: React.RefObject<HTMLElement | null>,
  estimatedHeight = 320
) {
  const [dropUp, setDropUp] = useState(false);

  useEffect(() => {
    if (!open || !ref.current) return;

    const decide = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Only flip when below is genuinely too tight AND above has more room,
      // so a short list near the bottom doesn't jump for no reason.
      setDropUp(spaceBelow < estimatedHeight && spaceAbove > spaceBelow);
    };

    decide();
    window.addEventListener("resize", decide);
    window.addEventListener("scroll", decide, { passive: true });
    return () => {
      window.removeEventListener("resize", decide);
      window.removeEventListener("scroll", decide);
    };
  }, [open, ref, estimatedHeight]);

  return dropUp;
}
