import { partners } from "../lib/content";

// Every partner uses the same treatment (no one-off purple) and links out
// to the real site. The accent underneath is a short, thin line rather
// than a full-width border - just a little mark under the middle of the
// name, not a heavy underline.
export default function Partners() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex flex-col items-center text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
          Trusted Partners
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Trusted Partners
        </h2>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-10">
        {partners.map((partner) => (
          <a
            key={partner.name}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1.5 text-lg font-extrabold text-brand-ink transition-colors duration-200 hover:text-brand-blue"
          >
            {partner.name}
            <span className="h-[2px] w-5 rounded-full bg-brand-blue/70 transition-all duration-200 group-hover:w-9 group-hover:bg-brand-blue" />
          </a>
        ))}
      </div>
    </section>
  );
}
