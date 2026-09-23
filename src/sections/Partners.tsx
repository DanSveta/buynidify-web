import { useState } from "react";
import { Link } from "react-router-dom";
import { partners, type Partner } from "../lib/content";

// Modelled on the agaton.ai logo wall: an even grid of logos, all desaturated
// to one visual weight, centred in generous space. No boxes, borders or
// accent lines - the calm comes from uniformity. Colour appears on hover.
function PartnerLogo({ partner }: { partner: Partner }) {
  // Until the real logo file is dropped into /public/logos, fall back to the
  // name as a wordmark rather than showing a broken image.
  const [failed, setFailed] = useState(false);
  const showImage = partner.logo && !failed;

  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-12 items-center justify-center px-2"
      title={partner.name}
    >
      {showImage ? (
        <img
          src={partner.logo}
          alt={partner.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-10 w-auto max-w-full object-contain opacity-60 grayscale transition-all duration-200 group-hover:opacity-100 group-hover:grayscale-0"
        />
      ) : (
        <span className="text-center text-lg font-semibold text-brand-muted/60 transition-colors duration-200 group-hover:text-brand-blue">
          {partner.name}
        </span>
      )}
    </a>
  );
}

export default function Partners() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="mb-14 text-center font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
        Trusted Partners
      </h2>

      {/* Column counts chosen so 18 logos always fill complete rows - 6x3 on
          wide screens, 3x6 on tablets, 2x9 on mobile. No ragged last row.
          (A 4-column step is deliberately skipped: 18 doesn't divide by 4.) */}
      <div className="grid grid-cols-2 items-center gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
        {partners.map((partner) => (
          <PartnerLogo key={partner.name} partner={partner} />
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-brand-muted">
        Run a local service business?{" "}
        <Link to="/partners" className="font-semibold text-brand-blue hover:underline">
          Become a Buynidify partner →
        </Link>
      </p>
    </section>
  );
}
