import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { RoadmapSection } from "@/components/roadmap-section";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <RoadmapSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
