import { cityById, langLabel } from "../data";
import { analyse, useRelocate } from "../store";
import { Btn, Card, Disclaimer, Pill, Progress, PropertyArt, scoreTone, SectionTitle } from "../ui";

export default function Analysis() {
  const { activeId, properties, profile, cityId, shortlist, toggleShortlist, go, startVoice, interest, sendInterest } = useRelocate();
  const city = cityById(cityId);
  const p = properties.find((x) => x.id === activeId);

  if (!p) {
    return (
      <div><SectionTitle title="AI analysis" sub="Pick a home from search to see its analysis." />
        <Btn onClick={() => go("search")}>Browse homes</Btn></div>
    );
  }
  const a = analyse(p, profile);
  const saved = shortlist.includes(p.id);
  const state = interest[p.id];

  return (
    <div>
      <button onClick={() => go("search")} className="mb-4 cursor-pointer text-sm text-[#00529f] hover:underline">← Back to results</button>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PropertyArt p={p} className="h-56" />
          <h1 className="mt-5 text-2xl font-semibold text-slate-900">{p.title}</h1>
          <p className="text-slate-500">{p.area}, {city.city} · {city.currency}{p.rent.toLocaleString()}/month · {p.beds} bed · {p.sqm} m²</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{p.features.map((f) => <Pill key={f}>{f}</Pill>)}</div>
          <p className="mt-4 text-sm text-slate-600">Listed by <strong>{p.agent}</strong>. The landlord or agent speaks <strong>{langLabel(p.landlordLang)}</strong>. Available from {new Date(p.available).toLocaleDateString("en-GB", { dateStyle: "long" })}.</p>

          <Card className="mt-6">
            <h2 className="font-semibold text-slate-900">Red flags</h2>
            {a.flags.length === 0 ? <p className="mt-2 text-sm text-emerald-700">No red flags found against your criteria.</p> : (
              <ul className="mt-2 space-y-2">{a.flags.map((f) => <li key={f} className="flex gap-2 text-sm text-slate-700"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />{f}</li>)}</ul>
            )}
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Fit score</h2><Pill tone={scoreTone(a.score)}>{a.score} / 100</Pill></div>
            <div className="mt-3"><Progress value={a.score} /></div>
            <ul className="mt-4 space-y-1.5 text-sm">
              {a.breakdown.length === 0 && <li className="text-slate-600">Matches everything you asked for.</li>}
              {a.breakdown.map((b) => <li key={b.label} className="flex justify-between text-slate-700"><span>{b.label}</span><span className="font-medium text-rose-600">{b.delta}</span></li>)}
            </ul>
            <p className="mt-3 text-xs text-slate-500">The score starts at 100 and loses points for each mismatch, so you can see exactly why.</p>
          </Card>
          <Card>
            <h2 className="font-semibold text-slate-900">Affordability</h2>
            <p className="mt-1 text-sm text-slate-700">{a.affordability.label}: rent is {Math.round(a.affordability.ratio * 100)}% of your {city.currency}{profile.budget.toLocaleString()} budget.</p>
            <h2 className="mt-4 font-semibold text-slate-900">Commute and area</h2>
            <p className="mt-1 text-sm text-slate-700">{a.commute}. {a.area}</p>
          </Card>
          <Card className="border-[#00529f]/30 bg-[#e8f0fa]/40">
            <h2 className="font-semibold text-slate-900">Recommended next step</h2>
            <p className="mt-1 text-sm text-slate-700">{a.next}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn variant={saved ? "soft" : "primary"} onClick={() => toggleShortlist(p.id)}>{saved ? "Shortlisted" : "Add to shortlist"}</Btn>
              <Btn variant="ghost" disabled={!saved || !!state} onClick={() => sendInterest(p.id)}>
                {state === "mutual" ? "Mutual interest" : state === "sent" ? "Interest sent..." : "Express interest"}
              </Btn>
              <Btn variant="soft" onClick={() => startVoice(p.id)}>Talk to the landlord</Btn>
            </div>
            {!saved && <p className="mt-2 text-xs text-slate-500">Shortlist the home first, then express interest.</p>}
          </Card>
        </div>
      </div>
      <div className="mt-8"><Disclaimer text="Scores are guidance based on the information you gave us, not a guarantee that an application will be accepted." /></div>
    </div>
  );
}
