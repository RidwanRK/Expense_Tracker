import { ObjectId } from "mongodb";
import { getDb, TRANSACTIONS_COLLECTION } from "./mongodb";
import type {
  CategoryBreakdown,
  ExpenseCategory,
  MonthlySummary,
  Transaction,
  TransactionDocument,
} from "./types";

/** Returns today's date as an ISO YYYY-MM-DD string in the server's local time. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function toTransaction(doc: TransactionDocument & { _id: ObjectId }): Transaction {
  return {
    id: doc._id.toString(),
    amount: doc.amount,
    category: doc.category,
    description: doc.description,
    txDate: doc.txDate,
    createdAt: doc.createdAt.toISOString(),
  };
}

export interface LogExpenseInput {
  amount: number;
  category: ExpenseCategory;
  description: string;
  txDate?: string;
}

/** Inserts a new transaction and returns its serialized form. */
export async function logExpense(input: LogExpenseInput): Promise<Transaction> {
  const db = await getDb();
  const doc: TransactionDocument = {
    amount: input.amount,
    category: input.category,
    description: input.description,
    txDate: input.txDate ?? todayIso(),
    createdAt: new Date(),
  };
  const result = await db
    .collection<TransactionDocument>(TRANSACTIONS_COLLECTION)
    .insertOne(doc);
  return toTransaction({ ...doc, _id: result.insertedId });
}

/** Fetches the most recent transactions, newest first. */
export async function listRecentExpenses(limit = 20): Promise<Transaction[]> {
  const db = await getDb();
  const docs = await db
    .collection<TransactionDocument>(TRANSACTIONS_COLLECTION)
    .find({})
    .sort({ txDate: -1, createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((doc) => toTransaction(doc as TransactionDocument & { _id: ObjectId }));
}

export interface SearchExpensesInput {
  keyword?: string;
  category?: string;
  limit?: number;
  /** Optional "YYYY-MM" filter to scope results to a single month. */
  yearMonth?: string;
}

/** Searches transactions by free-text keyword (description), category, and/or month. */
export async function searchExpenses(input: SearchExpensesInput): Promise<Transaction[]> {
  const db = await getDb();
  const filter: Record<string, unknown> = {};

  if (input.category) {
    filter.category = input.category;
  }
  if (input.keyword) {
    filter.description = { $regex: escapeRegex(input.keyword), $options: "i" };
  }
  if (input.yearMonth) {
    const { start, end } = monthRange(input.yearMonth);
    filter.txDate = { $gte: start, $lt: end };
  }

  const docs = await db
    .collection<TransactionDocument>(TRANSACTIONS_COLLECTION)
    .find(filter)
    .sort({ txDate: -1, createdAt: -1 })
    .limit(input.limit ?? 10)
    .toArray();
  return docs.map((doc) => toTransaction(doc as TransactionDocument & { _id: ObjectId }));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Validates a "YYYY-MM" string and returns its inclusive [start, end) day range. */
export function monthRange(yearMonth: string): { start: string; end: string } {
  if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
    throw new Error('yearMonth must be in "YYYY-MM" format, e.g. "2026-09"');
  }
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (month < 1 || month > 12) {
    throw new Error("yearMonth month must be between 01 and 12");
  }
  const start = `${yearMonth}-01`;
  const nextMonthDate = new Date(Date.UTC(year, month, 1));
  const end = nextMonthDate.toISOString().slice(0, 10);
  return { start, end };
}

/** Aggregates total spend, transaction count, and category breakdown for a given month. */
export async function getMonthlySummary(yearMonth: string): Promise<MonthlySummary> {
  const { start, end } = monthRange(yearMonth);
  const db = await getDb();

  const results = await db
    .collection<TransactionDocument>(TRANSACTIONS_COLLECTION)
    .aggregate<{ _id: string; total: number; count: number }>([
      { $match: { txDate: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ])
    .toArray();

  const totalSpent = results.reduce((sum, row) => sum + row.total, 0);
  const transactionCount = results.reduce((sum, row) => sum + row.count, 0);

  const categoryBreakdown: CategoryBreakdown[] = results.map((row) => ({
    category: row._id,
    total: round2(row.total),
    count: row.count,
    percentage: totalSpent > 0 ? round2((row.total / totalSpent) * 100) : 0,
  }));

  return {
    yearMonth,
    totalSpent: round2(totalSpent),
    transactionCount,
    categoryBreakdown,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
