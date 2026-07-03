"use client";

import { useDashboard } from "../hooks/useDashboard";
import { Card } from "../components/Card";
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
  ArrowUpRight
} from "lucide-react";

export default function Dashboard() {
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
    fetchData,
    handleRecordTrade
  } = useDashboard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060913] text-emerald-400 font-medium">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-500 animate-pulse text-lg">Loading MapleWealth Personal OS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060913] text-rose-400 p-6">
        <div className="max-w-md w-full glass-panel p-8 text-center border-rose-500/20">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Backend Connection Failed</h2>
          <p className="text-slate-400 mb-6 text-sm">{error}</p>
          <button 
            onClick={fetchData} 
            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const netWorthGoal = goals.find((g) => g.type === "net_worth");
  const efMinGoal = goals.find((g) => g.name.includes("Minimum"));

  const progressNetWorth = netWorthGoal
    ? Math.min(100, (netWorth.netWorth / Number(netWorthGoal.targetAmount)) * 100)
    : 0;

  const efTarget = efMinGoal ? Number(efMinGoal.targetAmount) : 5000;
  const efProgress = goals.find(g => g.type === "emergency_fund")?.currentAmount || 0;
  const progressEf = Math.min(100, (efProgress / efTarget) * 100);

  return (
    <div className="min-h-screen flex bg-[#060913]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0a0f21] p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Compass className="w-8 h-8 text-emerald-500 animate-spin-slow" />
            <span className="text-xl font-bold tracking-tight text-white">
              Maple<span className="text-emerald-500">Wealth</span>
            </span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab("accounts")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "accounts"
                  ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <Wallet className="w-4 h-4" /> Net Worth
            </button>
            <button
              onClick={() => setActiveTab("investments")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "investments"
                  ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <LineChart className="w-4 h-4" /> Investments
            </button>
          </nav>
        </div>

        <div className="glass-panel p-4 border-slate-800/60">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">User Profile</div>
          <div className="font-semibold text-white">{profile?.userId ? "Master" : "Guest User"}</div>
          <div className="text-xs text-emerald-500 font-medium">Software Developer</div>
          <div className="text-xs text-slate-400 mt-1">Salary: ${profile?.annualSalary ? Number(profile.annualSalary).toLocaleString() : "0"} CAD</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
        {/* Top Header */}
        <header className="flex justify-between items-center border-b border-slate-800/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Financial Command Center</h1>
            <p className="text-slate-400 text-sm mt-1">Canadian personal wealth optimization plan tracking.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTradeModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-600/15 cursor-pointer"
            >
              Record Buy/Sell Trade
            </button>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Reusable Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Net Worth Card */}
              <Card title="Net Worth" icon={<Wallet className="w-5 h-5 text-blue-400" />}>
                <div className="text-4xl font-extrabold text-white">
                  ${netWorth.netWorth.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex justify-between">
                  <span>Assets: ${netWorth.assets.toLocaleString()}</span>
                  <span>Liabilities: ${netWorth.debt.toLocaleString()}</span>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-emerald-400">Progress to $100k Target</span>
                    <span className="text-white">{progressNetWorth.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progressNetWorth}%` }}
                    ></div>
                  </div>
                </div>
              </Card>

              {/* Emergency Buffer Card */}
              <Card title="Emergency Buffer" icon={<ShieldCheck className="w-5 h-5 text-rose-400" />} className="border-rose-500/15">
                <div className="text-4xl font-extrabold text-white">
                  ${efProgress.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-rose-400 font-medium mt-2">
                  Min Target: $5,000 | Ideal: $8,000
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-rose-400">Buffer Strength</span>
                    <span className="text-white">{progressEf.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progressEf}%` }}
                    ></div>
                  </div>
                </div>
              </Card>

              {/* TFSA Status Card */}
              <Card title="TFSA Room Remaining" icon={<LineChart className="w-5 h-5 text-emerald-400" />} className="border-blue-500/15">
                <div className="text-4xl font-extrabold text-white">
                  ${room ? room.tfsa.roomRemaining.toLocaleString("en-CA", { minimumFractionDigits: 2 }) : "0.00"}
                </div>
                <div className="text-xs text-blue-400 font-medium mt-2 flex justify-between">
                  <span>Yearly limit: $7,000</span>
                  <span>Auto-Deposit: $50/mo</span>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs border-t border-slate-800/60 pt-3">
                  <span className="text-slate-400">Total invested this year</span>
                  <span className="text-blue-400 font-bold">${room ? room.tfsa.contributed.toLocaleString() : "0"}</span>
                </div>
              </Card>
            </div>

            {/* Warnings and Holdings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Warnings and Cautions Feed */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" /> Planning Engine Guidance & Warnings
                </h3>
                <div className="space-y-4">
                  {rules.filter(r => r.status !== 'pass').length === 0 ? (
                    <div className="p-4 bg-emerald-500/5 text-emerald-400 text-sm rounded-lg border border-emerald-500/10 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> All checks passed! Your assets fully follow the Canadian Master Plan strategy.
                    </div>
                  ) : (
                    rules.filter(r => r.status !== 'pass').map((rule, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-lg border text-sm flex gap-3 ${
                          rule.severity === 'high' 
                            ? 'bg-rose-500/5 border-rose-500/20 text-rose-300' 
                            : 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                          <div className="font-bold text-white mb-0.5">{rule.source_rule}</div>
                          <p className="mb-2 text-slate-300 text-xs">{rule.message}</p>
                          <div className="text-xs italic bg-[#060913]/60 p-2.5 rounded-lg border border-slate-800/40">
                            Action: {rule.recommended_action}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Holdings Section */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-emerald-400" /> Asset Holdings</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold">XEQT Focused</span>
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800">
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
                          <td colSpan={5} className="py-4 text-center text-slate-500">No active holdings recorded.</td>
                        </tr>
                      ) : (
                        holdings.map((h, idx) => (
                          <tr key={idx} className="border-b border-slate-800/40 text-slate-300 hover:text-white">
                            <td className="py-3 font-semibold text-white">{h.symbol}</td>
                            <td className="py-3">{Number(h.quantity).toFixed(2)}</td>
                            <td className="py-3">${Number(h.averageCost).toFixed(2)}</td>
                            <td className="py-3">${Number(h.currentPrice).toFixed(2)}</td>
                            <td className="py-3 text-right font-bold text-emerald-400">
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

            {/* AI Advisor report */}
            <div className="glass-panel p-8 border-emerald-500/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Financial Advisor Insights</h3>
                  <p className="text-xs text-slate-500">Compiled by MapleWealth deterministic summary generator.</p>
                </div>
              </div>

              <div className="text-slate-300 space-y-4 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-[#0c1122] p-6 rounded-xl border border-slate-850">
                {report ? report.aiInsights : "No advisor insights generated yet."}
              </div>
            </div>
          </div>
        )}

        {/* Trade Record Modal */}
        {showTradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-md p-6 bg-[#0a0f21] border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Record Buy/Sell Trade</h3>
                <button 
                  onClick={() => setShowTradeModal(false)}
                  className="text-slate-500 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordTrade} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Account</label>
                  <select
                    required
                    value={tradeForm.accountId}
                    onChange={(e) => setTradeForm({ ...tradeForm, accountId: e.target.value })}
                    className="w-full bg-[#11162d] border border-slate-800 text-white p-2.5 rounded-lg focus:border-emerald-500 outline-none"
                  >
                    <option value="">Select account...</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.institution} - {a.name} (${Number(a.currentBalance).toFixed(2)})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Symbol</label>
                    <input
                      type="text"
                      required
                      value={tradeForm.symbol}
                      onChange={(e) => setTradeForm({ ...tradeForm, symbol: e.target.value.toUpperCase() })}
                      className="w-full bg-[#11162d] border border-slate-800 text-white p-2.5 rounded-lg focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Trade Type</label>
                    <select
                      value={tradeForm.tradeType}
                      onChange={(e) => setTradeForm({ ...tradeForm, tradeType: e.target.value })}
                      className="w-full bg-[#11162d] border border-slate-800 text-white p-2.5 rounded-lg focus:border-emerald-500 outline-none"
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Shares Count</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={tradeForm.quantity}
                      onChange={(e) => setTradeForm({ ...tradeForm, quantity: parseFloat(e.target.value) })}
                      className="w-full bg-[#11162d] border border-slate-800 text-white p-2.5 rounded-lg focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Price per Share</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={tradeForm.price}
                      onChange={(e) => setTradeForm({ ...tradeForm, price: parseFloat(e.target.value) })}
                      className="w-full bg-[#11162d] border border-slate-800 text-white p-2.5 rounded-lg focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all mt-4 cursor-pointer"
                >
                  Record and Update Portfolio
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
