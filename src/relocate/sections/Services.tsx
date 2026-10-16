import { useState } from "react";
import { cityById, SERVICES } from "../data";
import { useRelocate } from "../store";
import { Btn, Card, Pill, SectionTitle } from "../ui";

export default function Services() {
  const { cityId, log } = useRelocate();
  const city = cityById(cityId);
  const [requested, setRequested] = useState<string[]>([]);

  return (
    <div>
      <SectionTitle title={`Local services in ${city.city}`} sub="Vetted providers for the practical side of moving in. Prices are illustrative." />
      <div className="grid gap-5 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <Card key={s.category}>
            <h3 className="font-semibold text-slate-900">{s.category}</h3>
            <p className="mt-1 text-sm text-slate-600">{s.blurb}</p>
            <ul className="mt-4 space-y-3">
              {s.providers.map((p) => {
                const key = `${s.category}:${p.name}`;
                const done = requested.includes(key);
                return (
                  <li key={key} className="flex items-center justify-between gap-3">
                    <div><p className="text-sm font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500"><Pill tone="amber">★ {p.rating}</Pill> <span className="ml-1">{p.from.includes("%") || p.from.includes("free") ? p.from : p.from.replace(/(\d)/, `${city.currency}$1`)}</span></p></div>
                    <Btn variant={done ? "soft" : "ghost"} disabled={done} onClick={() => { setRequested((r) => [...r, key]); log("Tenant", `Requested a quote: ${p.name} (${s.category})`); }}>{done ? "Requested" : "Request quote"}</Btn>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
