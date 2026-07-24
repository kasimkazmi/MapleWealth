import { Reveal } from "./Reveal";

const steps = [
  {
    name: "Emergency Fund",
    detail: "First, a cash cushion so a bad month never becomes a bad year.",
  },
  {
    name: "TFSA",
    detail: "Then tax-free growth room — the best deal available to every Canadian.",
  },
  {
    name: "FHSA",
    detail: "If a first home is in the plan, this stacks tax-free savings on top.",
  },
  {
    name: "RRSP",
    detail: "Finally, tax-deferred retirement room once the above are funded.",
  },
];

export function PriorityLadder() {
  return (
    <section id="priority-ladder" className="min-h-screen snap-start flex flex-col justify-center px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl text-center mb-10">The Priority Ladder</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <Reveal key={step.name} delay={i * 120}>
              <div className={`hd-card p-5 ${i % 2 === 0 ? "-rotate-1" : "rotate-1"}`}>
                <span className="hd-badge mb-3 inline-block">Step {i + 1}</span>
                <h3 className="text-xl mb-1">{step.name}</h3>
                <p className="text-base" style={{ opacity: 0.75 }}>
                  {step.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
