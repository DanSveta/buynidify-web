import { InstagramIcon, LinkedInIcon, TwitterIcon } from "./icons";
import { footerColumns } from "../lib/content";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-20">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            {/* Same wordmark treatment as the header everywhere else on the
                site (Navbar + PublicShell): text + a single gold dot, no
                separate logo block - the footer previously had an empty
                navy square standing in for a logo that doesn't exist. */}
            <div className="flex items-center gap-2 font-wordmark text-[1.8rem] font-medium leading-none tracking-[0.015em] text-brand-blue">
              Buynidify
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            </div>
            <p className="mt-3 max-w-xs text-sm text-brand-muted">
              Transforming real estate investment &amp; long-term rentals
              through automated technology and absolute platform safety.
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-blue">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-brand-muted transition-colors hover:text-brand-blue"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-blue">
              Contact Us
            </p>
            <div className="mt-4 space-y-2 text-sm text-brand-muted">
              <p>support@buynidify.com</p>
              <p>+44 20 7946 0958</p>
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-brand-blue transition-colors hover:border-brand-blue"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-brand-blue transition-colors hover:border-brand-blue"
                aria-label="Twitter"
              >
                <TwitterIcon />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-brand-blue transition-colors hover:border-brand-blue"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-brand-border pt-8 text-xs text-brand-muted sm:flex-row">
          <p>
            © 2026 Buynidify Ltd. All financial yields are historical
            estimates. Read all prospectus documents.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-blue">
              Terms of Use
            </a>
            <a href="#" className="hover:text-brand-blue">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
