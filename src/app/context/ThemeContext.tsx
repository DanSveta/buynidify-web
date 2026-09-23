import { createContext, useContext, useEffect, useState } from "react";
import { defaultPaletteId, palettes } from "../../lib/palettes";

const STORAGE_KEY = "buynidify-palette";
const DARK_KEY = "buynidify-dark";

type ThemeContextValue = {
  paletteId: string;
  setPaletteId: (id: string) => void;
  /** Dark mode is independent of the palette - any of the six palettes can
   *  run light or dark, so this is a boolean rather than a seventh palette. */
  dark: boolean;
  toggleDark: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyPalette(id: string) {
  const palette = palettes.find((p) => p.id === id) ?? palettes[0];
  const root = document.documentElement.style;
  root.setProperty("--color-brand-blue", palette.primary);
  root.setProperty("--color-brand-blue-dark", palette.primaryDark);
  root.setProperty("--color-brand-blue-light", palette.primaryLight);
  root.setProperty("--color-brand-gold", palette.accent);
  root.setProperty("--color-brand-gold-dark", palette.accentDark);
  root.setProperty("--color-brand-cta", palette.cta ?? palette.accent);
  root.setProperty("--color-brand-cta-dark", palette.ctaDark ?? palette.accentDark);
  root.setProperty("--color-brand-cta-text", palette.ctaText ?? "#111827");
  root.setProperty("--color-brand-hero", palette.hero ?? palette.primary);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [paletteId, setPaletteIdState] = useState<string>(() => {
    if (typeof window === "undefined") return defaultPaletteId;
    return window.localStorage.getItem(STORAGE_KEY) || defaultPaletteId;
  });

  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    // Dark is the product's real look now, not an opt-in preview - default
    // on unless someone has explicitly switched it off before.
    const stored = window.localStorage.getItem(DARK_KEY);
    return stored === null ? true : stored === "1";
  });

  useEffect(() => {
    applyPalette(paletteId);
  }, [paletteId]);

  function setPaletteId(id: string) {
    setPaletteIdState(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }

  function toggleDark() {
    setDark((d) => {
      window.localStorage.setItem(DARK_KEY, d ? "0" : "1");
      return !d;
    });
  }

  return (
    <ThemeContext.Provider value={{ paletteId, setPaletteId, dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
