import { useState } from "react";
import { CITIES, cityById, LANGUAGES } from "../data";
import { useRelocate, type Profile } from "../store";
import { Btn, Card, Pill, Progress, SectionTitle } from "../ui";

const CRITERIA = ["Near public transport", "Quiet area", "Near schools", "Good for remote work", "Gym or pool", "Outdoor space", "Lift / step-free"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}
const input = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#00529f]";

export default function Onboarding() {
  const { profile, setProfile, cityId, setCityId, go, log } = useRelocate();
  const city = cityById(cityId);
  const [step, setStep] = useState(0);
  const steps = ["Destination", "Budget & timing", "Household", "Preferences", "Status & language"];

  function finish() {
    setProfile({ done: true });
    log("Tenant", "Completed AI onboarding");
    go("search");
  }
  const toggleCriterion = (c: string) =>
    setProfile({ criteria: profile.criteria.includes(c) ? profile.criteria.filter((x) => x !== c) : [...profile.criteria, c] });

  return (
    <div className="mx-auto max-w-2xl">
      <SectionTitle title="Tell us what you need" sub="A few quick questions so the AI can rank homes for you. You can change any answer later." />
      <Progress value={((step + 1) / steps.length) * 100} label={`Step ${step + 1} of ${steps.length}: ${steps[step]}`} />

      <Card className="mt-5 space-y-5">
        {step === 0 && (
          <>
            <Field label="Your name"><input className={input} value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} placeholder="e.g. Alex" /></Field>
            <Field label="Where are you moving to?">
              <select className={input} value={cityId} onChange={(e) => setCityId(e.target.value as typeof cityId)}>
                {CITIES.map((c) => <option key={c.id} value={c.id}>{c.city}, {c.country}</option>)}
              </select>
            </Field>
          </>
        )}
        {step === 1 && (
          <>
            <Field label={`Maximum monthly rent (${city.currency})`}>
              <input type="number" className={input} value={profile.budget} min={0} step={50} onChange={(e) => setProfile({ budget: Number(e.target.value) })} />
              <p className="mt-1 text-xs text-slate-500">Typical 1-bed in {city.city}: {city.currency}{city.avg1bed.toLocaleString()}</p>
            </Field>
            <Field label="Target move date"><input type="date" className={input} value={profile.moveDate} onChange={(e) => setProfile({ moveDate: e.target.value })} /></Field>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Household size">
              <input type="number" className={input} min={1} max={8} value={profile.household} onChange={(e) => setProfile({ household: Math.max(1, Number(e.target.value)) })} />
            </Field>
            <Field label="Pets">
              <div className="flex gap-2">
                {[false, true].map((v) => (
                  <button key={String(v)} onClick={() => setProfile({ pets: v })} className={`cursor-pointer rounded-xl border px-4 py-2 text-sm ${profile.pets === v ? "border-[#00529f] bg-[#e8f0fa] text-[#00529f]" : "border-slate-300 text-slate-700"}`}>
                    {v ? "I have pets" : "No pets"}
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}
        {step === 3 && (
          <>
            <Field label="Furnished or unfurnished?">
              <select className={input} value={profile.furnished} onChange={(e) => setProfile({ furnished: e.target.value as Profile["furnished"] })}>
                <option value="any">No preference</option><option value="furnished">Furnished</option><option value="unfurnished">Unfurnished</option>
              </select>
            </Field>
            <Field label={`Maximum commute: ${profile.maxCommute} min`}>
              <input type="range" min={5} max={60} step={5} className="w-full" value={profile.maxCommute} onChange={(e) => setProfile({ maxCommute: Number(e.target.value) })} />
            </Field>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Other housing criteria</span>
              <div className="flex flex-wrap gap-2">
                {CRITERIA.map((c) => (
                  <button key={c} onClick={() => toggleCriterion(c)} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs ${profile.criteria.includes(c) ? "border-[#00529f] bg-[#e8f0fa] text-[#00529f]" : "border-slate-300 text-slate-700"}`}>{c}</button>
                ))}
              </div>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <Field label="Visa / immigration status">
              <select className={input} value={profile.visa} onChange={(e) => setProfile({ visa: e.target.value as Profile["visa"] })}>
                <option value="citizen">Citizen / settled</option><option value="has">I have a visa or permit</option>
                <option value="applying">I am applying</option><option value="none">Not sure yet</option>
              </select>
            </Field>
            <Field label="Preferred language for the AI and calls">
              <select className={input} value={profile.language} onChange={(e) => setProfile({ language: e.target.value })}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </Field>
            <Pill tone="amber">The AI gives general orientation only, not immigration advice.</Pill>
          </>
        )}
      </Card>

      <div className="mt-5 flex justify-between">
        <Btn variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Btn>
        {step < steps.length - 1 ? <Btn onClick={() => setStep(step + 1)}>Continue</Btn> : <Btn onClick={finish}>Find my homes</Btn>}
      </div>
    </div>
  );
}
