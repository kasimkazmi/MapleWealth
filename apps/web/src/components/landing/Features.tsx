import { Wallet, Landmark, LineChart, Compass, CreditCard } from "lucide-react";
import { Card } from "../Card";
import { Reveal } from "./Reveal";

const features = [
  {
    title: "Net Worth Tracking",
    icon: <Wallet size={20} />,
    body: "See every account — chequing, savings, TFSA, investments — in one running total.",
    mockup: { label: "Total across 6 accounts", value: "$48,540", trend: "+$340 this month" },
  },
  {
    title: "Contribution Room Calculator",
    icon: <Landmark size={20} />,
    body: "TFSA, FHSA, and RRSP room calculated from your real contribution history.",
    mockup: { label: "TFSA room remaining", value: "$3,100", trend: "of $7,000 annual limit" },
  },
  {
    title: "Dividend & DRIP Tracking",
    icon: <LineChart size={20} />,
    body: "ACB-aware tracking for dividends and reinvestment, done the way the CRA expects.",
    mockup: { label: "XEQT ACB per share", value: "$29.84", trend: "+$62 reinvested this month" },
  },
  {
    title: "Next Best Action",
    icon: <Compass size={20} />,
    body: "One clear recommendation each month, not a wall of charts to interpret yourself.",
    mockup: { label: "This month", value: "Fund TFSA", trend: "before FHSA — room expires yearly" },
  },
  {
    title: "Credit Card Optimizer",
    icon: <CreditCard size={20} />,
    body: "Enter your monthly spend by category and we rank real Canadian cashback cards by net annual value — fee included.",
    mockup: { label: "Best match for your spend", value: "$412/year", trend: "net of annual fee, recalculated live" },
    wide: true,
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
            <Reveal key={f.title} delay={i * 120} className={f.wide ? "md:col-span-2" : ""}>
              <Card title={f.title} icon={f.icon}>
                <p className="text-base mb-3" style={{ opacity: 0.8 }}>
                  {f.body}
                </p>
                <div
                  className="p-3"
                  style={{
                    background: "var(--background)",
                    border: "2px dashed var(--border)",
                    borderRadius: "var(--radius-wobbly-sm)",
                  }}
                >
                  <span className="text-xs uppercase tracking-wider" style={{ opacity: 0.6 }}>
                    {f.mockup.label}
                  </span>
                  <p className="text-xl leading-tight">{f.mockup.value}</p>
                  <span className="text-sm" style={{ opacity: 0.6 }}>
                    {f.mockup.trend}
                  </span>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
