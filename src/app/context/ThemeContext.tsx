import { createContext, useContext, useEffect, useState } from "react";
import { defaultPaletteId, palettes } from "../../lib/palettes";

const STORAGE_KEY = "buynidify-palette";

type ThemeContextValue = {
  paletteId: string;
  setPaletteId: (id: string) => void;
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

  useEffect(() => {
    applyPalette(paletteId);
  }, [paletteId]);

  function setPaletteId(id: string) {
    setPaletteIdState(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <ThemeContext.Provider value={{ paletteId, setPaletteId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
