import { useState } from "react";
import type { ImportedProperty, PublishDetails } from "../context/ListingsContext";

const stayOptions = ["6 months", "12 months", "18 months", "24 months"];

// Who's moving in - the tenant's equivalent of an investor's "who would you
// let to". A single-select, since it's describing one household, not a list
// of options an investor is choosing between.
const householdOptions = [
  "Single professional",
  "Couple",
  "Family with children",
  "Sharers",
  "Students",
];

// Publishing a home search to investors: the rent you can pay, when you want
// to move, how long you're looking to stay, and who's moving in. Mirrors
// PublishModal's investor flow field-for-field, reframed from the tenant's
// point of view.

export default function PublishDemandModal({
  property,
  defaultRent,
  existing,
  onCancel,
  onPublish,
}: {
  property: ImportedProperty;
  defaultRent: number;
  existing: PublishDetails | null;
  onCancel: () => void;
  onPublish: (details: PublishDetails) => void;
}) {
  const [rent, setRent] = useState(String(existing?.rent ?? defaultRent));
  const [availableFrom, setAvailableFrom] = useState(existing?.availableFrom ?? "");
  const [minTenancy, setMinTenancy] = useState(existing?.minTenancy ?? "12 months");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [householdType, setHouseholdType] = useState(
    existing?.householdType ?? "Single professional"
  );
  const [occupants, setOccupants] = useState(String(existing?.occupants ?? 1));
  const [pets, setPets] = useState(existing?.pets ?? false);
  const [smoker, setSmoker] = useState(existing?.smoker ?? false);
  const [touched, setTouched] = useState(false);

  const rentNumber = Number(rent);
  const rentValid = rent.trim() !== "" && Number.isFinite(rentNumber) && rentNumber > 0;
  const occupantsNumber = Math.max(1, Number(occupants) || 1);

  function submit() {
    setTouched(true);
    if (!rentValid) return;
    onPublish({
      rent: rentNumber,
      availableFrom,
      minTenancy,
      notes,
      accepts: [],
      householdType,
      occupants: occupantsNumber,
      pets,
      smoker,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-brand-ink">Publish to investors</h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-brand-muted hover:text-brand-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-brand-surface p-3">
          <p className="text-sm font-semibold text-brand-ink">{property.title}</p>
          <p className="text-xs text-brand-muted">{property.location}</p>
        </div>

        <label className="mt-4 block text-xs font-semibold text-brand-muted">
          Target monthly rent (£)
          <input
            type="text"
            inputMode="numeric"
            value={rent}
            onChange={(e) => setRent(e.target.value.replace(/[^\d]/g, ""))}
            className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
          />
        </label>
        {touched && !rentValid && (
          <p className="mt-1 text-xs font-medium text-red-600">Enter a target rent first</p>
        )}

        <label className="mt-3 block text-xs font-semibold text-brand-muted">
          When do you want to move in?
          <input
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
          />
        </label>

        <label className="mt-3 block text-xs font-semibold text-brand-muted">
          How long do you want to stay?
          <select
            value={minTenancy}
            onChange={(e) => setMinTenancy(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
          >
            {stayOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4">
          <p className="text-xs font-semibold text-brand-muted">Tell investors about your household</p>
          <p className="mt-0.5 text-[11px] text-brand-muted">
            Shown on your listing so the right investors reach out.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {householdOptions.map((option) => {
              const on = householdType === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setHouseholdType(option)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    on
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-brand-border bg-white text-brand-muted hover:border-brand-blue hover:text-brand-blue"
                  }`}
                >
                  {on ? "✓ " : ""}
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <label className="block text-xs font-semibold text-brand-muted">
            People moving in
            <input
              type="text"
              inputMode="numeric"
              value={occupants}
              onChange={(e) => setOccupants(e.target.value.replace(/[^\d]/g, ""))}
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
            />
          </label>
          <div>
            <p className="text-xs font-semibold text-brand-muted">Pets</p>
            <div className="mt-1 flex overflow-hidden rounded-lg border border-brand-border">
              {(["No", "Yes"] as const).map((label) => {
                const on = pets === (label === "Yes");
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPets(label === "Yes")}
                    aria-pressed={on}
                    className={`flex-1 px-2 py-2 text-xs font-semibold transition-colors ${
                      on ? "bg-brand-blue text-white" : "bg-white text-brand-muted hover:text-brand-ink"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-muted">Smoker</p>
            <div className="mt-1 flex overflow-hidden rounded-lg border border-brand-border">
              {(["No", "Yes"] as const).map((label) => {
                const on = smoker === (label === "Yes");
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSmoker(label === "Yes")}
                    aria-pressed={on}
                    className={`flex-1 px-2 py-2 text-xs font-semibold transition-colors ${
                      on ? "bg-brand-blue text-white" : "bg-white text-brand-muted hover:text-brand-ink"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <label className="mt-3 block text-xs font-semibold text-brand-muted">
          Notes for investors (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Quiet, tidy, great references available, etc."
            className="mt-1 w-full resize-none rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
          />
        </label>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-brand-border px-4 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex-1 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
