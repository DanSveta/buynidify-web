import type { ReactNode } from "react";
import { LEGAL_DISCLAIMER, type Property } from "./data";

const ACCENT = "#00529f";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>{children}</div>;
}

export function Btn({
  children, onClick, variant = "primary", disabled, type = "button", className = "",
}: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "soft" | "danger";
  disabled?: boolean; type?: "button" | "submit"; className?: string;
}) {
  const styles = {
    primary: "bg-[#00529f] text-white hover:bg-[#003b73]",
    ghost: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    soft: "bg-[#e8f0fa] text-[#00529f] hover:bg-[#d6e5f6]",
    danger: "border border-rose-300 text-rose-700 hover:bg-rose-50",
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function Pill({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "blue" | "green" | "amber" | "rose" }) {
  const t = {
    slate: "bg-slate-100 text-slate-700", blue: "bg-[#e8f0fa] text-[#00529f]",
    green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", rose: "bg-rose-50 text-rose-700",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${t}`}>{children}</span>;
}

export function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {sub && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{sub}</p>}
    </div>
  );
}

export function Disclaimer({ text = LEGAL_DISCLAIMER }: { text?: string }) {
  return <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">{text}</p>;
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label && <div className="mb-1 flex justify-between text-xs text-slate-500"><span>{label}</span><span>{Math.round(value)}%</span></div>}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, value)}%`, background: ACCENT }} />
      </div>
    </div>
  );
}

// A calm generated "photo": soft gradient seeded from the property id so each
// card looks different without needing real images.
export function PropertyArt({ p, className = "" }: { p: Property; className?: string }) {
  let h = 0;
  for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${h} 35% 88%), hsl(${(h + 40) % 360} 40% 78%))` }}>
      <svg viewBox="0 0 120 80" className="absolute inset-0 h-full w-full opacity-60" preserveAspectRatio="xMidYMax slice">
        <rect x="14" y="30" width="30" height="50" fill="rgba(255,255,255,.55)" />
        <rect x="48" y="14" width="28" height="66" fill="rgba(255,255,255,.7)" />
        <rect x="80" y="38" width="26" height="42" fill="rgba(255,255,255,.5)" />
      </svg>
      <span className="absolute bottom-2 left-3 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-slate-700">{p.area}</span>
    </div>
  );
}

export function scoreTone(score: number): "green" | "amber" | "rose" {
  return score >= 80 ? "green" : score >= 60 ? "amber" : "rose";
}
