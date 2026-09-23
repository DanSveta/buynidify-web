import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { useTheme } from "../context/ThemeContext";
import { useListings } from "../context/ListingsContext";
import { usePersistedState } from "../utils/usePersistedState";
import { initialsOf } from "../utils/greeting";
import { useAuthGate } from "../context/AuthGateContext";
import { avatarFor } from "../utils/avatars";
import Avatar from "./Avatar";

// Dashboard header: quick search, light/dark switch, messages, notifications
// and the account menu. Everything in here is driven by real app state - the
// search looks through the pages and the properties actually in the account,
// and the notifications are generated from matches, interest and messages
// rather than being decorative.

const roleLabel: Record<string, string> = {
  investor: "Investor",
  tenant: "Tenant",
  corporate: "Corporate",
};

/* --- icons ---------------------------------------------------------------- */

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}

/* --- shared button shell --------------------------------------------------- */

function IconButton({
  label,
  onClick,
  badge,
  children,
}: {
  label: string;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-brand-panel text-brand-muted transition-colors hover:border-brand-blue hover:text-brand-blue"
    >
      <span className="h-[18px] w-[18px]">{children}</span>
      {!!badge && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-cta px-1 text-[10px] font-bold text-brand-cta-text">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

/* --- quick search ---------------------------------------------------------- */

type Hit = { label: string; sub: string; to: string };

function pagesFor(role: string): Hit[] {
  const common: Hit[] = [
    { label: "Overview", sub: "Page", to: "/app/overview" },
    { label: "Messages", sub: "Page", to: "/app/messages" },
    { label: "Platform listings", sub: "Page", to: "/listings" },
    { label: "Profile", sub: "Page", to: "/app/profile" },
    { label: "Relocate AI", sub: "Page", to: "/app/relocate" },
    { label: "Help & Support", sub: "Page", to: "/app/support" },
    { label: "Settings", sub: "Page", to: "/app/profile" },
  ];
  if (role === "corporate") {
    return [{ label: "Company Dashboard", sub: "Page", to: "/app/b2b" }, ...common];
  }
  return [
    { label: "My Properties", sub: "Page", to: "/app/my-properties" },
    { label: role === "investor" ? "Search Properties" : "Find a Home", sub: "Page", to: "/app/search" },
    { label: role === "investor" ? "Shortlist" : "Saved Homes", sub: "Page", to: "/app/shortlist" },
    { label: role === "investor" ? "Mutual Matches" : "Matched!", sub: "Page", to: "/app/matches" },
    ...common,
  ];
}

function QuickSearch() {
  const navigate = useNavigate();
  const { role } = useRole();
  const { investorListings, tenantDemand } = useListings();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Cmd/Ctrl+K focuses the field, the way the shortcut hint promises.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all: Hit[] = [
      ...pagesFor(role ?? "investor"),
      ...investorListings.map((l) => ({
        label: l.address,
        sub: `${l.beds}-bed ${l.type.toLowerCase()} · ${l.city}`,
        to: `/property/${l.id}?kind=listing`,
      })),
      ...tenantDemand.map((d) => ({
        label: `${d.minBeds}-bed ${d.propertyType.toLowerCase()} in ${d.city}`,
        sub: "Tenant looking",
        to: `/property/${d.id}?kind=demand`,
      })),
    ];
    return all.filter((h) => `${h.label} ${h.sub}`.toLowerCase().includes(q)).slice(0, 7);
  }, [query, role, investorListings, tenantDemand]);

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-brand-muted" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search anything..."
        className="h-10 w-full rounded-full border border-brand-border bg-brand-page pl-11 pr-4 sm:pr-16 text-sm text-brand-ink placeholder:text-brand-muted focus:border-brand-blue focus:outline-none"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-brand-border px-1.5 py-0.5 text-[10px] font-medium text-brand-muted sm:block">
        ⌘K
      </kbd>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-xl border border-brand-border bg-white shadow-lg">
          {hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-brand-muted">No matches for "{query}".</p>
          ) : (
            hits.map((h, i) => (
              <button
                key={`${h.to}-${i}`}
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  navigate(h.to);
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-brand-surface"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-brand-ink">{h.label}</span>
                  <span className="block truncate text-[11px] text-brand-muted">{h.sub}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* --- notifications --------------------------------------------------------- */

// Who a notification is about, so the bell can show a face (or a clear
// fallback mark) instead of text alone - "show the person" - and where
// clicking it should actually land, deep-linked to the specific match,
// conversation or deal rather than just the page it lives on.
type Note = {
  id: string;
  title: string;
  body: string;
  to: string;
  personName?: string;
  personInitials?: string;
  personPhotoUrl?: string;
  /** Shown instead of a person avatar when this isn't about one specific
   *  person (e.g. several tenants interested at once). */
  icon?: string;
};

/** MatchEntry ids are `match-listing-<id>` / `match-demand-<id>` - the
 *  underlying id is what Matches.tsx's rows are keyed on, so notifications
 *  have to unwrap it to deep-link to the right row. */
function connectionIdFromMatchId(matchId: string): string {
  return matchId.replace(/^match-(listing|demand)-/, "");
}

/* --- top bar --------------------------------------------------------------- */

export default function TopBar({ onMenu }: { onMenu?: () => void }) {
  const navigate = useNavigate();
  const { role, name, logout } = useRole();
  const { promptSignUp } = useAuthGate();
  const { dark, toggleDark } = useTheme();
  const { threads, matches, investorListings, tenantDemand, interestedTenantsFor, hasInvestorResponded, unreadThreadCount } =
    useListings();

  const [openPanel, setOpenPanel] = useState<"bell" | "avatar" | null>(null);
  const [readIds, setReadIds] = usePersistedState<string[]>("buynidify:read-notifications", []);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenPanel(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const notes: Note[] = useMemo(() => {
    const out: Note[] = [];

    matches.forEach((m) => {
      // Whichever side isn't "You" is the actual person this match is with -
      // a real name gets a face, the generic placeholder gets a handshake
      // mark instead of a made-up avatar.
      const counterpartLabel = m.investorLabel === "You" ? m.tenantLabel : m.investorLabel;
      const hasRealName = counterpartLabel && counterpartLabel !== "You";
      const connectionId = connectionIdFromMatchId(m.id);
      out.push({
        id: `match-${m.id}`,
        title: hasRealName ? `Mutual match with ${counterpartLabel}` : "Mutual match",
        body: `${m.propertyAddress}, ${m.city}`,
        to: `/app/matches?open=${encodeURIComponent(connectionId)}&tab=matched`,
        personName: hasRealName ? counterpartLabel : undefined,
        personInitials: hasRealName ? initialsOf(counterpartLabel) : undefined,
        personPhotoUrl: hasRealName ? avatarFor(counterpartLabel) : undefined,
        icon: hasRealName ? undefined : "🤝",
      });
    });

    if (role === "investor") {
      investorListings.forEach((l) => {
        const interested = interestedTenantsFor(l.id);
        const n = interested.length;
        if (n > 0) {
          const first = interested[0];
          out.push({
            id: `interest-${l.id}-${n}`,
            title:
              n === 1
                ? `${first.name} is interested`
                : `${first.name} and ${n - 1} other${n - 1 === 1 ? "" : "s"} interested`,
            body: l.address,
            to: `/app/matches?open=${encodeURIComponent(l.id)}&tab=incoming`,
            personName: n === 1 ? first.name : undefined,
            personInitials: n === 1 ? first.initials : undefined,
            personPhotoUrl: n === 1 ? avatarFor(first.name) : undefined,
            icon: n === 1 ? undefined : "👥",
          });
        }
      });
    }

    // The tenant-side equivalent: an investor responding to a home you
    // posted. Without this, publishing to investors had no way to tell you
    // anything happened - the investor's own "tenant interested" bell above
    // had no counterpart on this side of the platform.
    if (role === "tenant") {
      tenantDemand
        .filter((d) => d.source === "imported" && hasInvestorResponded(d.id))
        .forEach((d) => {
          out.push({
            id: `investor-interest-${d.id}`,
            title: "An investor is interested",
            body: `${d.minBeds === 0 ? "Studio" : `${d.minBeds}-bedroom`} ${d.propertyType.toLowerCase()} in ${d.city}`,
            to: `/app/matches?open=${encodeURIComponent(d.id)}&tab=incoming`,
            icon: "🏠",
          });
        });
    }

    threads.forEach((t) => {
      const last = t.messages[t.messages.length - 1];
      if (last && last.from === "them") {
        out.push({
          id: `msg-${t.counterpartyId}-${last.id}`,
          title: `New message from ${t.counterpartyName}`,
          body: last.body,
          to: `/app/messages?thread=${encodeURIComponent(t.counterpartyId)}`,
          personName: t.counterpartyName,
          personInitials: initialsOf(t.counterpartyName),
          personPhotoUrl: avatarFor(t.counterpartyName),
        });
      }
    });

    return out.slice(0, 8);
  }, [matches, threads, role, investorListings, interestedTenantsFor, tenantDemand, hasInvestorResponded]);

  const unread = notes.filter((n) => !readIds.includes(n.id));

  const initials = name ? initialsOf(name) : role === "corporate" ? "CO" : role === "tenant" ? "TN" : "IN";
  const photoUrl = name ? avatarFor(name) : undefined;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-brand-border bg-brand-panel px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-muted lg:hidden"
      >
        <MenuIcon className="h-[18px] w-[18px]" />
      </button>

      <QuickSearch />

      <div ref={wrapRef} className="relative ml-auto flex items-center gap-2">
        <span className="hidden sm:block">
        <IconButton label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleDark}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </IconButton>
        </span>

        {/* The count clears as conversations are opened, not on this click,
            so the badge always reflects what's actually still unread. */}
        {role ? (
          <>
        <IconButton
          label="Messages"
          badge={unreadThreadCount}
          onClick={() => navigate("/app/messages")}
        >
          <MailIcon />
        </IconButton>

        <IconButton
          label="Notifications"
          badge={unread.length}
          onClick={() => setOpenPanel((p) => (p === "bell" ? null : "bell"))}
        >
          <BellIcon />
        </IconButton>

        <button
          type="button"
          onClick={() => setOpenPanel((p) => (p === "avatar" ? null : "avatar"))}
          aria-label="Account"
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-blue text-xs font-bold text-white ring-2 ring-brand-panel transition-transform hover:scale-105"
        >
          {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : initials}
        </button>
          </>
        ) : (
          <button
            type="button"
            onClick={promptSignUp}
            className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Sign up
          </button>
        )}

        {openPanel === "bell" && (
          <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-brand-border bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
              <p className="text-sm font-semibold text-brand-ink">Notifications</p>
              {unread.length > 0 && (
                <button
                  type="button"
                  onClick={() => setReadIds(notes.map((n) => n.id))}
                  className="text-[11px] font-medium text-brand-blue hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            {notes.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-brand-muted">You're all caught up.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notes.map((n) => {
                  const isUnread = !readIds.includes(n.id);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        setReadIds([...readIds, n.id]);
                        setOpenPanel(null);
                        navigate(n.to);
                      }}
                      className="flex w-full items-start gap-3 border-b border-brand-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-brand-surface"
                    >
                      <span
                        className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${
                          isUnread ? "bg-brand-cta" : "bg-brand-border"
                        }`}
                      />
                      {n.personName ? (
                        <Avatar
                          name={n.personName}
                          initials={n.personInitials ?? "?"}
                          photoUrl={n.personPhotoUrl}
                          size="sm"
                        />
                      ) : (
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-surface text-base">
                          {n.icon ?? "🔔"}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-brand-ink">{n.title}</span>
                        <span className="block truncate text-xs text-brand-muted">{n.body}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {openPanel === "avatar" && (
          <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-xl border border-brand-border bg-white shadow-lg">
            <div className="border-b border-brand-border px-4 py-3">
              <p className="text-sm font-semibold text-brand-ink">{name || "Your account"}</p>
              <p className="text-xs text-brand-muted">
                Signed in as {roleLabel[role ?? "investor"].toLowerCase()}
              </p>
            </div>
            {[
              { label: "My profile", to: "/app/profile" },
              { label: "Messages", to: "/app/messages" },
              { label: "Help & Support", to: "/app/support" },
            ].map((item) => (
              <button
                key={item.to}
                type="button"
                onClick={() => {
                  setOpenPanel(null);
                  navigate(item.to);
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-brand-ink transition-colors hover:bg-brand-surface"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="block w-full border-t border-brand-border px-4 py-2.5 text-left text-sm font-medium text-brand-muted transition-colors hover:bg-brand-surface hover:text-brand-ink"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
