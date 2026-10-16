import { CITIES, cityById } from "../data";
import { useRelocate } from "../store";
import { Btn, Card, Disclaimer, Pill } from "../ui";

export default function Home() {
  const { cityId, setCityId, go, startVoice } = useRelocate();
  const city = cityById(cityId);
  const countries = [...new Set(CITIES.map((c) => c.country))];

  return (
    <div>
      <section className="rounded-3xl bg-gradient-to-br from-[#e8f0fa] via-white to-slate-50 px-6 py-12 sm:px-12 sm:py-16">
        <Pill tone="blue">AI rental relocation platform</Pill>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Move abroad and find a long-term home, with an AI that speaks your language.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Tell us your needs, compare homes with a transparent fit score, contact landlords through a
          translated AI-assisted call, prepare your documents and preview the whole rental process,
          all in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Btn onClick={() => go("onboarding")}>Start with your needs</Btn>
          <Btn variant="ghost" onClick={() => go("search")}>Browse homes in {city.city}</Btn>
          <Btn variant="soft" onClick={() => startVoice()}>Try the Voice AI</Btn>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900">Choose your destination</h2>
        <p className="mt-1 text-sm text-slate-600">Pick a country and city. Rules and prices below are for demo purposes.</p>
        <div className="mt-5 space-y-5">
          {countries.map((country) => (
            <div key={country}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{country}</p>
              <div className="flex flex-wrap gap-2">
                {CITIES.filter((c) => c.country === country).map((c) => (
                  <button key={c.id} onClick={() => setCityId(c.id)}
                    className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${cityId === c.id ? "border-[#00529f] bg-[#00529f] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}>
                    {c.city}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Card className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{city.city}, {city.country}</h3>
              <p className="mt-1 text-sm text-slate-600">{city.blurb}</p>
            </div>
            <Pill tone="blue">Typical 1-bed: {city.currency}{city.avg1bed.toLocaleString()}/month</Pill>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Local rental basics</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {city.rules.map((r) => <li key={r} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00529f]" />{r}</li>)}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Online agreement signing here is: <strong>{city.signing === "supported" ? "generally supported" : city.signing === "partial" ? "partly supported" : "varies by state or province"}</strong>. Always confirm locally.
          </p>
        </Card>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          ["1. Tell us your needs", "Budget, move date, household, pets, commute and visa status."],
          ["2. Compare with AI", "A fit score with red flags, affordability and next-step advice for every home."],
          ["3. Contact and prepare", "Translated calls, documents, verification and an agreement preview with an audit trail."],
        ].map(([t, d]) => (
          <Card key={t}><h3 className="font-semibold text-slate-900">{t}</h3><p className="mt-2 text-sm text-slate-600">{d}</p></Card>
        ))}
      </section>

      <div className="mt-10"><Disclaimer /></div>
    </div>
  );
}
