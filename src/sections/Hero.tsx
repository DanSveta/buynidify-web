import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationCombobox from "../components/LocationCombobox";
import PropertyTypeCombobox from "../components/PropertyTypeCombobox";
import { ArrowRightIcon, PinIcon, SearchIcon } from "../components/icons";
import { ukCities } from "../lib/content";
import { digitsOnly, formatThousands } from "../lib/format";

const bedroomOptions = ["Any", "1", "2", "3", "4+"];

export default function Hero() {
  const navigate = useNavigate();
  // Used to default to "London, Greater London" - reads like the search
  // only really covers London. Empty, with the same "Anywhere in the UK"
  // placeholder the /search page itself uses, matches what the site
  // actually offers (nationwide) and keeps the two search bars consistent.
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Any");
  // Was a preset dropdown (Under £200k / £200k+ / ...) - a different control
  // to the actual /search page's plain min/max fields, which was confusing
  // when the two search bars didn't match. Same min/max text inputs here now.
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [bedrooms, setBedrooms] = useState("Any");

  function search(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    // The combobox returns "London, Greater London"; the city alone matches.
    if (location) params.set("location", location.split(",")[0].trim());
    if (propertyType && propertyType !== "Any") params.set("type", propertyType);
    if (priceMin) params.set("min", priceMin);
    if (priceMax) params.set("max", priceMax);
    if (bedrooms !== "Any") params.set("beds", bedrooms);
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
              <LocationCombobox
                options={ukCities}
                value={location}
                onChange={setLocation}
                placeholder="Anywhere in the UK"
              />
            </div>

            {/* Same plain min/max text pair as the /search page - this used
                to be a preset dropdown (Under £200k / £200k+ / ...), a
                different control to what /search actually offers, which
                made the two search bars feel inconsistent. */}
            <div className="min-w-0 flex-1 rounded-[22px] px-4 py-3 text-left sm:px-6 transition-colors hover:bg-black/[0.03] focus-within:bg-black/[0.03]">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-brand-ink/50">
                Price range
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-brand-muted">£</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatThousands(priceMin)}
                  onChange={(e) => setPriceMin(digitsOnly(e.target.value))}
                  placeholder="Min"
                  className="w-full min-w-0 border-0 bg-transparent p-0 text-sm font-semibold text-brand-ink outline-none placeholder:font-normal placeholder:text-brand-muted"
                />
                <span className="flex-shrink-0 text-xs text-brand-muted">to</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatThousands(priceMax)}
                  onChange={(e) => setPriceMax(digitsOnly(e.target.value))}
                  placeholder="Max"
                  className="w-full min-w-0 border-0 bg-transparent p-0 text-sm font-semibold text-brand-ink outline-none placeholder:font-normal placeholder:text-brand-muted"
                />
              </div>
            </div>

            <div className="min-w-0 flex-1 rounded-[22px] px-4 py-3 text-left sm:px-6 transition-colors hover:bg-black/[0.03] focus-within:bg-black/[0.03]">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-brand-ink/50">
                Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent p-0 text-sm font-semibold text-brand-ink outline-none"
              >
                {bedroomOptions.map((b) => (
                  <option key={b} value={b}>
                    {b === "Any" ? "Any beds" : `${b} bed${b === "1" ? "" : "s"}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0 flex-1 rounded-[22px] px-4 py-3 text-left sm:px-6 transition-colors hover:bg-black/[0.03] focus-within:bg-black/[0.03]">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-brand-ink/50">
                Property type
              </label>
              <PropertyTypeCombobox value={propertyType as never} onChange={(v) => setPropertyType(v)} />
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
