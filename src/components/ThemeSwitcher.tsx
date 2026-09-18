import { palettes } from "../lib/palettes";
import { useTheme } from "../app/context/ThemeContext";

type ThemeSwitcherProps = {
  className?: string;
};

// A row of clickable color swatches, one per palette explored in Figma.
// Clicking a swatch live-updates the site's CSS variables everywhere:
// meant for a stakeholder to click through and preview looks, no code
// change or rebuild needed.
export default function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const { paletteId, setPaletteId } = useTheme();

  return (
    <div className={`flex items-center gap-1.5 ${className}`} title="Preview color palettes">
      {palettes.map((palette) => {
        const isActive = palette.id === paletteId;
        return (
          <button
            key={palette.id}
            type="button"
            onClick={() => setPaletteId(palette.id)}
            aria-label={`Switch to ${palette.label} palette`}
            aria-pressed={isActive}
            title={palette.label}
            className={`relative h-6 w-6 shrink-0 rounded-full border-2 transition-transform ${
              isActive
                ? "scale-110 border-brand-ink"
                : "border-white/70 hover:scale-105 hover:border-brand-ink/40"
            }`}
            style={{
              background: `linear-gradient(135deg, ${palette.primary} 50%, ${palette.accent} 50%)`,
            }}
          />
        );
      })}
    </div>
  );
}
