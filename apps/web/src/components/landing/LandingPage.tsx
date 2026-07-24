import { Hero } from "./Hero";
import { PriorityLadder } from "./PriorityLadder";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
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
        <HowItWorks />
        <ClosingCta />
        <Footer />
      </div>
    </>
  );
}
