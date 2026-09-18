import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationCombobox from "../components/LocationCombobox";
import PropertyTypeCombobox from "../components/PropertyTypeCombobox";
import PriceRangeCombobox from "../components/PriceRangeCombobox";
import { ArrowRightIcon, PinIcon, SearchIcon } from "../components/icons";
import { priceRanges, ukCities } from "../lib/content";

// Ranges come from the dropdown as text; the search page takes numbers.
function parseRange(range: string): { min?: string; max?: string } {
  const numbers = range.replace(/[^0-9-]/g, " ").split(/\s+/).filter(Boolean);
  if (range.startsWith("Under")) return { max: numbers[0] };
  if (range.endsWith("+")) return { min: numbers[0] };
  if (numbers.length >= 2) return { min: numbers[0], max: numbers[1] };
  return {};
}

export default function Hero() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("London, Greater London");
  const [propertyType, setPropertyType] = useState("Any");
  const [priceRange, setPriceRange] = useState(priceRanges[0]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const { min, max } = parseRange(priceRange);
    const params = new URLSearchParams();
    // The combobox returns "London, Greater London"; the city alone matches.
    if (location) params.set("location", location.split(",")[0].trim());
    if (propertyType && propertyType !== "Any") params.set("type", propertyType);
    if (min) params.set("min", min);
    if (max) params.set("max", max);
    navigate(`/search?${params.toString()}`);
  }

  return (
    // Full-bleed dark hero. The nav floats on top of it now, so this starts
    // at the very top of the viewport rather than below a white bar.
    // overflow-visible so the search dropdowns can escape the section.
    <section
      id="top"
      // items-center + a top pad matching the nav's footprint centres the
      // block in the space *below the nav*, so the gap under the navbar and
      // the gap under the search bar come out even.
      className="relative z-10 flex min-h-screen items-center overflow-visible pb-12 pt-28 sm:pb-16 sm:pt-40"
    >
      <div
        className="absolute inset-0 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.png')" }}
      />
      {/* Neutral black scrim rather than a brand colour - a coloured wash
          fights the dusk tones. Lighter than it used to be: this photo is
          already dark, so the old heavy scrim was burying the sunset and
          the lit windows that make it worth using. */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 sm:gap-10 sm:px-6">
        <div className="max-w-4xl">
          {/* The hero headline is the one place the serif wordmark face is
              reused - that pairing (big serif headline, sans everywhere
              else) is what the reference is actually doing. Sizes run a step
              larger and the tracking is relaxed from -0.03em, because
              Cormorant is delicate and tight spacing strangles it. */}
          <h1 className="font-wordmark text-[3.25rem] font-semibold leading-[0.95] tracking-[-0.01em] text-white sm:text-7xl lg:text-8xl xl:text-[7rem]">
            Buy well.
            <br />
            <span className="text-brand-gold">Live better.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/70 sm:mt-8">
            The UK's first AI-powered property platform connecting investors,
            tenants, and companies, with compliance built in from day one.
          </p>

          {/* The old "live in" chip is gone - the same information reads
              better down here as the location line, the way the reference
              does it. */}
          <p className="mt-7 flex items-center gap-2 text-sm text-white/60 sm:mt-10">
            <PinIcon className="h-4 w-4 flex-shrink-0 text-brand-gold" />
            Live across the UK · London · Manchester · Edinburgh · Bristol
          </p>
        </div>

        {/* White, matching the section that follows - the bar now reads as
            the top edge of the page content rather than a separate object
            floating on the photo. */}
        <form onSubmit={search} className="w-full rounded-[28px] bg-white p-2 shadow-2xl shadow-black/40">
          <div className="flex flex-col divide-y divide-brand-ink/10 lg:flex-row lg:items-center lg:divide-x lg:divide-y-0">
            <div className="min-w-0 flex-1 rounded-[22px] px-4 py-3 text-left sm:px-6 transition-colors hover:bg-black/[0.03] focus-within:bg-black/[0.03]">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-brand-ink/50">
                Location
              </label>
              <LocationCombobox options={ukCities} value={location} onChange={setLocation} />
            </div>

            <div className="min-w-0 flex-1 rounded-[22px] px-4 py-3 text-left sm:px-6 transition-colors hover:bg-black/[0.03] focus-within:bg-black/[0.03]">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-brand-ink/50">
                Property type
              </label>
              <PropertyTypeCombobox value={propertyType as never} onChange={(v) => setPropertyType(v)} />
            </div>

            <div className="min-w-0 flex-1 rounded-[22px] px-4 py-3 text-left sm:px-6 transition-colors hover:bg-black/[0.03] focus-within:bg-black/[0.03]">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-brand-ink/50">
                Price range
              </label>
              <PriceRangeCombobox options={priceRanges} defaultValue={priceRanges[0]} onChange={setPriceRange} />
            </div>

            <div className="pt-2 lg:pl-2 lg:pt-0">
              {/* Near-black pill with the label on the left and the icon in
                  its own circle on the right. */}
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-full bg-brand-ink py-2.5 pl-6 pr-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-xl lg:w-auto"
              >
                Search Property
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-brand-ink transition-transform duration-200 group-hover:scale-105">
                  <SearchIcon className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Scroll cue, mirroring the small circular controls in the corner of
          the reference. */}
      <a
        href="#properties"
        aria-label="Scroll to properties"
        className="absolute bottom-8 right-8 hidden h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white/70 transition-colors hover:border-white hover:text-white lg:flex"
      >
        <ArrowRightIcon className="h-4 w-4 rotate-90" />
      </a>
    </section>
  );
}
