import { RelocateProvider, useRelocate, type View } from "./store";
import Home from "./sections/Home";
import Onboarding from "./sections/Onboarding";
import Search from "./sections/Search";
import Analysis from "./sections/Analysis";
import Shortlist from "./sections/Shortlist";
import Documents from "./sections/Documents";
import Agreement from "./sections/Agreement";
import Services from "./sections/Services";
import Corporate from "./sections/Corporate";
import VoiceHub from "./voice/VoiceHub";
import SupportChat from "./sections/SupportChat";
import { cityById } from "./data";

const NAV: { id: View; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "onboarding", label: "My needs" },
  { id: "search", label: "Homes" },
  { id: "shortlist", label: "Shortlist" },
  { id: "documents", label: "Documents" },
  { id: "agreement", label: "Agreement" },
  { id: "voice", label: "Voice AI" },
  { id: "services", label: "Services" },
  { id: "corporate", label: "For companies" },
];

function Shell() {
  const { view, go, cityId, shortlist } = useRelocate();
  const city = cityById(cityId);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <button onClick={() => go("home")} className="flex cursor-pointer items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00529f] text-sm font-bold text-white">R</span>
            <span className="text-lg font-semibold tracking-tight">Relocate AI</span>
          </button>
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 sm:inline">{city.city}, {city.country}</span>
          <span className="ml-auto hidden text-[11px] uppercase tracking-[0.18em] text-slate-400 md:inline">by Buynidify</span>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)}
              className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === n.id || (n.id === "search" && view === "analysis") ? "bg-[#e8f0fa] text-[#00529f]" : "text-slate-600 hover:bg-slate-100"}`}>
              {n.label}{n.id === "shortlist" && shortlist.length > 0 ? ` (${shortlist.length})` : ""}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 pb-28">
        {view === "home" && <Home />}
        {view === "onboarding" && <Onboarding />}
        {view === "search" && <Search />}
        {view === "analysis" && <Analysis />}
        {view === "shortlist" && <Shortlist />}
        {view === "documents" && <Documents />}
        {view === "agreement" && <Agreement />}
        {view === "voice" && <VoiceHub />}
        {view === "services" && <Services />}
        {view === "corporate" && <Corporate />}
      </main>

      <footer className="border-t border-slate-200 px-4 py-6 text-center text-xs text-slate-500">
        Relocate AI is a demo. Rental rules, verification, e-signing and payments vary by country and need local legal and compliance review.
      </footer>
      <SupportChat />
    </div>
  );
}

export default function RelocateApp() {
  return (
    <RelocateProvider>
      <Shell />
    </RelocateProvider>
  );
}
