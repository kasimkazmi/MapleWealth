import { useState, useEffect, useCallback } from 'react';
import { FinancialProfile, Account, Goal, Holding, PerformanceMetrics, RuleResult, ContributionRoom, MonthlyReport, TradeFormData } from '../types/dashboard.types';
import { apiFetch } from '../lib/api';

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [netWorth, setNetWorth] = useState<{ assets: number; debt: number; netWorth: number }>({ assets: 0, debt: 0, netWorth: 0 });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [rules, setRules] = useState<RuleResult[]>([]);
  const [room, setRoom] = useState<ContributionRoom | null>(null);
  const [report, setReport] = useState<MonthlyReport | null>(null);

  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeForm, setTradeForm] = useState<TradeFormData>({
    accountId: "",
    symbol: "XEQT",
    name: "iShares Core Equity ETF Portfolio",
    tradeType: "BUY",
    quantity: 1,
    price: 28.57,
    fees: 0,
    date: new Date().toISOString().slice(0, 10),
  });

  const [activeTab, setActiveTab] = useState("dashboard");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        profileRes,
        netWorthRes,
        accountsRes,
        goalsRes,
        holdingsRes,
        performanceRes,
        rulesRes,
        roomRes,
        reportRes,
        subRes,
      ] = await Promise.all([
        apiFetch(`/profile`),
        apiFetch(`/accounts/net-worth`),
        apiFetch(`/accounts`),
        apiFetch(`/goals`),
        apiFetch(`/investments/holdings`),
        apiFetch(`/investments/performance`),
        apiFetch(`/rules/evaluate`),
        apiFetch(`/registered-accounts/room`),
        apiFetch(`/reports/monthly`),
        apiFetch(`/billing/subscription`),
      ]);

      if (!netWorthRes.ok || !accountsRes.ok || !goalsRes.ok) {
        throw new Error("Unable to fetch data from the API. Please try again.");
      }

      // A 404 here just means the user hasn't set up their financial profile
      // yet — not an error condition. FinancialProfileForm handles a null profile.
      setProfile(profileRes.ok ? await profileRes.json() : null);
      setNetWorth(await netWorthRes.json());
      setAccounts(await accountsRes.json());
      setGoals(await goalsRes.json());
      setHoldings(await holdingsRes.json());
      setPerformance(await performanceRes.json());
      setRules(await rulesRes.json());
      setRoom(await roomRes.json());
      setReport(await reportRes.json());
      setIsPremium(subRes.ok ? (await subRes.json()).isPremium : false);
      
      setLoading(false);
    } catch (err) {
      if (err instanceof Error && err.name === 'SessionExpiredError') {
        // Allow the apiFetch redirection to happen without flashing an error state
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load financial data.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Standard fetch-on-mount: fetchData sets loading/error state before its first
    // await, which this rule flags even for the canonical React data-fetching pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  const handleRecordTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/investments/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to record trade");
      }

      setShowTradeModal(false);
      void fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to record trade");
    }
  };

  return {
    loading,
    error,
    profile,
    netWorth,
    accounts,
    goals,
    holdings,
    performance,
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
    setIsPremium,
    fetchData,
    handleRecordTrade
  };
}
