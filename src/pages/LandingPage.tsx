import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../sections/Hero";
import FeaturedProperties from "../sections/FeaturedProperties";
import ChooseYourJourneyShowcaseCompact from "../sections/ChooseYourJourneyShowcaseCompact";
import HowItWorks from "../sections/HowItWorks";
import AISolutions from "../sections/AISolutions";
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
        {/* Right after How It Works: the three-AI-solutions story (analysis,
            relocation, support) as one coherent highlight, followed
            immediately by Relocate AI's own deeper feature section - keeps
            every AI capability in one run of the page instead of scattering
            it, per Véta's request to foreground all three. */}
        <AISolutions />
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
