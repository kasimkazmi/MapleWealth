"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import { Card } from "../../components/Card";
import { useDashboard } from "../../hooks/useDashboard";
import { logout, apiFetch } from "../../lib/api";
import {
  LayoutDashboard,
  Wallet,
  LineChart,
  CreditCard,
  LogOut,
  Sparkles,
  Calculator,
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface CardDetails {
  id: string;
  name: string;
  bank: string;
  fee: number;
  perks: string[];
  tips: string;
  // Cashback calculation rates
  rates: {
    groceries: number;
    dining: number;
    recurring: number;
    other: number;
  };
  signupBonus: string;
  referralUrl?: string;
}

const CREDIT_CARDS: CardDetails[] = [
  {
    id: "scotia-momentum",
    name: "Momentum Infinite Bill-Slasher",
    bank: "Scotia",
    fee: 120,
    perks: [
      "4% cash back on groceries and recurring bills",
      "2% cash back on gas and transportation",
      "1% cash back on all other purchases",
      "Includes comprehensive travel insurance"
    ],
    tips: "Maximize this card by linking your phone bill, internet bill, utilities, and streaming subscriptions directly to it.",
    rates: { groceries: 0.04, dining: 0.01, recurring: 0.04, other: 0.01 },
    signupBonus: "10% cash back on all purchases for the first 3 months (up to $2,000 in spend).",
    referralUrl: "#"
  },
  {
    id: "rogers-red",
    name: "Rogers Red Telecom Saver",
    bank: "Rogers Bank",
    fee: 0,
    perks: [
      "2% value towards Rogers/Shaw/Fido bill payments",
      "1.5% cash back flat-rate on all everyday purchases",
      "No annual fee",
      "5 free Roam Like Home days annually"
    ],
    tips: "Best overall card if you are a Rogers or Shaw customer. The 1.5% flat-rate cash back beats almost every other no-fee card in Canada.",
    rates: { groceries: 0.015, dining: 0.015, recurring: 0.015, other: 0.015 },
    signupBonus: "10% cash back welcome bonus on all purchases up to $100.",
    referralUrl: "#"
  },
  {
    id: "tangerine-cashback",
    name: "Tangerine Category Customizer",
    bank: "Tangerine",
    fee: 0,
    perks: [
      "2% cash back on up to 3 select categories of your choice",
      "0.5% base reward rate on other categories",
      "No annual fee",
      "Cashback paid monthly directly to savings account"
    ],
    tips: "Select 'Groceries', 'Restaurants', and 'Recurring Bills' as your 2% categories for optimal daily rewards.",
    rates: { groceries: 0.02, dining: 0.02, recurring: 0.02, other: 0.005 },
    signupBonus: "10% cash back in select categories for the first 2 months (up to $100).",
    referralUrl: "#"
  },
  {
    id: "simplii-cashback",
    name: "Simplii Foodie Cash Back",
    bank: "Simplii Financial",
    fee: 0,
    perks: [
      "4% rewards on restaurant dining, cafes, and bars",
      "1.5% on gas, groceries, and pharmacy bills",
      "0.5% on all other spending",
      "No annual fee"
    ],
    tips: "Keep this card in your wallet specifically for dining out and ordering delivery. It offers the highest dining rewards rate for a no-fee card.",
    rates: { groceries: 0.015, dining: 0.04, recurring: 0.005, other: 0.005 },
    signupBonus: "10% cash back on dining for the first 4 months (up to $500 in spend).",
    referralUrl: "#"
  }
];

export default function CreditCardsClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const { profile, isPremium } = useDashboard();

  const handleUpgrade = async () => {
    try {
      const res = await apiFetch("/billing/checkout", { method: "POST" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to initiate billing session");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Billing checkout error");
    }
  };

  // Spend inputs for optimizer calculator
  const [spendGroceries, setSpendGroceries] = useState("350");
  const [spendDining, setSpendDining] = useState("150");
  const [spendRecurring, setSpendRecurring] = useState("200");
  const [spendOther, setSpendOther] = useState("500");

  // Calculate best card based on user spend
  const recommendations = useMemo(() => {
    const groc = Number(spendGroceries) || 0;
    const din = Number(spendDining) || 0;
    const rec = Number(spendRecurring) || 0;
    const oth = Number(spendOther) || 0;

    return CREDIT_CARDS.map(card => {
      // Annual gross cashback
      const monthlyGains = 
        (groc * card.rates.groceries) +
        (din * card.rates.dining) +
        (rec * card.rates.recurring) +
        (oth * card.rates.other);
      
      const annualGains = monthlyGains * 12;
      const netAnnualGains = annualGains - card.fee;

      return {
        ...card,
        netAnnualGains
      };
    }).sort((a, b) => b.netAnnualGains - a.netAnnualGains);
  }, [spendGroceries, spendDining, spendRecurring, spendOther]);

  const bestCard = recommendations[0];

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Sidebar */}
      <aside
        className="w-64 p-6 flex-col justify-between hidden md:flex h-full"
        style={{ borderRight: "3px solid var(--border)", background: "var(--card)" }}
      >
        <div>
          <div className="flex items-center justify-center mb-8">
            <img src="/logo.png" alt="MapleWealth Logo" className="w-32 object-contain" />
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-base transition-transform duration-100 cursor-pointer hover:-rotate-1"
              style={{ opacity: 0.65 }}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link
              href="/dashboard?tab=accounts"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-base transition-transform duration-100 cursor-pointer hover:-rotate-1"
              style={{ opacity: 0.65 }}
            >
              <Wallet className="w-4 h-4" /> Net Worth
            </Link>
            <Link
              href="/dashboard?tab=investments"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-base transition-transform duration-100 cursor-pointer hover:-rotate-1"
              style={{ opacity: 0.65 }}
            >
              <LineChart className="w-4 h-4" /> Investments
            </Link>
            <Link
              href="/credit-cards"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-base transition-transform duration-100 cursor-pointer"
              style={{ background: "var(--postit)", border: "2px solid var(--border)", borderRadius: "var(--radius-wobbly-sm)" }}
            >
              <CreditCard className="w-4 h-4" /> Credit Cards
            </Link>
          </nav>
        </div>

        <div className="hd-card hd-card--tight p-4 rotate-1">
          <div className="text-xs uppercase tracking-wider font-bold mb-2" style={{ opacity: 0.55 }}>User Profile</div>
          <div className="font-bold text-lg truncate" title={session?.user?.name || session?.user?.email || "Guest User"}>
            {session?.user?.name || "Guest User"}
          </div>
          {session?.user?.name && (
            <div className="text-xs truncate mb-1" style={{ opacity: 0.65 }}>
              {session.user.email}
            </div>
          )}
          <div className="text-sm font-bold" style={{ color: "var(--accent-2)" }}>Software Developer</div>
          <div className="text-sm mt-1 mb-2" style={{ opacity: 0.65 }}>Salary: ${profile?.annualSalary ? Number(profile.annualSalary).toLocaleString() : "0"} CAD</div>
          
          {isPremium ? (
            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 py-1 px-2.5 rounded border border-emerald-300 text-center">
              ★ Premium Active
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              className="hd-btn w-full text-xs py-1.5 cursor-pointer font-bold block text-center"
              style={{ background: "var(--postit)" }}
            >
              Go Premium ($5/mo)
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex justify-between items-center p-6 md:p-8 pb-6 border-b-3 border-dashed border-[var(--border)]" style={{ backgroundColor: "var(--background)" }}>
          <div>
            <h1 className="text-4xl">Canadian Card Optimizer</h1>
            <p className="text-sm mt-1" style={{ opacity: 0.65 }}>Maximize your cashback strategy with custom rewards matching.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => logout()} className="hd-btn hd-btn--secondary px-4 py-2" title="Sign out">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Calculator Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Monthly Spend Inputs" icon={<Calculator className="w-5 h-5" style={{ color: "var(--accent)" }} />} rotate="-rotate-1">
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block font-bold mb-1">Groceries ($/month)</label>
                  <input
                    type="number"
                    value={spendGroceries}
                    onChange={(e) => setSpendGroceries(e.target.value)}
                    className="hd-input p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Dining & Takeout ($/month)</label>
                  <input
                    type="number"
                    value={spendDining}
                    onChange={(e) => setSpendDining(e.target.value)}
                    className="hd-input p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Recurring Bills & Subscriptions ($/month)</label>
                  <input
                    type="number"
                    value={spendRecurring}
                    onChange={(e) => setSpendRecurring(e.target.value)}
                    className="hd-input p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Other Spend ($/month)</label>
                  <input
                    type="number"
                    value={spendOther}
                    onChange={(e) => setSpendOther(e.target.value)}
                    className="hd-input p-2"
                  />
                </div>
              </div>
            </Card>

            {/* Best Match Result */}
            <div className="lg:col-span-2">
              <Card title="Best Card Recommendation" icon={<Sparkles className="w-5 h-5" style={{ color: "var(--accent-2)" }} />} decoration="tack" postit rotate="rotate-1">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{bestCard.bank}</span>
                    <h3 className="text-3xl font-bold mt-1 text-[var(--accent-2)]">{bestCard.name}</h3>
                    <p className="text-sm mt-3 font-semibold text-neutral-700">Estimated Annual Net Value:</p>
                    <div className="text-4xl font-extrabold mt-1 text-emerald-600">
                      ${bestCard.netAnnualGains.toLocaleString("en-CA", { maximumFractionDigits: 0 })}/year
                      <span className="text-xs text-neutral-500 font-normal ml-2">(after annual fees)</span>
                    </div>
                  </div>
                  <div className="md:w-1/3 p-4 bg-white/70 rounded-lg border-2 border-dashed border-neutral-300">
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1">Calculator Logic</span>
                    <p className="text-[11px] leading-relaxed text-neutral-600">
                      We calculate the exact cash return in each spending category, add them up, and subtract the card's annual fee.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-dashed border-neutral-300">
                  <div className="text-sm font-bold flex items-center gap-1 mb-2">
                    <HelpCircle className="w-4 h-4 text-[var(--accent-2)]" /> Strategic Optimization Tip:
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-700 font-bold bg-white/80 p-3 rounded" style={{ borderLeft: "4px solid var(--accent-2)" }}>
                    {bestCard.tips}
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Cards Comparison List */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Top Canadian Cashback Credit Cards</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((card, idx) => (
                <div key={card.id} className="relative hd-card p-6 flex flex-col justify-between" style={{ background: "var(--card)" }}>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{card.bank}</span>
                      <span className="text-xs font-bold py-1 px-2.5 bg-neutral-100 rounded border border-neutral-300 text-neutral-600">
                        {card.fee === 0 ? "No Fee" : `$${card.fee}/year`}
                      </span>
                    </div>

                    <h4 className="text-2xl font-bold text-[var(--accent-2)] mb-4">{card.name}</h4>

                    <div className="space-y-3 mb-6">
                      <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">Key Privileges</div>
                      <ul className="text-xs space-y-1.5 list-disc pl-4 text-neutral-700">
                        {card.perks.map((perk, pIdx) => (
                          <li key={pIdx}>{perk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dashed border-neutral-300">
                    <div className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Welcome Bonus Option:
                    </div>
                    <p className="text-xs text-neutral-700 italic">{card.signupBonus}</p>

                    <div className="mt-4 pt-3 flex justify-between items-center text-xs font-bold bg-neutral-50 p-2 rounded">
                      <span className="text-neutral-500">Your Annual Net Gain:</span>
                      <span className="text-sm font-extrabold text-emerald-600">${card.netAnnualGains.toLocaleString("en-CA", { maximumFractionDigits: 0 })}</span>
                    </div>

                    {card.referralUrl && (
                      <a
                        href={card.referralUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hd-btn w-full mt-4 text-center block text-xs py-2.5 cursor-pointer font-bold"
                        style={{ borderStyle: "solid" }}
                      >
                        Apply &amp; Get Bonus
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
