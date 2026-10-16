import { cityById, PROPERTIES } from "../data";
import { analyse, useRelocate } from "../store";
import { Btn, Card, Pill, PropertyArt, scoreTone, SectionTitle } from "../ui";

export default function Shortlist() {
  const { shortlist, profile, toggleShortlist, interest, sendInterest, openAnalysis, go, startVoice } = useRelocate();
  const items = shortlist.map((id) => PROPERTIES.find((p) => p.id === id)).filter((p) => !!p);
  const matches = items.filter((p) => interest[p.id] === "mutual").length;

  return (
    <div>
      <SectionTitle title="Shortlist and mutual interest"
        sub="Save homes you like, then express interest. When the landlord or agent confirms theirs, it becomes a mutual match and unlocks the agreement preview." />

      {items.length === 0 && (
        <Card><p className="text-sm text-slate-600">Nothing shortlisted yet.</p><div className="mt-3"><Btn onClick={() => go("search")}>Browse homes</Btn></div></Card>
      )}

      <div className="space-y-4">
        {items.map((p) => {
          const a = analyse(p, profile);
          const cur = cityById(p.city).currency;
          const state = interest[p.id];
          const stages = [
            { label: "Shortlisted", done: true },
            { label: "Interest sent", done: !!state },
            { label: "Mutual interest", done: state === "mutual" },
          ];
          return (
            <Card key={p.id}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <PropertyArt p={p} className="h-28 sm:w-44" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div><h3 className="font-semibold text-slate-900">{p.title}</h3>
                      <p className="text-sm text-slate-500">{cur}{p.rent.toLocaleString()}/month · {p.area}</p></div>
                    <Pill tone={scoreTone(a.score)}>{a.score}% fit</Pill>
                  </div>
                  <ol className="mt-3 flex flex-wrap gap-2">
                    {stages.map((s) => <li key={s.label}><Pill tone={s.done ? "green" : "slate"}>{s.done ? "✓ " : ""}{s.label}</Pill></li>)}
                  </ol>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn variant="ghost" onClick={() => openAnalysis(p.id)}>Analysis</Btn>
                    <Btn disabled={!!state} onClick={() => sendInterest(p.id)}>{state ? (state === "mutual" ? "Matched" : "Waiting for landlord...") : "Express interest"}</Btn>
                    <Btn variant="soft" onClick={() => startVoice(p.id)}>Voice call</Btn>
                    <Btn variant="danger" onClick={() => toggleShortlist(p.id)}>Remove</Btn>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {matches > 0 && (
        <Card className="mt-6 border-emerald-200 bg-emerald-50">
          <p className="font-semibold text-emerald-900">{matches} mutual match{matches > 1 ? "es" : ""}</p>
          <p className="mt-1 text-sm text-emerald-800">Next: prepare your documents, then preview the rental agreement.</p>
          <div className="mt-3 flex gap-2"><Btn onClick={() => go("documents")}>Prepare documents</Btn><Btn variant="ghost" onClick={() => go("agreement")}>Agreement preview</Btn></div>
        </Card>
      )}
    </div>
  );
}
