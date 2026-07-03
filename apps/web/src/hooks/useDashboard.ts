import { useState, useEffect } from 'react';
import { FinancialProfile, Account, Goal, Holding, RuleResult, ContributionRoom, MonthlyReport, TradeFormData } from '../types/dashboard.types';
import { apiFetch, SessionExpiredError } from '../lib/api';

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [netWorth, setNetWorth] = useState<{ assets: number; debt: number; netWorth: number }>({ assets: 0, debt: 0, netWorth: 0 });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [performance, setPerformance] = useState<any>(null);
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

  const fetchData = async () => {
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
      ]);

      if (!profileRes.ok || !netWorthRes.ok || !accountsRes.ok || !goalsRes.ok) {
        throw new Error("Unable to fetch data from API. Is the NestJS backend running?");
      }

      setProfile(await profileRes.json());
      setNetWorth(await netWorthRes.json());
      setAccounts(await accountsRes.json());
      setGoals(await goalsRes.json());
      setHoldings(await holdingsRes.json());
      setPerformance(await performanceRes.json());
      setRules(await rulesRes.json());
      setRoom(await roomRes.json());
      setReport(await reportRes.json());
    } catch (err: any) {
      setError(err.message || "Failed to load financial data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      fetchData();
    } catch (err: any) {
      alert(err.message);
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
    fetchData,
    handleRecordTrade
  };
}
