import { NextRequest, NextResponse } from "next/server";
import { updateExpense } from "@/lib/expenses";
import { LogExpenseSchema } from "@/lib/schemas";

// This route talks to MongoDB on every request, so it must never be
// statically optimized/cached by Next.js.
export const dynamic = "force-dynamic";

/**
 * PATCH /api/expenses/:id
 * Body: { amount: number, category: string, description: string, txDate?: "YYYY-MM-DD" }
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
  if (!parsed.data.txDate) {
    return NextResponse.json(
      { error: "Invalid expense payload", details: { fieldErrors: { txDate: ["txDate is required"] } } },
      { status: 400 }
    );
  }

  try {
    const transaction = await updateExpense(id, { ...parsed.data, txDate: parsed.data.txDate });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update expense" },
      { status: 500 }
    );
  }
}
