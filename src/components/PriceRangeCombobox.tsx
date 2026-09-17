import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, DollarIcon } from "./icons";
import { useDropDirection } from "./useDropDirection";

type Props = {
  options: string[];
  defaultValue?: string;
};

// Same custom-dropdown treatment as Location and Property Type, instead of
// a native <select> (which looks/behaves differently from the other two
// fields once opened).
export default function PriceRangeCombobox({ options, defaultValue }: Props) {
  const [value, setValue] = useState(defaultValue ?? options[0]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dropUp = useDropDirection(open, rootRef);

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
        <DollarIcon className="h-4 w-4 flex-shrink-0 text-brand-gold" />
        <span className="truncate">{value}</span>
        <ChevronDownIcon className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-brand-muted" />
      </button>

      {open && (
        <div className={`absolute left-1/2 z-30 ${dropUp ? "bottom-full mb-3" : "top-full mt-3"} w-64 max-w-[90vw] -translate-x-1/2 overflow-hidden rounded-2xl border border-brand-border bg-white text-left shadow-2xl lg:left-auto lg:right-0 lg:-translate-x-0`}>
          <p className="border-b border-brand-border bg-brand-surface px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-brand-muted">
            Price range
          </p>
          <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
            {options.map((option) => (
              <li key={option} role="option" aria-selected={option === value}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setValue(option);
                    setOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    option === value
                      ? "bg-brand-blue-light text-brand-blue"
                      : "text-brand-ink hover:bg-brand-surface"
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
