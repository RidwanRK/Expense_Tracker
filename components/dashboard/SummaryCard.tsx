import { TrendingUp, Receipt } from "lucide-react";
import type { MonthlySummary } from "@/lib/types";

function formatCurrency(value: number): string {
  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${amount} Taka`;
}

function formatMonthLabel(yearMonth: string): string {
  const parts = yearMonth.split("-").map(Number);
  const year = parts[0] ?? new Date().getUTCFullYear();
  const month = parts[1] ?? 1;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function SummaryCard({
  summary,
  yearMonth,
  loading,
}: {
  summary: MonthlySummary | null;
  yearMonth: string;
  loading: boolean;
}) {
  const total = summary?.totalSpent ?? 0;
  const count = summary?.transactionCount ?? 0;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-sm sm:p-6">
      <p className="text-sm font-medium text-indigo-100">{formatMonthLabel(yearMonth)} spending</p>
      <div className="mt-2 flex items-baseline gap-2">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {loading ? "…" : formatCurrency(total)}
        </h2>
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm text-indigo-100">
        <span className="inline-flex items-center gap-1.5">
          <Receipt className="h-4 w-4" aria-hidden />
          {count} transaction{count === 1 ? "" : "s"}
        </span>
        {summary && summary.categoryBreakdown[0] && (
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" aria-hidden />
            Top: {summary.categoryBreakdown[0].category}
          </span>
        )}
      </div>
    </div>
  );
}

export { formatCurrency, formatMonthLabel };
