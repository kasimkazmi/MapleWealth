import { Reveal } from "./Reveal";

const faqs = [
  {
    q: "Is this a licensed financial advisor?",
    a: "No. MapleWealth follows a fixed priority order (Emergency Fund → TFSA → FHSA → RRSP) and never recommends trading, market timing, or speculation. It's a tracker with a rule of thumb, not personalized advice.",
  },
  {
    q: "Is my financial data safe?",
    a: "MapleWealth is self-hosted and free — your data lives in your own database, not a third-party cloud you don't control.",
  },
  {
    q: "Do I need to link my bank account?",
    a: "No automatic bank sync yet. You add accounts and balances manually or via CSV import, so nothing is shared with a third party.",
  },
  {
    q: "Why that specific order — Emergency Fund, TFSA, FHSA, RRSP?",
    a: "It's the order that minimizes risk first (cash cushion), then maximizes tax-free room while it's available, then buys down taxable income last — matching how the accounts are actually designed to work together in Canada.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="min-h-screen snap-start flex flex-col justify-center px-4 py-16">
      <div className="max-w-3xl mx-auto w-full">
        <h2 className="text-3xl md:text-4xl text-center mb-10">Questions</h2>
        <div className="space-y-5">
          {faqs.map((item, i) => (
            <Reveal key={item.q} delay={i * 100}>
              <div className="hd-card p-5">
                <h3 className="text-xl mb-1">{item.q}</h3>
                <p className="text-base" style={{ opacity: 0.75 }}>
                  {item.a}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
