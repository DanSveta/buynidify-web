// Color palette options, pulled from the real color variants explored in Figma
// (the "Veta's edit landing page", "neon blue", "purple", and "green" frames).
// The ThemeSwitcher lets a stakeholder click through these live on the site.
// no code change needed to preview a different look.
//
// Every palette maps to the SAME CSS variable names (defined in index.css),
// so components never reference a color literally. They reference a role
// (brand-blue = primary, brand-gold = accent). Swapping a palette just swaps
// what those roles point to.

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
    id: "blue",
    label: "Blue & Gold",
    primary: "#00529f",
    primaryDark: "#003b73",
    primaryLight: "#e8f0fa",
    accent: "#febe10",
    accentDark: "#d99e00",
  },
  {
    id: "neon-blue",
    label: "Neon Blue",
    primary: "#0022ff",
    primaryDark: "#001aa8",
    primaryLight: "#e6e9ff",
    accent: "#febe10",
    accentDark: "#d99e00",
    heroStyle: "flat",
  },
  {
    // Coral and purple used to live in one palette together; Véta disliked
    // the pairing, so each colour now gets its own theme. Here coral is the
    // accent against a neutral charcoal, which lets it stay loud without
    // fighting a second hue.
    id: "coral-charcoal",
    label: "Coral & Charcoal",
    primary: "#343a40",
    primaryDark: "#212529",
    primaryLight: "#f1f3f5",
    accent: "#ff6b4a",
    accentDark: "#e04f2f",
    // Coral is too light to carry white text (2.6:1), so buttons pair it
    // with near-black instead.
    cta: "#ff6b4a",
    ctaDark: "#e04f2f",
    ctaText: "#1a1d20",
    heroStyle: "gradient",
  },
  {
    // Purple on its own: deep violet primary, light lavender accent for the
    // details that sit on top of it, white-on-violet buttons.
    id: "purple",
    label: "Purple & Lavender",
    primary: "#5b21b6",
    primaryDark: "#4c1d95",
    primaryLight: "#f3e8ff",
    accent: "#c4b5fd",
    accentDark: "#a78bfa",
    cta: "#7c3aed",
    ctaDark: "#6d28d9",
    ctaText: "#ffffff",
    heroStyle: "flat",
  },
  {
    id: "navy-orange",
    label: "Navy & Orange",
    // Pulled from the Figma "investor-view" (Investor Portal) frame:
    // deep navy hero background + gold/orange CTA button.
    primary: "#0f172a",
    primaryDark: "#060b14",
    primaryLight: "#e2e8f0",
    accent: "#febe10",
    accentDark: "#d99e00",
  },
  {
    id: "green",
    label: "Green & Gray",
    // The bright mint (#16c98b) used to be the primary, which broke every
    // place primary does text work: white-on-green buttons sat at 2.1:1 and
    // green-on-white headings at 2.1:1 - both unreadable. Primary is now a
    // deep emerald that carries white text (5.4:1), and the bright mint
    // moved to the CTA where it's a background, not a foreground.
    primary: "#0b7a54",
    primaryDark: "#085c3f",
    primaryLight: "#e3faf1",
    accent: "#a7f3d0",
    accentDark: "#6ee7b7",
    // Bright mint button with near-black text (7.4:1) - keeps the vivid
    // green CTA while staying readable.
    cta: "#16c98b",
    ctaDark: "#0fa574",
    ctaText: "#06281c",
    // The hero gradient needs a real, dark background - bright green washed
    // over a photo looked bad. Reuse the same dark slate as the accent.
    hero: "#0f172a",
  },
];

export const defaultPaletteId = palettes[0].id;
