"use client";

import { useSession } from "../lib/auth-client";
import { useDashboard } from "../hooks/useDashboard";
import { Card } from "../components/Card";
import { Onboarding } from "../components/Onboarding";
import { NetWorthTab } from "../components/NetWorthTab";
import { InvestmentsTab } from "../components/InvestmentsTab";
import { logout, apiFetch } from "../lib/api";
import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  LineChart,
  ShieldCheck,
  Sparkles,
  Bell,
  CheckCircle2,
  AlertTriangle,
  X,
  Compass,
  ArrowUpRight,
  LogOut,
  CreditCard
} from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();
  const {
    loading,
    error,
    profile,
    netWorth,
    accounts,
    goals,
    holdings,
    rules,
    room,
    report,
    showTradeModal,
    setShowTradeModal,
    tradeForm,
    setTradeForm,
    activeTab,
    setActiveTab,
    isPremium,
    fetchData,
    handleRecordTrade
  } = useDashboard();

  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam, setActiveTab]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 animate-spin"
            style={{ border: "4px solid var(--border)", borderTopColor: "transparent", borderRadius: "50%" }}
          ></div>
          <p className="text-xl">Loading MapleWealth Personal OS...</p>
        </div>
      </div>
    );
  }

  if (profile === null) {
    return <Onboarding onCompleted={fetchData} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="hd-card max-w-md w-full p-8 text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            style={{ background: "var(--postit)", border: "2px solid var(--border)", borderRadius: "50%" }}
          >
            <AlertTriangle className="w-8 h-8" style={{ color: "var(--accent)" }} />
          </div>
          <h2 className="text-2xl mb-2">Backend Connection Failed</h2>
          <p className="mb-6 text-sm" style={{ opacity: 0.7 }}>{error}</p>
          <button onClick={fetchData} className="hd-btn w-full py-2">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const netWorthGoal = goals.find((g) => g.type === "net_worth");
  const efMinGoal = goals.find((g) => g.name.includes("Minimum"));
  const efIdealGoal = goals.find((g) => g.type === "emergency_fund" && g !== efMinGoal);

  const netWorthTarget = netWorthGoal ? Number(netWorthGoal.targetAmount) : null;
  const progressNetWorth = netWorthTarget
    ? Math.min(100, (netWorth.netWorth / netWorthTarget) * 100)
    : 0;

  const efTarget = efMinGoal ? Number(efMinGoal.targetAmount) : 5000;
  const efIdealTarget = efIdealGoal ? Number(efIdealGoal.targetAmount) : 8000;
  const efProgress = goals.find(g => g.type === "emergency_fund")?.currentAmount || 0;
  const progressEf = Math.min(100, (efProgress / efTarget) * 100);

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Sidebar */}
      <aside
        className="w-64 p-6 flex-col justify-between hidden md:flex h-full"
        style={{ borderRight: "3px solid var(--border)", background: "var(--card)" }}
      >
        <div>
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="MapleWealth Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl hd-wavy-underline">
              MapleWealth
            </span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-base transition-transform duration-100 cursor-pointer ${
                activeTab === "dashboard" ? "hover:rotate-0" : "hover:-rotate-1"
              }`}
              style={
                activeTab === "dashboard"
                  ? { background: "var(--postit)", border: "2px solid var(--border)", borderRadius: "var(--radius-wobbly-sm)" }
                  : { opacity: 0.65 }
              }
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab("accounts")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-base transition-transform duration-100 cursor-pointer ${
                activeTab === "accounts" ? "hover:rotate-0" : "hover:-rotate-1"
              }`}
              style={
                activeTab === "accounts"
                  ? { background: "var(--postit)", border: "2px solid var(--border)", borderRadius: "var(--radius-wobbly-sm)" }
                  : { opacity: 0.65 }
              }
            >
              <Wallet className="w-4 h-4" /> Net Worth
            </button>
            <button
              onClick={() => setActiveTab("investments")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-base transition-transform duration-100 cursor-pointer ${
                activeTab === "investments" ? "hover:rotate-0" : "hover:-rotate-1"
              }`}
              style={
                activeTab === "investments"
                  ? { background: "var(--postit)", border: "2px solid var(--border)", borderRadius: "var(--radius-wobbly-sm)" }
                  : { opacity: 0.65 }
              }
            >
              <LineChart className="w-4 h-4" /> Investments
            </button>
            <Link
              href="/credit-cards"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-base transition-transform duration-100 cursor-pointer hover:-rotate-1"
              style={{ opacity: 0.65 }}
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
            <h1 className="text-4xl">Financial Command Center</h1>
            <p className="text-sm mt-1" style={{ opacity: 0.65 }}>Canadian personal wealth optimization plan tracking.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowTradeModal(true)} className="hd-btn px-4 py-2">
              Record Buy/Sell Trade
            </button>
            <button onClick={() => logout()} className="hd-btn hd-btn--secondary px-4 py-2" title="Sign out">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Reusable Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Net Worth Card */}
              <Card title="Net Worth" icon={<Wallet className="w-5 h-5" style={{ color: "var(--accent-2)" }} />} decoration="tack" rotate="-rotate-1">
                <div className="text-4xl font-bold">
                  ${netWorth.netWorth.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs mt-2 flex justify-between" style={{ opacity: 0.6 }}>
                  <span>Assets: ${netWorth.assets.toLocaleString()}</span>
                  <span>Liabilities: ${netWorth.debt.toLocaleString()}</span>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span style={{ color: "var(--accent-2)" }}>
                      {netWorthTarget
                        ? `Progress to $${netWorthTarget.toLocaleString("en-CA")} Target`
                        : "Set a Net Worth goal in the Net Worth tab"}
                    </span>
                    <span>{progressNetWorth.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 overflow-hidden" style={{ border: "2px solid var(--border)", borderRadius: "var(--radius-wobbly-pill)", background: "var(--muted)" }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${progressNetWorth}%`, background: "var(--accent-2)" }}
                    ></div>
                  </div>
                </div>
              </Card>

              {/* Emergency Buffer Card */}
              <Card title="Emergency Buffer" icon={<ShieldCheck className="w-5 h-5" style={{ color: "var(--accent)" }} />} decoration="tape" rotate="rotate-1">
                <div className="text-4xl font-bold">
                  ${efProgress.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs font-bold mt-2" style={{ color: "var(--accent)" }}>
                  Min Target: ${efTarget.toLocaleString("en-CA")} | Ideal: ${efIdealTarget.toLocaleString("en-CA")}
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span style={{ color: "var(--accent)" }}>Buffer Strength</span>
                    <span>{progressEf.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 overflow-hidden" style={{ border: "2px solid var(--border)", borderRadius: "var(--radius-wobbly-pill)", background: "var(--muted)" }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${progressEf}%`, background: "var(--accent)" }}
                    ></div>
                  </div>
                </div>
              </Card>

              {/* TFSA Status Card */}
              <Card title="TFSA Room Remaining" icon={<LineChart className="w-5 h-5" style={{ color: "var(--accent-2)" }} />} rotate="-rotate-1">
                <div className="text-4xl font-bold">
                  ${room ? room.tfsa.roomRemaining.toLocaleString("en-CA", { minimumFractionDigits: 2 }) : "0.00"}
                </div>
                <div className="text-xs font-bold mt-2" style={{ color: "var(--accent-2)" }}>
                  <span>Yearly limit: ${room ? room.tfsa.limit.toLocaleString("en-CA") : "0"}</span>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs hd-divider-dashed pt-3">
                  <span style={{ opacity: 0.65 }}>Total invested this year</span>
                  <span className="font-bold" style={{ color: "var(--accent-2)" }}>${room ? room.tfsa.contributed.toLocaleString() : "0"}</span>
                </div>
              </Card>
            </div>

            {/* Warnings and Holdings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Warnings and Cautions Feed */}
              <div className="hd-card p-6">
                <h3 className="text-2xl mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" style={{ color: "var(--accent)" }} /> Planning Engine Guidance &amp; Warnings
                </h3>
                <div className="space-y-4">
                  {rules.filter(r => r.status !== 'pass').length === 0 ? (
                    <div
                      className="p-4 text-sm flex items-center gap-2"
                      style={{ background: "#e8f3e3", border: "2px dashed var(--border)", borderRadius: "var(--radius-wobbly-sm)" }}
                    >
                      <CheckCircle2 className="w-4 h-4" /> All checks passed! Your assets fully follow the Canadian Master Plan strategy.
                    </div>
                  ) : (
                    rules.filter(r => r.status !== 'pass').map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-4 text-sm flex gap-3"
                        style={{
                          border: "2px solid var(--border)",
                          borderRadius: "var(--radius-wobbly-sm)",
                          background: rule.severity === 'high' ? "#fdeaea" : "var(--postit)",
                        }}
                      >
                        <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: rule.severity === 'high' ? "var(--accent)" : "#a68b00" }} />
                        <div>
                          <div className="font-bold mb-0.5">{rule.source_rule}</div>
                          <p className="mb-2 text-xs" style={{ opacity: 0.75 }}>{rule.message}</p>
                          <div className="text-xs italic p-2.5" style={{ border: "2px dashed var(--border)", borderRadius: "var(--radius-wobbly-sm)", background: "var(--card)" }}>
                            Action: {rule.recommended_action}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Holdings Section */}
              <div className="hd-card p-6">
                <h3 className="text-2xl mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2"><ArrowUpRight className="w-5 h-5" style={{ color: "var(--accent-2)" }} /> Asset Holdings</span>
                  <span className="hd-badge text-xs font-bold">Investment Policy</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="hd-divider-dashed">
                        <th className="pb-3">Symbol</th>
                        <th className="pb-3">Shares</th>
                        <th className="pb-3">Avg Cost</th>
                        <th className="pb-3">Market Price</th>
                        <th className="pb-3 text-right">Market Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center" style={{ opacity: 0.55 }}>No active holdings recorded.</td>
                        </tr>
                      ) : (
                        holdings.map((h, idx) => (
                          <tr key={idx} className="hd-divider-dashed">
                            <td className="py-3 font-bold">{h.symbol}</td>
                            <td className="py-3">{Number(h.quantity).toFixed(2)}</td>
                            <td className="py-3">${Number(h.averageCost).toFixed(2)}</td>
                            <td className="py-3">${Number(h.currentPrice).toFixed(2)}</td>
                            <td className="py-3 text-right font-bold" style={{ color: "var(--accent-2)" }}>
                              ${(Number(h.quantity) * Number(h.currentPrice)).toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Automated financial summary (rules-based, not AI-generated) */}
            <div className="hd-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 flex items-center justify-center"
                  style={{ background: "var(--postit)", border: "2px solid var(--border)", borderRadius: "50%" }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: "var(--accent-2)" }} />
                </div>
                <div>
                  <h3 className="text-2xl">Automated Financial Summary</h3>
                  <p className="text-xs" style={{ opacity: 0.55 }}>Compiled by MapleWealth&apos;s deterministic rules engine from your account data.</p>
                </div>
              </div>

              {report && report.financials && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-sm">
                  <div className="hd-card p-4 flex flex-col justify-between rotate-1" style={{ background: "var(--postit)", minHeight: "90px" }}>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-75">Total Income</span>
                    <div className="text-2xl font-bold mt-2">
                      ${report.financials.totalIncome.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="hd-card p-4 flex flex-col justify-between -rotate-1" style={{ background: "var(--muted)", minHeight: "90px" }}>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-75">Total Expenses</span>
                    <div className="text-2xl font-bold mt-2" style={{ color: "var(--accent-3)" }}>
                      ${report.financials.totalExpenses.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="hd-card p-4 flex flex-col justify-between rotate-1" style={{ background: "var(--postit)", minHeight: "90px" }}>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-75">Net Savings</span>
                    <div className="text-2xl font-bold mt-2" style={{ color: "var(--accent-2)" }}>
                      ${report.financials.savings.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                      <span className="text-xs font-normal ml-1">({(report.financials.savingsRate * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className="hd-card p-4 flex flex-col justify-between -rotate-1" style={{ background: "var(--muted)", minHeight: "90px" }}>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-75">Net Worth</span>
                    <div className="text-2xl font-bold mt-2">
                      ${report.financials.netWorth.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}

              <div
                className="space-y-4 text-sm leading-relaxed whitespace-pre-wrap p-6"
                style={{ border: "2px dashed var(--border)", borderRadius: "var(--radius-wobbly-sm)" }}
              >
                {report ? report.summary : "No summary generated yet."}
              </div>
            </div>
          </div>
        )}

        {activeTab === "accounts" && (
          <NetWorthTab profile={profile} goals={goals} onRefetch={fetchData} />
        )}

        {activeTab === "investments" && <InvestmentsTab />}

        {/* Trade Record Modal */}
        {showTradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="hd-card w-full max-w-md p-6 rotate-1" style={{ boxShadow: "8px 8px 0px 0px var(--border)" }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl">Record Buy/Sell Trade</h3>
                <button onClick={() => setShowTradeModal(false)} className="cursor-pointer hover:opacity-60">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordTrade} className="space-y-4 text-sm">
                <div>
                  <label className="block font-bold mb-1">Target Account</label>
                  <select
                    required
                    value={tradeForm.accountId}
                    onChange={(e) => setTradeForm({ ...tradeForm, accountId: e.target.value })}
                    className="hd-input p-2.5"
                  >
                    <option value="">Select account...</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.institution} - {a.name} (${Number(a.currentBalance).toFixed(2)})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Symbol</label>
                    <input
                      type="text"
                      required
                      value={tradeForm.symbol}
                      onChange={(e) => setTradeForm({ ...tradeForm, symbol: e.target.value.toUpperCase() })}
                      className="hd-input p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Trade Type</label>
                    <select
                      value={tradeForm.tradeType}
                      onChange={(e) => setTradeForm({ ...tradeForm, tradeType: e.target.value })}
                      className="hd-input p-2.5"
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Shares Count</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={tradeForm.quantity}
                      onChange={(e) => setTradeForm({ ...tradeForm, quantity: parseFloat(e.target.value) })}
                      className="hd-input p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Price per Share</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={tradeForm.price}
                      onChange={(e) => setTradeForm({ ...tradeForm, price: parseFloat(e.target.value) })}
                      className="hd-input p-2.5"
                    />
                  </div>
                </div>

                <button type="submit" className="hd-btn w-full py-2.5 mt-4">
                  Record and Update Portfolio
                </button>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
