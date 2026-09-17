import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMonthlySummary, logExpense, searchExpenses, todayIso } from "@/lib/expenses";
import { LogExpenseSchema } from "@/lib/schemas";

// This route talks to MongoDB on every request, so it must never be
// statically optimized/cached by Next.js.
export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  keyword: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});

/**
 * GET /api/expenses
 * Query params (all optional):
 *   - month:    "YYYY-MM" — when present, also returns a monthly summary and
 *               scopes the transaction list to that month.
 *   - category: exact category match
 *   - keyword:  case-insensitive substring match on description
 *   - limit:    max transactions to return (default 50)
 */
export async function GET(request: NextRequest) {
  const parsed = QuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { month, keyword, category, limit } = parsed.data;

  try {
    const [transactions, summary] = await Promise.all([
      searchExpenses({
        yearMonth: month,
        keyword,
        category,
        limit: limit ?? 50,
      }),
      month ? getMonthlySummary(month) : Promise.resolve(null),
    ]);

    return NextResponse.json({ transactions, summary });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expenses
 * Body: { amount: number, category: string, description: string, txDate?: "YYYY-MM-DD" }
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = LogExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid expense payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const transaction = await logExpense({
      ...parsed.data,
      txDate: parsed.data.txDate ?? todayIso(),
    });
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to log expense" },
      { status: 500 }
    );
  }
}
