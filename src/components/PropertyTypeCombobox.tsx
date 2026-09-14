import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons";
import { portalPropertyTypeOptions, type PortalPropertyType } from "../lib/propertyTypes";

type Props = {
  defaultValue?: PortalPropertyType;
};

// Same 7-type list + icons as the app's Search page, in a compact
// click-to-open dropdown that fits the hero search bar (a full icon-pill
// grid doesn't fit inline here, so this is the same data/design in a
// popover instead of a native <select>).
export default function PropertyTypeCombobox({ defaultValue = "Any" }: Props) {
  const [value, setValue] = useState<PortalPropertyType>(defaultValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = portalPropertyTypeOptions.find((o) => o.value === value) ?? portalPropertyTypeOptions[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 border-0 bg-transparent p-0 text-left text-sm font-semibold text-brand-ink outline-none"
      >
        <selected.Icon className="h-4 w-4 flex-shrink-0 text-brand-gold" />
        <span className="truncate">{selected.label}</span>
        <ChevronDownIcon className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-brand-muted" />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-30 mt-3 w-72 max-w-[90vw] -translate-x-1/2 overflow-hidden rounded-2xl border border-brand-border bg-white text-left shadow-2xl lg:left-0 lg:-translate-x-0">
          <p className="border-b border-brand-border bg-brand-surface px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-brand-muted">
            Property type
          </p>
          <ul className="grid grid-cols-2 gap-1 p-2" role="listbox">
            {portalPropertyTypeOptions.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setValue(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    option.value === value
                      ? "bg-brand-blue-light text-brand-blue"
                      : "text-brand-ink hover:bg-brand-surface"
                  }`}
                >
                  <option.Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
