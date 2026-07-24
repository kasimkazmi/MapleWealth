import { Hero } from "./Hero";
import { PriorityLadder } from "./PriorityLadder";
import { Features } from "./Features";
import { ProductTour } from "./ProductTour";
import { HowItWorks } from "./HowItWorks";
import { Faq } from "./Faq";
import { ClosingCta } from "./ClosingCta";
import { Footer } from "./Footer";
import { FloatingNav } from "./FloatingNav";

export function LandingPage() {
  return (
    <>
      <FloatingNav />
      <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        <Hero />
        <PriorityLadder />
        <Features />
        <ProductTour />
        <HowItWorks />
        <Faq />
        <ClosingCta />
        <Footer />
      </div>
    </>
  );
}
