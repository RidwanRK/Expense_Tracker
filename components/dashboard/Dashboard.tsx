"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MonthlySummary, Transaction } from "@/lib/types";
import Header from "./Header";
import Filters from "./Filters";
import SummaryCard from "./SummaryCard";
import CategoryBreakdown from "./CategoryBreakdown";
import TransactionList from "./TransactionList";
import MobileNav, { type MobileTab } from "./MobileNav";
import EditExpenseModal, { type EditExpenseValues } from "./EditExpenseModal";

export default function Dashboard({
  initialYearMonth,
  initialSummary,
  initialTransactions,
}: {
  initialYearMonth: string;
  initialSummary: MonthlySummary | null;
  initialTransactions: Transaction[];
}) {
  const [yearMonth, setYearMonth] = useState(initialYearMonth);
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [summary, setSummary] = useState<MonthlySummary | null>(initialSummary);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("overview");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: yearMonth });
      if (category) params.set("category", category);
      if (keyword) params.set("keyword", keyword);

      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load expenses");
      const data = await res.json();
      setSummary(data.summary);
      setTransactions(data.transactions);
    } catch {
      // Keep last-known-good state on transient fetch failures.
    } finally {
      setLoading(false);
    }
  }, [yearMonth, category, keyword]);

  // Skip the redundant fetch on first mount since server-rendered props
  // already hold the initial data for the default month.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const handle = setTimeout(refresh, keyword ? 300 : 0);
    return () => clearTimeout(handle);
  }, [refresh, keyword]);

  async function handleUpdateExpense(id: string, values: EditExpenseValues) {
    const res = await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(values.amount),
        category: values.category,
        description: values.description,
        txDate: values.txDate,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "Failed to update expense");
    }
    await refresh();
  }

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <Filters
            yearMonth={yearMonth}
            onYearMonthChange={setYearMonth}
            category={category}
            onCategoryChange={setCategory}
            keyword={keyword}
            onKeywordChange={setKeyword}
          />
        </div>

        {/* Desktop: single column. Mobile: tab-switched sections. */}
        <div className="grid grid-cols-1 gap-6">
          <div className={`space-y-6 ${mobileTab === "overview" ? "" : "hidden md:block"}`}>
            <SummaryCard summary={summary} yearMonth={yearMonth} loading={loading} />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <CategoryBreakdown summary={summary} loading={loading} />
              <div className="hidden sm:block">
                <TransactionList
                  transactions={transactions}
                  loading={loading}
                  onEdit={setEditingTransaction}
                />
              </div>
            </div>
            <div className="sm:hidden">
              {mobileTab === "overview" && (
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  loading={loading}
                  onEdit={setEditingTransaction}
                />
              )}
            </div>
          </div>

          <div className={`md:hidden ${mobileTab === "transactions" ? "" : "hidden"}`}>
            <TransactionList
              transactions={transactions}
              loading={loading}
              onEdit={setEditingTransaction}
            />
          </div>
        </div>
      </main>

      <MobileNav active={mobileTab} onChange={setMobileTab} />
      {editingTransaction && (
        <EditExpenseModal
          key={editingTransaction.id}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSubmit={handleUpdateExpense}
        />
      )}
    </div>
  );
}
