import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../sections/Hero";
import FeaturedProperties from "../sections/FeaturedProperties";
import ChooseYourJourneyShowcaseCompact from "../sections/ChooseYourJourneyShowcaseCompact";
import HowItWorks from "../sections/HowItWorks";
import PropertyNiches from "../sections/PropertyNiches";
import WhyBuynidify from "../sections/WhyBuynidify";
import Testimonials from "../sections/Testimonials";
import Partners from "../sections/Partners";
import TopLocations from "../sections/TopLocations";
import CTASection from "../sections/CTASection";
import RelocationAI from "../sections/RelocationAI";

// Véta compared C2 (tabs + contained photo panel) against the current
// version and the C3 pill-switcher option, and picked C2 - that's the live
// <ChooseYourJourneyShowcaseCompact /> below. The other two options
// (ChooseYourJourney.tsx - the previous live version - and
// ChooseYourJourneyTabsMinimal.tsx - C3) are kept on disk, just unused, in
// case she wants to revisit either later.

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <ChooseYourJourneyShowcaseCompact />
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
