import { PieChart } from "lucide-react";
import type { MonthlySummary } from "@/lib/types";
import { categoryStyle } from "@/lib/category-styles";
import { formatCurrency } from "./SummaryCard";

export default function CategoryBreakdown({
  summary,
  loading,
}: {
  summary: MonthlySummary | null;
  loading: boolean;
}) {
  const rows = summary?.categoryBreakdown ?? [];

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <PieChart className="h-5 w-5 text-indigo-500" aria-hidden />
        <h3 className="text-base font-semibold">Category breakdown</h3>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">No expenses this month yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const style = categoryStyle(row.category);
            return (
              <li key={row.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} aria-hidden />
                    {row.category}
                  </span>
                  <span className="text-slate-500">
                    {formatCurrency(row.total)}{" "}
                    <span className="text-slate-400">({row.percentage.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${style.dot}`}
                    style={{ width: `${Math.max(row.percentage, 2)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
