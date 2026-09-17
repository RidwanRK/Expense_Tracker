export const EXPENSE_CATEGORIES = [
  "Groceries",
  "Transport",
  "Dining",
  "Bills",
  "Shopping",
  "Health",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/** Shape of a transaction document as stored in MongoDB. */
export interface TransactionDocument {
  amount: number;
  category: ExpenseCategory;
  description: string;
  /** ISO date string, YYYY-MM-DD */
  txDate: string;
  createdAt: Date;
}

/** Transaction shape as sent to/from the JSON API (ObjectId serialized to string). */
export interface Transaction {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  txDate: string;
  createdAt: string;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlySummary {
  yearMonth: string;
  totalSpent: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown[];
}
