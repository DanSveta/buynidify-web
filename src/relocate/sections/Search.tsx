import { useMemo, useState } from "react";
import { cityById } from "../data";
import { analyse, useRelocate } from "../store";
import { Btn, Card, Pill, PropertyArt, scoreTone, SectionTitle } from "../ui";

export default function Search() {
  const { properties, cityId, profile, shortlist, toggleShortlist, openAnalysis, go } = useRelocate();
  const city = cityById(cityId);
  const [maxRent, setMaxRent] = useState<number>(0);
  const [beds, setBeds] = useState<number>(0);
  const [furn, setFurn] = useState<"any" | "yes" | "no">("any");
  const [petsOnly, setPetsOnly] = useState(false);
  const [sort, setSort] = useState<"fit" | "price" | "commute">("fit");

  const rows = useMemo(() => {
    return properties
      .filter((p) => (maxRent ? p.rent <= maxRent : true))
      .filter((p) => (beds ? p.beds >= beds : true))
      .filter((p) => (furn === "any" ? true : furn === "yes" ? p.furnished : !p.furnished))
      .filter((p) => (petsOnly ? p.pets : true))
      .map((p) => ({ p, a: analyse(p, profile) }))
      .sort((x, y) => (sort === "fit" ? y.a.score - x.a.score : sort === "price" ? x.p.rent - y.p.rent : x.p.commute - y.p.commute));
  }, [properties, maxRent, beds, furn, petsOnly, sort, profile]);

  const sel = "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800";

  return (
    <div>
      <SectionTitle title={`Homes in ${city.city}`}
        sub={profile.done ? `Ranked for you, ${profile.name || "traveller"}: budget ${city.currency}${profile.budget.toLocaleString()}, ${profile.household} people, up to ${profile.maxCommute} min commute.` : "Complete the short onboarding to rank these homes for your needs."} />
      {!profile.done && <div className="mb-4"><Btn variant="soft" onClick={() => go("onboarding")}>Personalise my results</Btn></div>}

      <Card className="mb-6 flex flex-wrap items-end gap-3">
        <label className="text-xs text-slate-500">Max rent<br />
          <select className={sel} value={maxRent} onChange={(e) => setMaxRent(Number(e.target.value))}>
            <option value={0}>Any</option>
            {[1500, 2000, 2500, 3000, 4000].map((v) => <option key={v} value={v}>{city.currency}{v.toLocaleString()}</option>)}
          </select></label>
        <label className="text-xs text-slate-500">Bedrooms<br />
          <select className={sel} value={beds} onChange={(e) => setBeds(Number(e.target.value))}>
            <option value={0}>Any</option><option value={1}>1+</option><option value={2}>2+</option><option value={3}>3+</option>
          </select></label>
        <label className="text-xs text-slate-500">Furnishing<br />
          <select className={sel} value={furn} onChange={(e) => setFurn(e.target.value as typeof furn)}>
            <option value="any">Any</option><option value="yes">Furnished</option><option value="no">Unfurnished</option>
          </select></label>
        <label className="flex items-center gap-2 pb-2 text-sm text-slate-700"><input type="checkbox" checked={petsOnly} onChange={(e) => setPetsOnly(e.target.checked)} /> Pets accepted</label>
        <label className="ml-auto text-xs text-slate-500">Sort by<br />
          <select className={sel} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="fit">Best AI fit</option><option value="price">Price</option><option value="commute">Commute</option>
          </select></label>
      </Card>

      {rows.length === 0 && <Card><p className="text-sm text-slate-600">No homes match these filters. Loosen a filter to see more.</p></Card>}

      <div className="grid gap-5 sm:grid-cols-2">
        {rows.map(({ p, a }) => {
          const saved = shortlist.includes(p.id);
          return (
            <Card key={p.id} className="flex flex-col">
              <PropertyArt p={p} className="h-36" />
              <div className="mt-4 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{p.title}</h3>
                  <p className="text-sm text-slate-500">{p.beds} bed · {p.baths} bath · {p.sqm} m² · {p.furnished ? "Furnished" : "Unfurnished"}</p>
                </div>
                <Pill tone={scoreTone(a.score)}>{a.score}% fit</Pill>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-900">{city.currency}{p.rent.toLocaleString()}<span className="text-sm font-normal text-slate-500"> /month</span></p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.features.slice(0, 3).map((f) => <Pill key={f}>{f}</Pill>)}
                {a.flags.length > 0 && <Pill tone="amber">{a.flags.length} flag{a.flags.length > 1 ? "s" : ""}</Pill>}
              </div>
              <div className="mt-4 flex gap-2">
                <Btn onClick={() => openAnalysis(p.id)} className="flex-1">AI analysis</Btn>
                <Btn variant={saved ? "soft" : "ghost"} onClick={() => toggleShortlist(p.id)}>{saved ? "Shortlisted" : "Shortlist"}</Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
