import Dashboard from "@/components/dashboard/Dashboard";
import { getMonthlySummary, searchExpenses, todayIso } from "@/lib/expenses";

// Always hits MongoDB for fresh data — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function Home() {
  const yearMonth = todayIso().slice(0, 7);

  const [summary, transactions] = await Promise.all([
    getMonthlySummary(yearMonth),
    searchExpenses({ yearMonth, limit: 50 }),
  ]);

  return (
    <Dashboard
      initialYearMonth={yearMonth}
      initialSummary={summary}
      initialTransactions={transactions}
    />
  );
}
