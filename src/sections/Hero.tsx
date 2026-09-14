import Button from "../components/Button";
import LocationCombobox from "../components/LocationCombobox";
import PropertyTypeCombobox from "../components/PropertyTypeCombobox";
import PriceRangeCombobox from "../components/PriceRangeCombobox";
import { SearchIcon } from "../components/icons";
import { priceRanges, ukCities } from "../lib/content";
import { palettes } from "../lib/palettes";
import { useTheme } from "../app/context/ThemeContext";

export default function Hero() {
  const { paletteId } = useTheme();
  const palette = palettes.find((p) => p.id === paletteId) ?? palettes[0];
  const heroStyle = palette.heroStyle ?? "gradient";

  return (
    // z-10 (not just relative) so this section - and the search dropdowns
    // inside it - paints above the section below instead of being covered
    // by it. overflow-hidden removed: it was clipping the location dropdown
    // whenever the open list was taller than the hero image, hiding most of
    // it ("under the picture").
    // min-h fills the viewport below the sticky navbar (~73px tall) so the
    // hero is a proper "full page" - the next section only comes into view
    // once you actually scroll, instead of already peeking at the bottom.
    <section
      id="top"
      className="relative z-10 flex min-h-[calc(100vh-73px)] items-center overflow-visible"
    >
      <div
        className="absolute inset-0 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=60')",
        }}
      />
      {/* Solid color on the left, fading smoothly into the photo on the
          right - not a hard split (that's what Andrew's HERO-OPTION-B got
          wrong), a gradual blend so the picture reads clearly past ~2/3 of
          the width. Uses brand-hero (usually = primary, but overridden to a
          dark color for the green palette, whose bright-green primary
          looked bad washed over a photo) rather than brand-blue directly.
          Neon Blue and Purple keep the exact original fixed-navy wash this
          section always had, before the gradient existed. */}
      {heroStyle === "gradient" ? (
        <div className="absolute inset-0 bg-gradient-to-r from-brand-hero from-5% via-brand-hero/70 via-40% to-transparent to-85%" />
      ) : (
        <div className="absolute inset-0 bg-[#00234A]/55" />
      )}

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-6 py-16 text-center">
        <span className="inline-flex items-center gap-2.5 rounded-2xl border border-brand-gold bg-[#00234A]/55 px-6 py-[18px] text-sm font-semibold text-white">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          Live in the UK: London &middot; Manchester &middot; Edinburgh &middot; Bristol
        </span>

        <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.15] tracking-tight text-white drop-shadow-lg sm:text-6xl">
          Find Your Next Investment
          <br />
          or Dream Rental
        </h1>

        <p className="max-w-2xl text-base text-white/90 drop-shadow sm:text-lg">
          The UK's first AI-powered property platform connecting investors,
          tenants, and companies, with compliance built in from day one.
        </p>

        {/* Airbnb/Booking-style search pill: one continuous rounded bar on
            desktop, divided into segments by hairlines, with a compact
            circular search button at the end. Stacks into a simple card
            on mobile. No new colors introduced - same brand-blue button
            the original design used. */}
        <form className="mt-4 w-full max-w-4xl rounded-[28px] bg-white p-2 shadow-2xl shadow-black/25 lg:rounded-full lg:p-2">
          {/* Row layout only kicks in at lg (1024px) - below that, three
              fields plus a select's native content width don't reliably
              shrink to fit, which was overflowing the bar and getting
              clipped by the section's overflow-hidden on anything narrower
              than a full desktop window. Stacked full-width fields avoid
              that entirely. */}
          <div className="flex flex-col divide-y divide-brand-border lg:flex-row lg:items-center lg:divide-x lg:divide-y-0">
            <div className="min-w-0 flex-1 rounded-full px-6 py-2.5 text-left transition-colors hover:bg-brand-surface focus-within:bg-brand-surface">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-brand-blue">
                Location
              </label>
              <LocationCombobox options={ukCities} defaultValue="London, Greater London" />
            </div>

            <div className="min-w-0 flex-1 rounded-full px-6 py-2.5 text-left transition-colors hover:bg-brand-surface focus-within:bg-brand-surface">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-brand-blue">
                Property Type
              </label>
              <PropertyTypeCombobox />
            </div>

            <div className="min-w-0 flex-1 rounded-full px-6 py-2.5 text-left transition-colors hover:bg-brand-surface focus-within:bg-brand-surface">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-brand-blue">
                Price Range
              </label>
              <PriceRangeCombobox options={priceRanges} defaultValue={priceRanges[0]} />
            </div>

            <div className="pt-2 lg:pt-0 lg:pl-1">
              <Button
                type="submit"
                variant="secondary"
                className="flex w-full items-center justify-center gap-2 !rounded-full px-8 py-3.5 lg:h-14"
              >
                <SearchIcon className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                Search
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
