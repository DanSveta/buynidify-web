import type { Property } from "../data/mockData";
import { tenantDemand } from "../data/mockData";

// Rough % position on a UK outline, just enough for a believable demo pin map.
// Real map tiles (Mapbox/Google Maps) would replace this once wired to a key.
const cityPositions: Record<string, { top: string; left: string }> = {
  London: { top: "78%", left: "58%" },
  Manchester: { top: "48%", left: "44%" },
  Bristol: { top: "68%", left: "28%" },
  Leeds: { top: "42%", left: "52%" },
  Birmingham: { top: "58%", left: "42%" },
  Edinburgh: { top: "16%", left: "42%" },
  Bath: { top: "70%", left: "32%" },
};

type Props = {
  properties: Property[];
};

export default function MapPlaceholder({ properties }: Props) {
  const demandByCity = tenantDemand.reduce<Record<string, number>>((acc, d) => {
    acc[d.city] = (acc[d.city] ?? 0) + d.interestedTenants;
    return acc;
  }, {});

  const listedByCity = properties.reduce<Record<string, number>>((acc, p) => {
    acc[p.city] = (acc[p.city] ?? 0) + 1;
    return acc;
  }, {});

  const cities = Array.from(
    new Set([...Object.keys(listedByCity), ...Object.keys(demandByCity)])
  );

  return (
    <div>
      <div className="relative h-96 w-full overflow-hidden rounded-2xl border border-brand-border bg-brand-blue-light">
        {cities.map((city) => {
          const pos = cityPositions[city];
          if (!pos) return null;
          const listed = listedByCity[city] ?? 0;
          const demand = demandByCity[city] ?? 0;
          return (
            <div
              key={city}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: pos.top, left: pos.left }}
            >
              <div className="flex items-center gap-1">
                {listed > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-blue px-1.5 text-[11px] font-bold text-white shadow">
                    {listed}
                  </span>
                )}
                {demand > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-gold px-1.5 text-[11px] font-bold text-brand-ink shadow">
                    {demand}
                  </span>
                )}
              </div>
              <p className="mt-1 whitespace-nowrap text-center text-[11px] font-medium text-brand-blue-dark">
                {city}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-5 text-xs text-brand-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-brand-blue" /> Listed
          properties
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-brand-gold" /> Tenant
          demand
        </span>
        <span className="text-brand-muted/70">
          Illustrative placeholder — wire up to a real map provider later.
        </span>
      </div>
    </div>
  );
}
