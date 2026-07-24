import Link from "next/link";
import { HeroMockup } from "./HeroMockup";

export function Hero() {
  const trustItems = [
    "Canadian tax rules built in",
    "No trading, no speculation, no noise",
    "Self-hosted & free",
  ];

  return (
    <section id="hero" className="min-h-screen snap-start flex flex-col justify-center px-4 pt-16 pb-10">
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl leading-tight mb-4">
              Know exactly where your <span className="hd-marker-highlight">next dollar</span> should go.
            </h1>
            <p className="text-lg md:text-xl mb-6" style={{ opacity: 0.8 }}>
              MapleWealth tracks your net worth and tells you what to fund next — Emergency Fund,
              then TFSA, then FHSA, then RRSP. Built for Canadians, not generic budgeting rules.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="hd-btn px-6 py-3 text-xl">
                Get Started Free
              </Link>
              <Link href="/login" className="hd-btn hd-btn--secondary px-6 py-3 text-xl">
                Log In
              </Link>
            </div>
          </div>

          {/* TODO: replace with real dashboard screenshot once a demo account is seeded — see public/ */}
          <HeroMockup />
        </div>

        <div
          className="mt-16 pt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-base text-center"
          style={{ borderTop: "2px dashed var(--border)", opacity: 0.8 }}
        >
          {trustItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
