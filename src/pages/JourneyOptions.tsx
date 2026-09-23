import ChooseYourJourney from "../sections/ChooseYourJourney";
import ChooseYourJourneyVisual from "../sections/ChooseYourJourneyVisual";
import ChooseYourJourneyShowcase from "../sections/ChooseYourJourneyShowcase";

// Internal-only comparison page - not linked from the site anywhere. Stacks
// the current "Choose Your Journey" design with two new, more visual
// directions so Véta can scroll through all three and say which one (or
// which pieces of which one) to carry into the real landing page. Nothing
// here touches the live section.
function Label({ letter, name, note }: { letter: string; name: string; note: string }) {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-14">
      <div className="flex flex-wrap items-baseline gap-3 border-b border-brand-border pb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
          {letter}
        </span>
        <h2 className="font-display text-xl font-semibold text-brand-ink">{name}</h2>
        <p className="text-sm text-brand-muted">{note}</p>
      </div>
    </div>
  );
}

export default function JourneyOptions() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">
          Internal review - not a live page
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-brand-ink">
          Choose Your Journey - three directions
        </h1>
      </div>

      <Label letter="A" name="Current" note="Kept as-is - card layout, dark on hover, minimal gold." />
      <ChooseYourJourney />

      <Label
        letter="B"
        name="Photo tri-split"
        note="Real photography, dark navy scrim, gold used once as an accent line."
      />
      <ChooseYourJourneyVisual />

      <Label
        letter="C"
        name="Photo showcase, tabs"
        note="One large photo that swaps as you hover/tap a tab - most visual, most serious."
      />
      <ChooseYourJourneyShowcase />
    </div>
  );
}
