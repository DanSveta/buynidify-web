import { useState } from "react";
import type { ImportedProperty, PublishDetails } from "../context/ListingsContext";

const tenancyOptions = ["6 months", "12 months", "18 months", "24 months"];

// Who the investor will let to. Kept to the choices that actually change who
// applies, rather than a long form nobody fills in.
const tenantPreferences = [
  "Professionals",
  "Families",
  "Students",
  "Sharers",
  "Couples",
  "Pets considered",
  "Housing benefit considered",
  "Non-smokers only",
];

// Publishing a property to tenants: the rent you want, when it's free, the
// minimum term, and who you'd let to. Shared by the link importer and the
// property cards on My Properties so there is one publish flow, not two.

export default function PublishModal({
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
  const [accepts, setAccepts] = useState<string[]>(existing?.accepts ?? ["Professionals"]);
  const [touched, setTouched] = useState(false);

  function toggleAccept(option: string) {
    setAccepts((list) =>
      list.includes(option) ? list.filter((o) => o !== option) : [...list, option]
    );
  }

  const rentNumber = Number(rent);
  const rentValid = rent.trim() !== "" && Number.isFinite(rentNumber) && rentNumber > 0;

  function submit() {
    setTouched(true);
    if (!rentValid) return;
    onPublish({ rent: rentNumber, availableFrom, minTenancy, notes, accepts });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-brand-ink">Publish property</h3>
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
          <p className="mt-1 text-xs font-medium text-red-600">Enter a monthly rent first</p>
        )}

        <label className="mt-3 block text-xs font-semibold text-brand-muted">
          Available from
          <input
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
          />
        </label>

        <label className="mt-3 block text-xs font-semibold text-brand-muted">
          Minimum tenancy
          <select
            value={minTenancy}
            onChange={(e) => setMinTenancy(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-ink outline-none focus:border-brand-blue"
          >
            {tenancyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4">
          <p className="text-xs font-semibold text-brand-muted">Who would you let to?</p>
          <p className="mt-0.5 text-[11px] text-brand-muted">
            Shown on your listing so the right tenants apply. Pick any that fit.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tenantPreferences.map((option) => {
              const on = accepts.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleAccept(option)}
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

        <label className="mt-3 block text-xs font-semibold text-brand-muted">
          Notes for tenants (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Parking available, pets considered, etc."
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
