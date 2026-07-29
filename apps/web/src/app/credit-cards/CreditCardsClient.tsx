"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import { Card } from "../../components/Card";
import { Sidebar } from "../../components/Sidebar";
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
  slug: string;
  name: string;
  bank: string;
  brandColor: string;
  logoUrl: string;
  cardImageUrl: string;
  fee: number;
  perks: string[];
  tips: string;
  rates: {
    groceries: number;
    dining: number;
    recurring: number;
    other: number;
  };
  signupBonus: string;
  referralUrl?: string;
}

interface ApiCreditCardProduct {
  id: string;
  slug: string;
  name: string;
  bank: string;
  brandColor: string;
  logoUrl: string;
  cardImageUrl: string;
  fee: string;
  perks: string[];
  tips: string;
  rateGroceries: string;
  rateDining: string;
  rateRecurring: string;
  rateOther: string;
  signupBonus: string;
  referralUrl: string | null;
}

function mapApiCard(card: ApiCreditCardProduct): CardDetails {
  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    bank: card.bank,
    brandColor: card.brandColor,
    logoUrl: card.logoUrl,
    cardImageUrl: card.cardImageUrl,
    fee: Number(card.fee),
    perks: card.perks,
    tips: card.tips,
    rates: {
      groceries: Number(card.rateGroceries),
      dining: Number(card.rateDining),
      recurring: Number(card.rateRecurring),
      other: Number(card.rateOther)
    },
    signupBonus: card.signupBonus,
    referralUrl: card.referralUrl ?? undefined
  };
}

function bankInitials(bank: string): string {
  return bank
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function BankBadge({
  bank,
  brandColor,
  logoUrl,
  size = "md"
}: {
  bank: string;
  brandColor: string;
  logoUrl: string;
  size?: "sm" | "md";
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const dimension = size === "sm" ? "w-10 h-10 text-xs" : "w-14 h-14 text-sm";

  if (imgFailed) {
    return (
      <div
        className={`${dimension} shrink-0 rounded-full flex items-center justify-center font-extrabold text-white border-2 border-(--border)`}
        style={{ background: brandColor }}
        title={bank}
        aria-label={`${bank} logo`}
      >
        {bankInitials(bank)}
      </div>
    );
  }

  return (
    <div
      className={`${dimension} shrink-0 rounded-full flex items-center justify-center bg-white border-2 border-(--border) p-1.5`}
      title={bank}
    >
      <img
        src={logoUrl}
        alt={`${bank} logo`}
        className="w-full h-full object-contain"
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

function CardArt({ imageUrl, name }: { imageUrl: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={imageUrl}
      alt={`${name} card art`}
      className="w-full h-auto max-h-40 object-contain rounded-lg mb-4 bg-neutral-50 border border-neutral-200"
      onError={() => setFailed(true)}
    />
  );
}

export default function CreditCardsClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const { profile, isPremium } = useDashboard();

  const [cards, setCards] = useState<CardDetails[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/credit-cards");
        if (!res.ok) throw new Error("Failed to load credit card catalog");
        const data: ApiCreditCardProduct[] = await res.json();
        if (!cancelled) setCards(data.map(mapApiCard));
      } catch (err) {
        if (!cancelled) setCardsError(err instanceof Error ? err.message : "Failed to load credit card catalog");
      } finally {
        if (!cancelled) setCardsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

    return cards.map(card => {
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
  }, [cards, spendGroceries, spendDining, spendRecurring, spendOther]);

  const bestCard = recommendations[0];

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Sidebar */}
      <Sidebar
        session={session}
        profile={profile}
        isPremium={isPremium}
        onUpgrade={handleUpgrade}
        navItems={[
          {
            key: "dashboard",
            label: "Dashboard",
            icon: <LayoutDashboard className="w-4 h-4" />,
            href: "/dashboard",
            active: false
          },
          {
            key: "accounts",
            label: "Net Worth",
            icon: <Wallet className="w-4 h-4" />,
            href: "/dashboard?tab=accounts",
            active: false
          },
          {
            key: "investments",
            label: "Investments",
            icon: <LineChart className="w-4 h-4" />,
            href: "/dashboard?tab=investments",
            active: false
          },
          {
            key: "credit-cards",
            label: "Credit Cards",
            icon: <CreditCard className="w-4 h-4" />,
            href: "/credit-cards",
            active: true
          }
        ]}
      />

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
          {cardsLoading ? (
            <div className="hd-card p-8 text-center text-sm" style={{ opacity: 0.65 }}>Loading credit card catalog...</div>
          ) : cardsError ? (
            <div className="hd-card p-8 text-center text-sm text-red-600">{cardsError}</div>
          ) : cards.length === 0 ? (
            <div className="hd-card p-8 text-center text-sm" style={{ opacity: 0.65 }}>No credit cards available right now.</div>
          ) : (
          <>
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
                    <div className="flex items-center gap-3 mb-1">
                      <BankBadge bank={bestCard.bank} brandColor={bestCard.brandColor} logoUrl={bestCard.logoUrl} />
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{bestCard.bank}</span>
                    </div>
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
                      <div className="flex items-center gap-2">
                        <BankBadge bank={card.bank} brandColor={card.brandColor} logoUrl={card.logoUrl} size="sm" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{card.bank}</span>
                      </div>
                      <span className="text-xs font-bold py-1 px-2.5 bg-neutral-100 rounded border border-neutral-300 text-neutral-600">
                        {card.fee === 0 ? "No Fee" : `$${card.fee}/year`}
                      </span>
                    </div>

                    <h4 className="text-2xl font-bold text-[var(--accent-2)] mb-2">{card.name}</h4>

                    <CardArt imageUrl={card.cardImageUrl} name={card.name} />

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
          </>
          )}
        </div>
      </main>
    </div>
  );
}
