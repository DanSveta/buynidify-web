import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, ZapIcon } from "./icons";
import { useAuthGate } from "../app/context/AuthGateContext";

// Floating glass pill rather than a full-width bar.
//
// Over the hero it's barely tinted, so the blurred photo shows through and
// the pill picks up whatever is behind it - bright where the window is,
// dark where the room is. That only works while there's a photo back there;
// once you scroll past the hero onto the white sections, the same treatment
// would leave white text on near-white. So the tint deepens on scroll.
export default function Navbar() {
  const { promptLogin } = useAuthGate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight - 140);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 px-3 sm:top-16 sm:px-4">
      <div
        className={`pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border py-2.5 pl-5 pr-2.5 shadow-2xl sm:py-3 sm:pl-8 sm:pr-3.5 shadow-black/30 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-brand-ink/90"
            : "border-white/25 bg-black/20"
        }`}
      >
        <a href="#top" className="flex items-center gap-2">
          {/* Cormorant is a display serif - its thick/thin contrast only
              reads at size, so at nav scale it flattens out and stops
              looking like the headline. Bigger and a weight lighter brings
              the contrast back; the touch of positive tracking stops the
              thin strokes from closing up at this size. */}
          <span className="font-wordmark text-[1.7rem] font-medium leading-none tracking-[0.015em] text-white sm:text-[2.1rem]">
            Buynidify
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {/* Straight into the live marketplace - both sides of the platform
              in one place. */}
          <Link
            to="/listings"
            className="text-[15px] text-white/70 transition-colors hover:text-white"
          >
            Platform listings
          </Link>
          <a href="#how-it-works" className="text-[15px] text-white/70 transition-colors hover:text-white">
            How it works
          </a>
          {/* Relocate is a flagship feature, so it gets its own gold chip
              instead of sitting flat among the other links. */}
          <a
            href="#relocate"
            className="group inline-flex items-center gap-1.5 rounded-full border border-brand-gold/50 bg-brand-gold/15 px-4 py-1.5 text-[15px] font-semibold text-brand-gold transition-all duration-200 hover:border-brand-gold hover:bg-brand-gold/25"
          >
            <ZapIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Relocate
          </a>
          <Link
            to="/partners"
            className="text-[15px] text-white/70 transition-colors hover:text-white"
          >
            Partners
          </Link>
          <Link
            to="/about"
            className="text-[15px] text-white/70 transition-colors hover:text-white"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Sign in sits with Get started, not out with the section links -
              they're the two account actions. */}
          <button
            type="button"
            onClick={() => promptLogin()}
            className="hidden text-[15px] text-white/70 transition-colors hover:text-white sm:block"
          >
            Sign in
          </button>
          <Link
            to="/search"
            className="group hidden items-center gap-2.5 rounded-full bg-white py-2 pl-5 pr-2 text-[15px] font-semibold text-brand-ink transition-all duration-200 hover:shadow-lg sm:inline-flex"
          >
            Start searching
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-ink text-white transition-transform duration-200 group-hover:rotate-45">
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </span>
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1">
              <span className="block h-0.5 w-4 bg-white" />
              <span className="block h-0.5 w-4 bg-white" />
              <span className="block h-0.5 w-4 bg-white" />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="pointer-events-auto mx-auto mt-2 max-w-6xl rounded-3xl border border-white/15 bg-brand-ink/90 p-5 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              to="/listings"
              className="text-sm text-white/80"
              onClick={() => setOpen(false)}
            >
              Platform listings
            </Link>
            <a href="#how-it-works" className="text-sm text-white/80" onClick={() => setOpen(false)}>
              How it works
            </a>
            <a
              href="#relocate"
              className="inline-flex items-center gap-1.5 text-sm text-white/80"
              onClick={() => setOpen(false)}
            >
              <ZapIcon className="h-3.5 w-3.5 text-brand-gold" />
              Relocate
            </a>
            <Link
              to="/partners"
              className="text-sm text-white/80"
              onClick={() => setOpen(false)}
            >
              Partners
            </Link>
            <Link
              to="/about"
              className="text-sm text-white/80"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <button
              type="button"
              className="text-left text-sm text-white/80"
              onClick={() => {
                setOpen(false);
                promptLogin();
              }}
            >
              Sign in
            </button>
            <Link
              to="/search"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-white py-2 pl-5 pr-2 text-sm font-semibold text-brand-ink"
            >
              Start searching
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-ink text-white">
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
