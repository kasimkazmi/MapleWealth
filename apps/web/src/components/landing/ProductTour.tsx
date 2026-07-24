import { Reveal } from "./Reveal";

const accounts = [
  { name: "Chequing", type: "Daily spending", balance: "$2,140" },
  { name: "Emergency HISA", type: "Savings", balance: "$8,000" },
  { name: "TFSA — XEQT", type: "Investment", balance: "$21,400" },
  { name: "FHSA", type: "Savings", balance: "$3,800" },
];

const room = [
  { label: "TFSA", used: 56, amount: "$3,900 of $7,000 used" },
  { label: "FHSA", used: 48, amount: "$3,800 of $8,000 used" },
  { label: "RRSP", used: 22, amount: "$7,300 of $33,830 used" },
];

export function ProductTour() {
  return (
    <section id="product-tour" className="min-h-screen snap-start flex flex-col justify-center px-4 py-16">
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="text-3xl md:text-4xl text-center mb-2">See it in action</h2>
        <p className="text-lg text-center mb-10" style={{ opacity: 0.75 }}>
          A quick look at what your monthly check-in actually looks like.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <Reveal>
            <div className="hd-card p-5 rotate-[-1deg]" style={{ boxShadow: "6px 6px 0px 0px var(--border)" }}>
              <span className="text-sm font-bold uppercase tracking-wider mb-3 block" style={{ opacity: 0.75 }}>
                Accounts
              </span>
              <div className="space-y-2">
                {accounts.map((a) => (
                  <div key={a.name} className="flex justify-between items-baseline">
                    <div>
                      <p className="text-base leading-none">{a.name}</p>
                      <span className="text-xs" style={{ opacity: 0.55 }}>
                        {a.type}
                      </span>
                    </div>
                    <span className="text-base">{a.balance}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="hd-card p-5 rotate-1" style={{ boxShadow: "6px 6px 0px 0px var(--border)" }}>
              <span className="text-sm font-bold uppercase tracking-wider mb-3 block" style={{ opacity: 0.75 }}>
                Contribution Room
              </span>
              <div className="space-y-4">
                {room.map((r) => (
                  <div key={r.label}>
                    <div className="flex justify-between text-base mb-1">
                      <span>{r.label}</span>
                      <span style={{ opacity: 0.6 }}>{r.amount}</span>
                    </div>
                    <div
                      className="h-3 w-full"
                      style={{ background: "var(--muted)", border: "2px solid var(--border)", borderRadius: "var(--radius-wobbly-pill)" }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${r.used}%`,
                          background: "var(--accent-2)",
                          borderRadius: "var(--radius-wobbly-pill)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
