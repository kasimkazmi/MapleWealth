import { Wallet, Landmark, LineChart, Compass } from "lucide-react";
import { Card } from "../Card";
import { Reveal } from "./Reveal";

const features = [
  {
    title: "Net Worth Tracking",
    icon: <Wallet size={20} />,
    body: "See every account — chequing, savings, TFSA, investments — in one running total.",
  },
  {
    title: "Contribution Room Calculator",
    icon: <Landmark size={20} />,
    body: "TFSA, FHSA, and RRSP room calculated from your real contribution history.",
  },
  {
    title: "Dividend & DRIP Tracking",
    icon: <LineChart size={20} />,
    body: "ACB-aware tracking for dividends and reinvestment, done the way the CRA expects.",
  },
  {
    title: "Next Best Action",
    icon: <Compass size={20} />,
    body: "One clear recommendation each month, not a wall of charts to interpret yourself.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="min-h-screen snap-start flex flex-col justify-center px-4 py-16"
      style={{ background: "var(--muted)" }}
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl text-center mb-10">What you get</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <Card title={f.title} icon={f.icon}>
                <p className="text-base" style={{ opacity: 0.8 }}>
                  {f.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
