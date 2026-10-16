import { BASE_DOCS, cityById } from "../data";
import { useRelocate, type DocStatus } from "../store";
import { Btn, Card, Disclaimer, Pill, Progress, SectionTitle } from "../ui";

const LABEL: Record<DocStatus, { text: string; tone: "slate" | "blue" | "amber" | "green" }> = {
  todo: { text: "To do", tone: "slate" }, uploaded: { text: "Uploaded", tone: "blue" },
  verifying: { text: "Verifying...", tone: "amber" }, verified: { text: "Verified (demo)", tone: "green" },
};
const ACTION: Record<DocStatus, string> = { todo: "Upload", uploaded: "Verify", verifying: "In progress", verified: "Done" };

export default function Documents() {
  const { cityId, docs, advanceDoc, go } = useRelocate();
  const city = cityById(cityId);
  const all = [
    ...BASE_DOCS,
    ...city.docs.map((d, i) => ({ id: `local-${i}`, label: `${d} (${city.country})` })),
  ];
  const status = (id: string): DocStatus => docs[id] ?? "todo";
  const verified = all.filter((d) => status(d.id) === "verified").length;
  const pct = (verified / all.length) * 100;

  return (
    <div>
      <SectionTitle title="Documents and verification" sub={`Landlords in ${city.city} typically ask for the items below. Upload each one, then run verification.`} />
      <Card className="mb-6">
        <Progress value={pct} label={`${verified} of ${all.length} documents verified`} />
        <p className="mt-3 text-xs text-slate-500">Demo: no files leave your browser. In a live product, documents are encrypted and shared only with your explicit approval.</p>
      </Card>

      <div className="space-y-3">
        {all.map((d) => {
          const s = status(d.id);
          return (
            <Card key={d.id} className="flex flex-wrap items-center justify-between gap-3 !p-4">
              <div><p className="text-sm font-medium text-slate-900">{d.label}</p></div>
              <div className="flex items-center gap-3">
                <Pill tone={LABEL[s].tone}>{LABEL[s].text}</Pill>
                <Btn variant={s === "verified" ? "ghost" : "primary"} disabled={s === "verifying" || s === "verified"} onClick={() => advanceDoc(d.id)}>{ACTION[s]}</Btn>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Btn disabled={pct < 100} onClick={() => go("agreement")}>Continue to agreement preview</Btn>
        {pct < 100 && <span className="text-xs text-slate-500">Verify every document to continue.</span>}
      </div>
      <div className="mt-8"><Disclaimer text="Verification here is simulated. Real identity, income and right-to-rent checks depend on the country and need licensed providers and local legal review." /></div>
    </div>
  );
}
