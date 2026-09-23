import type { JourneyCard } from "./content";

// Shared photo picks for the "Choose Your Journey" options that use real
// photography (C2, C3) - one place to swap a picture instead of editing
// each section separately. Tenant and Corporate reverted to the original
// pair (cozy interior, office team) - the moving-boxes/meeting-table swap
// didn't land. Investor stays the apartment block, which did.
export const journeyImages: Record<JourneyCard["icon"], string> = {
  investor: "photo-1560518883-ce09059eeffa",
  tenant: "photo-1493809842364-78817add7ffb",
  corporate: "photo-1522071820081-009f0129c71c",
};

// Guaranteed-good fallbacks (already live elsewhere in the app, so these
// are known to resolve) in case a newly-picked photo ID above ever 404s.
const fallback: Record<JourneyCard["icon"], string> = {
  investor: "photo-1568605114967-8130f3a36994",
  tenant: "photo-1600585154340-be6161a56a0c",
  corporate: "photo-1484154218962-a197022b5858",
};

export function journeyImageUrl(icon: JourneyCard["icon"], width = 700): string {
  return `https://images.unsplash.com/${journeyImages[icon]}?auto=format&fit=crop&w=${width}&q=70`;
}

// Swaps the <img> to the vetted fallback if the picked photo fails to load,
// so a bad ID never shows as a broken-image icon on the live section.
export function onJourneyImageError(icon: JourneyCard["icon"], width = 700) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `https://images.unsplash.com/${fallback[icon]}?auto=format&fit=crop&w=${width}&q=70`;
  };
}
