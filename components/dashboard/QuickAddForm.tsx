"use client";

import { useId, useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/types";

export interface QuickAddValues {
  amount: string;
  category: ExpenseCategory;
  description: string;
  txDate: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function QuickAddForm({
  onSubmit,
  onSuccess,
}: {
  onSubmit: (values: QuickAddValues) => Promise<void>;
  onSuccess?: () => void;
}) {
  const [values, setValues] = useState<QuickAddValues>({
    amount: "",
    category: "Groceries",
    description: "",
    txDate: todayIso(),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // This form is mounted twice at once (desktop panel + mobile drawer, one
  // hidden via CSS), so ids must be unique per instance to stay valid HTML.
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
      await onSubmit(values);
      setValues({ amount: "", category: values.category, description: "", txDate: todayIso() });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log expense.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-1">
          <label htmlFor={`${uid}-amount`} className="mb-1 block text-xs font-medium text-slate-500">
            Amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              $
            </span>
            <input
              id={`${uid}-amount`}
              inputMode="decimal"
              placeholder="0.00"
              value={values.amount}
              onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
              className="w-full rounded-lg border border-[var(--color-border)] bg-transparent py-2.5 pl-7 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="col-span-1">
          <label htmlFor={`${uid}-category`} className="mb-1 block text-xs font-medium text-slate-500">
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
        <label htmlFor={`${uid}-description`} className="mb-1 block text-xs font-medium text-slate-500">
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
        <label htmlFor={`${uid}-txDate`} className="mb-1 block text-xs font-medium text-slate-500">
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
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {submitting ? "Adding…" : "Add expense"}
      </button>
    </form>
  );
}
