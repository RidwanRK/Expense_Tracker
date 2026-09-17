import { Pencil, Receipt } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { categoryStyle } from "@/lib/category-styles";
import { formatCurrency } from "./SummaryCard";

function formatDate(iso: string): string {
  const parts = iso.split("-").map(Number);
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function TransactionList({
  transactions,
  loading,
  onEdit,
}: {
  transactions: Transaction[];
  loading: boolean;
  onEdit?: (transaction: Transaction) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Receipt className="h-5 w-5 text-indigo-500" aria-hidden />
        <h3 className="text-base font-semibold">Recent transactions</h3>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-slate-500">Loading…</p>
      ) : transactions.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No transactions match your filters.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {transactions.map((tx) => {
            const style = categoryStyle(tx.category);
            return (
              <li key={tx.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tx.description}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                    >
                      {tx.category}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(tx.txDate)}</span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatCurrency(tx.amount)}
                </span>
                {onEdit && (
                  <button
                    onClick={() => onEdit(tx)}
                    aria-label={`Edit ${tx.description}`}
                    className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
