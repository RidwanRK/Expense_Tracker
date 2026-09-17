import { z } from "zod";
import { EXPENSE_CATEGORIES } from "./types";

/**
 * Shared Zod schemas used by both the REST API route handlers and the MCP
 * tool definitions, so validation rules never drift between the two
 * interfaces.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "txDate must be in YYYY-MM-DD format");

export const LogExpenseSchema = z.object({
  amount: z.number().positive("amount must be a positive number"),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().min(1, "description is required").max(500),
  txDate: isoDate.optional(),
});
export type LogExpenseInput = z.infer<typeof LogExpenseSchema>;

export const GetMonthlySummarySchema = z.object({
  yearMonth: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'yearMonth must be in YYYY-MM format, e.g. "2026-09"'),
});
export type GetMonthlySummaryInput = z.infer<typeof GetMonthlySummarySchema>;

export const SearchExpensesSchema = z.object({
  keyword: z.string().max(200).optional(),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  limit: z.number().int().positive().max(100).default(10),
});
export type SearchExpensesInput = z.infer<typeof SearchExpensesSchema>;
