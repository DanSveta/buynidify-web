// Véta reviewed the color variants explored in Figma (blue, neon blue,
// coral, purple, navy/orange, green) and decided: dark + white + gold is the
// one. The other palettes and the live ThemeSwitcher used to preview them
// are gone - this is the fixed brand palette now, not a stakeholder toggle.
//
// Components never reference a color literally. They reference a role
// (brand-blue = primary, brand-gold = accent) defined as CSS variables in
// index.css, so a future palette change still only means editing this file.

export type Palette = {
  id: string;
  label: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentDark: string;
  /** Button background/text - defaults to accent/ink when omitted. Only
   *  needed when a palette's accent is too dark to pair with dark text
   *  (see "green" below). */
  cta?: string;
  ctaDark?: string;
  ctaText?: string;
  /** Hero background-gradient color - defaults to primary. Only needed when
   *  primary is too bright/light to read well as a full-bleed wash (green). */
  hero?: string;
  /** Hero overlay treatment - "gradient" (left-to-right blend into the
   *  photo) by default, or "flat" for the original fixed dark-navy wash
   *  (#00234A/55) this section always used before the gradient existed.
   *  Neon Blue and Purple keep that original version - neither the
   *  gradient nor a plain uncovered photo looked right on them. */
  heroStyle?: "gradient" | "flat";
};

export const palettes: Palette[] = [
  {
    id: "brand",
    label: "Buynidify",
    // Deep near-black navy + white text + gold accent - the one palette
    // that's staying.
    primary: "#0f172a",
    primaryDark: "#060b14",
    primaryLight: "#e2e8f0",
    accent: "#febe10",
    accentDark: "#d99e00",
  },
];

export const defaultPaletteId = palettes[0].id;
