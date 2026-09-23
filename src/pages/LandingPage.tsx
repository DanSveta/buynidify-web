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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <ChooseYourJourney />
        <HowItWorks />
        <PropertyNiches />
        <WhyBuynidify />
        <Testimonials />
        <Partners />
        <TopLocations />
        <CTASection />
        <RelocationAI />
        <FeaturedProperties />
      </main>
      <Footer />
    </div>
  );
}
