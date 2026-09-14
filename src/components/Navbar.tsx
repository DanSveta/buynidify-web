import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import ThemeSwitcher from "./ThemeSwitcher";
import { ZapIcon } from "./icons";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-white">
      <div className="flex w-full items-center justify-between px-6 py-4 lg:px-14">
        <a href="#top" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-brand-blue">
            Buynidify
          </span>
        </a>

        <div className="hidden items-center gap-5 md:flex">
          {/* Relocate is a real feature, not just another link - give it the
              same energetic treatment as the "Launch Relocate AI" button
              itself (brand-cta pill + zap icon) so it stands out from the
              plain nav. */}
          <a
            href="#relocate"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-cta px-4 py-2 text-sm font-semibold text-brand-cta-text shadow-sm shadow-brand-cta/30 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-cta-dark hover:shadow-lg"
          >
            <ZapIcon className="h-4 w-4" />
            Relocate
          </a>

          {/* Sign In + Get Started grouped together, kept plain so Relocate
              is the one thing that pops. */}
          <div className="flex items-center gap-4 border-l border-brand-border pl-5">
            <Link
              to="/login"
              className="text-[15px] font-semibold text-brand-ink transition-colors hover:text-brand-blue"
            >
              Sign In
            </Link>
            <Button as={Link} to="/login" variant="secondary" className="px-6 py-3 text-[15px]">
              Get Started
            </Button>
          </div>

          <div className="flex items-center gap-2 border-l border-brand-border pl-4">
            <ThemeSwitcher />
          </div>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-brand-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-brand-ink" />
            <span className="block h-0.5 w-5 bg-brand-ink" />
            <span className="block h-0.5 w-5 bg-brand-ink" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-brand-border bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a
              href="#relocate"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-cta px-4 py-2 text-sm font-semibold text-brand-cta-text shadow-sm shadow-brand-cta/30"
              onClick={() => setOpen(false)}
            >
              <ZapIcon className="h-4 w-4" />
              Relocate
            </a>
            <Link
              to="/login"
              className="text-sm font-semibold text-brand-ink"
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
            <Button
              as={Link}
              to="/login"
              variant="secondary"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Get Started
            </Button>
            <div className="flex items-center gap-2 border-t border-brand-border pt-4">
              <span className="text-xs font-semibold text-brand-muted">
                Preview colors:
              </span>
              <ThemeSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
