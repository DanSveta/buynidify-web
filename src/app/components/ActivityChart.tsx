import { useMemo, useRef, useState } from "react";

// A real line/area trend chart, brought back after Véta said the flat
// current-total bars (see BreakdownBars in Overview.tsx) looked worse than
// the trend chart they replaced - but per her follow-up, "make it real with
// hovers and all workable" this time: every value plotted here comes from a
// real, timestamped ConnectionRecord (either a live one, or the small fixed
// seed history in seedConnections.ts), bucketed once per render from actual
// data - never a fabricated per-render random curve like the chart this
// replaced the first time round.

export type ActivitySeries = {
  id: string;
  label: string;
  color: "blue" | "gold";
  /** Cumulative count per day, oldest first. The last entry is "today" and
   *  must equal whatever stat card elsewhere on the page shows for this same
   *  metric - callers build this with bucketDailyCumulative so the two can
   *  never drift apart. */
  values: number[];
};

const COLORS: Record<ActivitySeries["color"], string> = {
  blue: "var(--color-brand-blue)",
  gold: "var(--color-brand-gold-dark)",
};

/** Turns "how many days ago this happened" for every real event into a
 *  cumulative per-day total over a fixed window ending today. Anything older
 *  than the window folds into day zero (the account already had that much
 *  history before the visible window starts), so the running total on the
 *  last day always equals daysAgoList.length exactly - the same number the
 *  stat card above the chart is already showing. */
export function bucketDailyCumulative(daysAgoList: number[], windowDays: number): number[] {
  const buckets = new Array(windowDays).fill(0) as number[];
  for (const raw of daysAgoList) {
    const d = Math.max(0, Math.floor(raw));
    const idx = windowDays - 1 - Math.min(d, windowDays - 1);
    buckets[idx] += 1;
  }
  let running = 0;
  return buckets.map((c) => (running += c));
}

function dateLabel(daysBeforeToday: number): string {
  const d = new Date(Date.now() - daysBeforeToday * 86_400_000);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const VIEW_W = 640;
const VIEW_H = 200;
const PAD_L = 6;
const PAD_R = 6;
const PAD_T = 12;
const PAD_B = 24;
const CHART_W = VIEW_W - PAD_L - PAD_R;
const CHART_H = VIEW_H - PAD_T - PAD_B;

export default function ActivityChart({
  series,
  days,
  emptyHint,
}: {
  series: ActivitySeries[];
  /** How many days the window covers - series[i].values must have this many
   *  entries. */
  days: number;
  /** Shown instead of the chart when every series is flat at zero - a real
   *  empty state, not a chart with nothing plotted on it. */
  emptyHint?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const isEmpty = series.every((s) => s.values.every((v) => v === 0));

  const xAt = (i: number) => PAD_L + (days <= 1 ? 0 : (i / (days - 1)) * CHART_W);
  const yAt = (v: number) => PAD_T + CHART_H - (v / max) * CHART_H;

  const paths = useMemo(
    () =>
      series.map((s) => {
        const line = s.values.map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(2)},${yAt(v).toFixed(2)}`).join(" ");
        const area = `${line} L${xAt(days - 1).toFixed(2)},${(PAD_T + CHART_H).toFixed(2)} L${xAt(0).toFixed(2)},${(PAD_T + CHART_H).toFixed(2)} Z`;
        return { ...s, line, area };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, max, days]
  );

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const index = Math.round(fraction * (days - 1));
    setHoverIndex(Math.min(days - 1, Math.max(0, index)));
  }

  const tickEvery = Math.max(1, Math.round((days - 1) / 4));
  const ticks = Array.from({ length: days }, (_, i) => i).filter(
    (i) => i === 0 || i === days - 1 || i % tickEvery === 0
  );

  if (isEmpty && emptyHint) {
    return (
      <div className="flex h-[160px] items-center justify-center rounded-xl border border-dashed border-brand-border bg-brand-surface text-center text-xs text-brand-muted">
        {emptyHint}
      </div>
    );
  }

  return (
    <div className="w-full">
      {series.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-4 text-xs">
          {series.map((s) => (
            <span key={s.id} className="flex items-center gap-1.5 font-semibold text-brand-ink">
              <span className="h-2 w-2 rounded-full" style={{ background: COLORS[s.color] }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <div
        ref={wrapRef}
        className="relative w-full cursor-crosshair select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className="block h-[180px] w-full">
          <defs>
            {paths.map((s) => (
              <linearGradient key={s.id} id={`activity-fill-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS[s.color]} stopOpacity="0.28" />
                <stop offset="100%" stopColor={COLORS[s.color]} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Baseline + a midline, so the curve reads against something. */}
          <line
            x1={PAD_L}
            x2={VIEW_W - PAD_R}
            y1={PAD_T + CHART_H}
            y2={PAD_T + CHART_H}
            style={{ stroke: "var(--color-brand-border)" }}
            strokeWidth="1"
          />
          <line
            x1={PAD_L}
            x2={VIEW_W - PAD_R}
            y1={PAD_T + CHART_H / 2}
            y2={PAD_T + CHART_H / 2}
            style={{ stroke: "var(--color-brand-border)" }}
            strokeWidth="1"
            strokeDasharray="3 4"
          />

          {paths.map((s) => (
            <g key={s.id}>
              <path d={s.area} fill={`url(#activity-fill-${s.id})`} stroke="none" />
              <path
                d={s.line}
                fill="none"
                style={{ stroke: COLORS[s.color] }}
                strokeWidth="2.25"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          ))}

          {hoverIndex !== null && (
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={PAD_T}
              y2={PAD_T + CHART_H}
              style={{ stroke: "var(--color-brand-muted)" }}
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          )}
          {hoverIndex !== null &&
            paths.map((s) => (
              <circle
                key={s.id}
                cx={xAt(hoverIndex)}
                cy={yAt(s.values[hoverIndex])}
                r="3.5"
                style={{ fill: COLORS[s.color] }}
                stroke="white"
                strokeWidth="1.5"
              />
            ))}

          {ticks.map((i) => (
            <text
              key={i}
              x={xAt(i)}
              y={VIEW_H - 6}
              textAnchor={i === 0 ? "start" : i === days - 1 ? "end" : "middle"}
              style={{ fontSize: 9, fill: "var(--color-brand-muted)" }}
            >
              {dateLabel(days - 1 - i)}
            </text>
          ))}
        </svg>

        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-y-full whitespace-nowrap rounded-lg border border-brand-border bg-white px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${(hoverIndex / Math.max(1, days - 1)) * 100}%`,
              transform: `translate(${hoverIndex > (days - 1) / 2 ? "-100%" : "0"}, -8px)`,
            }}
          >
            <p className="font-semibold text-brand-ink">{dateLabel(days - 1 - hoverIndex)}</p>
            {series.map((s) => (
              <p key={s.id} className="mt-0.5 flex items-center gap-1.5 text-brand-muted">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS[s.color] }} />
                {s.label}: <span className="font-semibold text-brand-ink">{s.values[hoverIndex]}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
