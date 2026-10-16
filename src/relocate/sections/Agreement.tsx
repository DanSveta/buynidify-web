import { useState } from "react";
import { cityById, PROPERTIES } from "../data";
import { useRelocate } from "../store";
import { Btn, Card, Disclaimer, Pill, SectionTitle } from "../ui";

export default function Agreement() {
  const { interest, cityId, audit, log, go, profile } = useRelocate();
  const city = cityById(cityId);
  const matchedId = Object.keys(interest).find((id) => interest[id] === "mutual");
  const p = PROPERTIES.find((x) => x.id === matchedId);
  const [reviewed, setReviewed] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);

  if (!p) {
    return (
      <div>
        <SectionTitle title="Agreement preview" sub="A preview becomes available once a landlord confirms mutual interest in one of your shortlisted homes." />
        <Btn onClick={() => go("shortlist")}>Go to shortlist</Btn>
      </div>
    );
  }
  const cur = cityById(p.city).currency;
  const clauses = [
    ["Parties", `Tenant: ${profile.name || "[Tenant name]"}. Landlord / agent: ${p.agent}.`],
    ["Property", `${p.title}, ${p.area}, ${city.city}.`],
    ["Term and start date", `Proposed start: ${new Date(p.available).toLocaleDateString("en-GB", { dateStyle: "long" })}. Term to be agreed (placeholder).`],
    ["Rent", `${cur}${p.rent.toLocaleString()} per month, payable in advance (placeholder).`],
    ["Deposit", `Amount and holding scheme to follow local rules. ${city.rules[0]}`],
    ["Local requirements", city.rules.slice(1).join(" ")],
  ];

  return (
    <div>
      <SectionTitle title="Pre-agreement preview" sub="A draft of what the agreement will cover, with an audit trail and signature placeholders. Nothing here is binding." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Draft rental agreement</h2><Pill tone="amber">Preview only</Pill></div>
          <div className="mt-4 space-y-4">
            {clauses.map(([t, b]) => <div key={t}><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t}</p><p className="mt-1 text-sm leading-relaxed text-slate-800">{b}</p></div>)}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {["Tenant signature", "Landlord / agent signature"].map((s) => (
              <div key={s} className="rounded-xl border-2 border-dashed border-slate-300 p-4 text-center">
                <p className="text-xs text-slate-500">{s}</p><p className="mt-5 text-sm text-slate-400">Signature placeholder</p>
              </div>
            ))}
          </div>
          <label className="mt-5 flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" className="mt-1" checked={reviewed} onChange={(e) => { setReviewed(e.target.checked); if (e.target.checked) log("Tenant", "Reviewed agreement preview"); }} />
            I have reviewed this preview and understand it is not a binding contract.
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn disabled={!reviewed} onClick={() => { setPaymentStep(true); log("Tenant", "Requested move to controlled signing and payment workflow"); }}>Request signing workflow</Btn>
            <Btn variant="ghost" onClick={() => go("documents")}>Back to documents</Btn>
          </div>
          {paymentStep && (
            <div className="mt-4 rounded-xl border border-[#00529f]/30 bg-[#e8f0fa]/50 p-4 text-sm text-slate-800">
              <p className="font-semibold">Separate controlled workflow</p>
              <p className="mt-1">E-signing and deposit payment run in their own step with explicit approval, local legal checks and a licensed payment provider. In this demo, that step is a placeholder: {city.signing === "supported" ? "online signing is generally supported here." : "online signing support depends on the contract type and local law."}</p>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Audit trail</h2>
          <p className="mt-1 text-xs text-slate-500">Every contact, consent, document and approval is recorded.</p>
          <ol className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto">
            {audit.length === 0 && <li className="text-sm text-slate-500">No activity yet.</li>}
            {[...audit].reverse().map((a, i) => (
              <li key={i} className="border-l-2 border-[#00529f]/40 pl-3">
                <p className="text-sm text-slate-800">{a.action}</p><p className="text-xs text-slate-500">{a.actor} · {a.at}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <div className="mt-8"><Disclaimer /></div>
    </div>
  );
}
