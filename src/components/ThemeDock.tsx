import { useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { palettes } from "../lib/palettes";
import { useTheme } from "../app/context/ThemeContext";

// The palette swatches used to live in the navbar, which made the nav look
// like a demo tool rather than a real product nav. They're a reviewer
// control, not part of the design, so they sit in their own dock in the
// corner - collapsible, out of the way of the actual page.
export default function ThemeDock() {
  const [open, setOpen] = useState(true);
  const { paletteId } = useTheme();
  const current = palettes.find((p) => p.id === paletteId) ?? palettes[0];

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden">
      {open ? (
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-brand-ink/90 py-2.5 pl-4 pr-2.5 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="leading-tight">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50">
              Preview theme
            </p>
            <p className="text-xs font-semibold text-white">{current.label}</p>
          </div>
          <ThemeSwitcher />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Hide theme preview"
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Show theme preview"
          title="Preview colour themes"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-brand-ink/90 shadow-2xl shadow-black/30 backdrop-blur-xl transition-transform hover:scale-105"
        >
          <span
            className="h-5 w-5 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${current.primary} 50%, ${current.accent} 50%)`,
            }}
          />
        </button>
      )}
    </div>
  );
}
