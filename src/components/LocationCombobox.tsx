import { useEffect, useRef, useState } from "react";
import { PinIcon } from "./icons";

type LocationComboboxProps = {
  options: string[];
  defaultValue?: string;
  placeholder?: string;
};

// A location field that's both typeable and choosable: type to filter the
// UK city list live, or open it and click one. Keyboard-navigable too.
export default function LocationCombobox({
  options,
  defaultValue = "",
  placeholder = "Search a UK city or region...",
}: LocationComboboxProps) {
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  // Opening the field (focus/click) should always browse the full list.
  // Filtering only kicks in once the person actually types a character -
  // otherwise the pre-filled default value ("London, Greater London") was
  // being used as the filter query on open, matching almost nothing else
  // and hiding every other city.
  const [isTyping, setIsTyping] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered =
    !isTyping || query.trim() === ""
      ? options
      : options.filter((option) =>
          option.toLowerCase().includes(query.trim().toLowerCase())
        );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectOption(option: string) {
    setQuery(option);
    setOpen(false);
    setIsTyping(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[highlighted]) selectOption(filtered[highlighted]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-1.5">
        <PinIcon className="h-4 w-4 flex-shrink-0 text-brand-gold" />
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsTyping(true);
            setHighlighted(0);
            setOpen(true);
          }}
          onFocus={(event) => {
            setOpen(true);
            event.target.select();
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          className="w-full min-w-0 border-0 bg-transparent p-0 text-sm font-semibold text-brand-ink outline-none placeholder:font-normal placeholder:text-brand-muted"
        />
      </div>

      {open && (
        <div className="absolute left-1/2 top-full z-30 mt-3 w-72 max-w-[90vw] -translate-x-1/2 overflow-hidden rounded-2xl border border-brand-border bg-white text-left shadow-2xl lg:left-0 lg:-translate-x-0">
          <p className="border-b border-brand-border bg-brand-surface px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-brand-muted">
            {filtered.length > 0 ? "Popular UK locations" : "No matches"}
          </p>
          <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
            {filtered.map((option, index) => (
              <li key={option} role="option" aria-selected={index === highlighted}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                    index === highlighted
                      ? "bg-brand-blue-light text-brand-blue"
                      : "text-brand-ink hover:bg-brand-surface"
                  }`}
                >
                  <PinIcon className="h-3.5 w-3.5 flex-shrink-0 text-brand-gold" />
                  <span className="truncate font-medium">{option}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
