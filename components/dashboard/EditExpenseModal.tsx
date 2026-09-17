"use client";

import { useId, useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { EXPENSE_CATEGORIES, type ExpenseCategory, type Transaction } from "@/lib/types";

export interface EditExpenseValues {
  amount: string;
  category: ExpenseCategory;
  description: string;
  txDate: string;
}

/**
 * The parent gives this a `key={transaction.id}` (see Dashboard.tsx), so a
 * new transaction remounts it fresh — no effect needed to resync state
 * when the edited transaction changes.
 */
export default function EditExpenseModal({
  transaction,
  onClose,
  onSubmit,
}: {
  transaction: Transaction;
  onClose: () => void;
  onSubmit: (id: string, values: EditExpenseValues) => Promise<void>;
}) {
  const [values, setValues] = useState<EditExpenseValues>({
    amount: String(transaction.amount),
    category: transaction.category,
    description: transaction.description,
    txDate: transaction.txDate,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uid = useId();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const amountNumber = Number(values.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (!values.description.trim()) {
      setError("Description is required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(transaction.id, values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update expense.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Edit expense</h3>
          <button
            onClick={onClose}
            aria-label="Close edit expense"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-1">
              <label
                htmlFor={`${uid}-amount`}
                className="mb-1 block text-xs font-medium text-slate-500"
              >
                Amount
              </label>
              <input
                id={`${uid}-amount`}
                inputMode="decimal"
                placeholder="0.00"
                value={values.amount}
                onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
                className="w-full rounded-lg border border-[var(--color-border)] bg-transparent py-2.5 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-1">
              <label
                htmlFor={`${uid}-category`}
                className="mb-1 block text-xs font-medium text-slate-500"
              >
                Category
              </label>
              <select
                id={`${uid}-category`}
                value={values.category}
                onChange={(e) =>
                  setValues((v) => ({ ...v, category: e.target.value as ExpenseCategory }))
                }
                className="w-full rounded-lg border border-[var(--color-border)] bg-transparent py-2.5 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor={`${uid}-description`}
              className="mb-1 block text-xs font-medium text-slate-500"
            >
              Description
            </label>
            <input
              id={`${uid}-description`}
              placeholder="e.g. Weekly groceries"
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              className="w-full rounded-lg border border-[var(--color-border)] bg-transparent py-2.5 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor={`${uid}-txDate`}
              className="mb-1 block text-xs font-medium text-slate-500"
            >
              Date
            </label>
            <input
              id={`${uid}-txDate`}
              type="date"
              value={values.txDate}
              onChange={(e) => setValues((v) => ({ ...v, txDate: e.target.value }))}
              className="w-full rounded-lg border border-[var(--color-border)] bg-transparent py-2.5 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
