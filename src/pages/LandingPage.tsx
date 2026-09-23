import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../sections/Hero";
import FeaturedProperties from "../sections/FeaturedProperties";
import ChooseYourJourney from "../sections/ChooseYourJourney";
import HowItWorks from "../sections/HowItWorks";
import PropertyNiches from "../sections/PropertyNiches";
import WhyBuynidify from "../sections/WhyBuynidify";
import Testimonials from "../sections/Testimonials";
import Partners from "../sections/Partners";
import TopLocations from "../sections/TopLocations";
import CTASection from "../sections/CTASection";
import RelocationAI from "../sections/RelocationAI";

// PARKED, NOT DELETED - Véta is keeping the current <ChooseYourJourney />
// for now but wants to be able to come back to the C2/C3 redesign options
// later, so the whole preview block is commented out rather than removed.
// To bring it back: uncomment this whole block, add the two imports back
// (ChooseYourJourneyShowcaseCompact, ChooseYourJourneyTabsMinimal), and
// uncomment the <JourneyOptionsPreview /> line in the JSX below.
//
// import ChooseYourJourneyShowcaseCompact from "../sections/ChooseYourJourneyShowcaseCompact";
// import ChooseYourJourneyTabsMinimal from "../sections/ChooseYourJourneyTabsMinimal";
//
// function JourneyOptionsPreview() {
//   return (
//     <div>
//       <div className="border-t-8 border-dashed border-brand-gold/40 bg-brand-surface py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
//         Preview only, below - option C2: tabs + contained photo panel
//       </div>
//       <ChooseYourJourneyShowcaseCompact />
//       <div className="border-t-8 border-dashed border-brand-gold/40 bg-brand-surface py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
//         Preview only, below - option C3: pill switcher, no big photo
//       </div>
//       <ChooseYourJourneyTabsMinimal />
//     </div>
//   );
// }

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <ChooseYourJourney />
        {/* <JourneyOptionsPreview /> */}
        <HowItWorks />
        {/* Right after How It Works: this is the natural next beat in the
            "here's how the process works" story (manual search -> automated
            matching -> now here's the AI doing the relocation legwork too),
            before the page shifts into differentiators and social proof. */}
        <RelocationAI />
        <PropertyNiches />
        <WhyBuynidify />
        <Testimonials />
        <Partners />
        <TopLocations />
        <CTASection />
        <FeaturedProperties />
      </main>
      <Footer />
    </div>
  );
}
