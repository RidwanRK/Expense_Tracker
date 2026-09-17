import type { ExpenseCategory } from "./types";

/**
 * Deterministic color per category, applied consistently across the summary
 * card, category breakdown bars, and transaction list badges.
 */
export const CATEGORY_STYLES: Record<
  ExpenseCategory,
  { bg: string; text: string; dot: string }
> = {
  Groceries: { bg: "bg-emerald-100 dark:bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  Transport: { bg: "bg-sky-100 dark:bg-sky-500/15", text: "text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  Dining: { bg: "bg-orange-100 dark:bg-orange-500/15", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
  Bills: { bg: "bg-rose-100 dark:bg-rose-500/15", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
  Shopping: { bg: "bg-violet-100 dark:bg-violet-500/15", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  Health: { bg: "bg-teal-100 dark:bg-teal-500/15", text: "text-teal-700 dark:text-teal-300", dot: "bg-teal-500" },
  Other: { bg: "bg-slate-100 dark:bg-slate-500/15", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-500" },
};

export function categoryStyle(category: string) {
  return CATEGORY_STYLES[category as ExpenseCategory] ?? CATEGORY_STYLES.Other;
}
