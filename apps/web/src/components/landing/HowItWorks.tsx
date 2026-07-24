import { Reveal } from "./Reveal";

const steps = [
  { name: "Add your accounts", detail: "Chequing, savings, TFSA, FHSA, RRSP — whatever you've got." },
  { name: "See your priority", detail: "MapleWealth ranks what to fund next, in order." },
  { name: "Track progress monthly", detail: "Check in once a month and follow the next action." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="min-h-screen snap-start flex flex-col justify-center px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <Reveal key={step.name} delay={i * 150} className="text-center">
              <div
                className="hd-card w-14 h-14 mx-auto mb-4 flex items-center justify-center text-2xl"
                style={{ borderRadius: "var(--radius-wobbly-pill)" }}
              >
                {i + 1}
              </div>
              <h3 className="text-xl mb-1">{step.name}</h3>
              <p className="text-base" style={{ opacity: 0.75 }}>
                {step.detail}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
