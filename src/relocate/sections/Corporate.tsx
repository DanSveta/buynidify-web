import { useState } from "react";
import { CITIES, cityById, type CityId } from "../data";
import { useRelocate } from "../store";
import { Btn, Card, Pill, SectionTitle } from "../ui";

type Employee = { id: number; name: string; email: string; status: "invited" | "active" };
type Req = { id: number; employee: string; city: CityId; budget: number; stage: "searching" | "matched" | "needs-approval" | "approved" | "rejected" };

const input = "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#00529f]";

export default function Corporate() {
  const { log } = useRelocate();
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: "Maya Patel", email: "maya.patel@northwind.example", status: "active" },
    { id: 2, name: "Jonas Weber", email: "jonas.weber@northwind.example", status: "active" },
    { id: 3, name: "Sofia Alves", email: "sofia.alves@northwind.example", status: "invited" },
  ]);
  const [reqs, setReqs] = useState<Req[]>([
    { id: 1, employee: "Maya Patel", city: "london", budget: 2600, stage: "needs-approval" },
    { id: 2, employee: "Jonas Weber", city: "berlin", budget: 1500, stage: "matched" },
  ]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reqEmp, setReqEmp] = useState("");
  const [reqCity, setReqCity] = useState<CityId>("amsterdam");
  const [reqBudget, setReqBudget] = useState(2000);

  function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setEmployees((x) => [...x, { id: Date.now(), name: name.trim(), email: email.trim(), status: "invited" }]);
    log("Corporate admin", `Invited employee ${name.trim()}`);
    setName(""); setEmail("");
  }
  function activate(id: number) { setEmployees((x) => x.map((e) => (e.id === id ? { ...e, status: "active" } : e))); }
  function createReq(e: React.FormEvent) {
    e.preventDefault();
    const emp = reqEmp || employees.find((x) => x.status === "active")?.name;
    if (!emp) return;
    setReqs((r) => [...r, { id: Date.now(), employee: emp, city: reqCity, budget: reqBudget, stage: "searching" }]);
    log("Corporate admin", `Housing request created for ${emp}`);
  }
  const setStage = (id: number, stage: Req["stage"]) => setReqs((r) => r.map((x) => (x.id === id ? { ...x, stage } : x)));

  const approved = reqs.filter((r) => r.stage === "approved").length;
  const decided = reqs.filter((r) => r.stage === "approved" || r.stage === "rejected").length;
  const pending = reqs.filter((r) => r.stage === "needs-approval");
  const byCity = CITIES.map((c) => ({ c, n: reqs.filter((r) => r.city === c.id).length })).filter((x) => x.n > 0);
  const tone = (s: Req["stage"]) => (s === "approved" ? "green" : s === "rejected" ? "rose" : s === "needs-approval" ? "amber" : s === "matched" ? "blue" : "slate");

  return (
    <div>
      <SectionTitle title="Corporate housing dashboard" sub="For HR and mobility teams: invite employees, track housing requests and matches, approve spend and see reporting. Demo data for a fictional company." />

      <div className="grid gap-4 sm:grid-cols-4">
        {[["Employees", employees.length], ["Active requests", reqs.filter((r) => r.stage !== "approved" && r.stage !== "rejected").length], ["Awaiting approval", pending.length], ["Approval rate", decided ? `${Math.round((approved / decided) * 100)}%` : "n/a"]].map(([l, v]) => (
          <Card key={String(l)} className="!p-4"><p className="text-xs text-slate-500">{l}</p><p className="mt-1 text-2xl font-semibold text-slate-900">{v}</p></Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-slate-900">Employees</h2>
          <form onSubmit={invite} className="mt-3 flex flex-wrap gap-2">
            <input className={`${input} flex-1`} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={`${input} flex-1`} placeholder="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Btn type="submit">Invite</Btn>
          </form>
          <ul className="mt-4 space-y-2">
            {employees.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 text-sm">
                <span><span className="font-medium text-slate-900">{e.name}</span> <span className="text-slate-500">{e.email}</span></span>
                {e.status === "active" ? <Pill tone="green">Active</Pill> : <button onClick={() => activate(e.id)} className="cursor-pointer"><Pill tone="amber">Invited (tap to accept)</Pill></button>}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900">New housing request</h2>
          <form onSubmit={createReq} className="mt-3 flex flex-wrap gap-2">
            <select className={input} value={reqEmp} onChange={(e) => setReqEmp(e.target.value)}>
              <option value="">Employee...</option>
              {employees.filter((e) => e.status === "active").map((e) => <option key={e.id}>{e.name}</option>)}
            </select>
            <select className={input} value={reqCity} onChange={(e) => setReqCity(e.target.value as CityId)}>
              {CITIES.map((c) => <option key={c.id} value={c.id}>{c.city}</option>)}
            </select>
            <input className={`${input} w-28`} type="number" step={50} value={reqBudget} onChange={(e) => setReqBudget(Number(e.target.value))} />
            <Btn type="submit">Create</Btn>
          </form>
          <p className="mt-2 text-xs text-slate-500">Budget is the monthly rent cap in the destination currency.</p>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-semibold text-slate-900">Requests, matches and approvals</h2>
        <div className="mt-3 divide-y divide-slate-100">
          {reqs.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div><p className="text-sm font-medium text-slate-900">{r.employee} to {cityById(r.city).city}</p>
                <p className="text-xs text-slate-500">Budget {cityById(r.city).currency}{r.budget.toLocaleString()}/month</p></div>
              <div className="flex items-center gap-2">
                <Pill tone={tone(r.stage)}>{r.stage.replace("-", " ")}</Pill>
                {r.stage === "searching" && <Btn variant="ghost" onClick={() => setStage(r.id, "matched")}>Simulate match</Btn>}
                {r.stage === "matched" && <Btn variant="ghost" onClick={() => setStage(r.id, "needs-approval")}>Send for approval</Btn>}
                {r.stage === "needs-approval" && (<><Btn onClick={() => { setStage(r.id, "approved"); log("Corporate admin", `Approved housing for ${r.employee}`); }}>Approve</Btn><Btn variant="danger" onClick={() => { setStage(r.id, "rejected"); log("Corporate admin", `Rejected housing for ${r.employee}`); }}>Reject</Btn></>)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-slate-900">Reporting: requests by destination</h2>
        <div className="mt-3 space-y-2">
          {byCity.map(({ c, n }) => (
            <div key={c.id} className="flex items-center gap-3 text-sm">
              <span className="w-24 text-slate-700">{c.city}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#00529f]" style={{ width: `${(n / reqs.length) * 100}%` }} /></div>
              <span className="w-6 text-right text-slate-500">{n}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
