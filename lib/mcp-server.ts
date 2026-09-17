import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getMonthlySummary, logExpense, searchExpenses, todayIso } from "./expenses";
import { EXPENSE_CATEGORIES } from "./types";

/**
 * Builds a fresh MCP server instance with all expense-tracker tools
 * registered. A new instance is created per request (see app/api/mcp/route.ts)
 * because the Streamable HTTP transport is stateless in this deployment —
 * cheap to construct since it holds no state of its own beyond tool
 * definitions, and it avoids cross-request bleed between concurrent callers.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "expense-tracker",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
      instructions:
        "Tools for logging and analyzing personal expenses stored in MongoDB. " +
        "Amounts are plain numbers in the user's local currency. Dates are YYYY-MM-DD.",
    }
  );

  server.registerTool(
    "log_expense",
    {
      title: "Log expense",
      description:
        "Record a new expense transaction. Use this whenever the user reports spending money.",
      inputSchema: {
        amount: z.number().positive().describe("The amount spent, as a positive number"),
        category: z
          .enum(EXPENSE_CATEGORIES)
          .describe(`One of: ${EXPENSE_CATEGORIES.join(", ")}`),
        description: z.string().min(1).max(500).describe("Short description of the expense"),
        txDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe("Transaction date as YYYY-MM-DD. Defaults to today if omitted."),
      },
    },
    async ({ amount, category, description, txDate }) => {
      const transaction = await logExpense({ amount, category, description, txDate });
      return {
        content: [
          {
            type: "text",
            text:
              `Logged $${transaction.amount.toFixed(2)} for "${transaction.description}" ` +
              `under ${transaction.category} on ${transaction.txDate} (id: ${transaction.id}).`,
          },
        ],
        structuredContent: { transaction },
      };
    }
  );

  server.registerTool(
    "get_monthly_summary",
    {
      title: "Get monthly summary",
      description:
        "Get total spend, transaction count, and category breakdown (with percentages) for a given month.",
      inputSchema: {
        yearMonth: z
          .string()
          .regex(/^\d{4}-\d{2}$/)
          .describe('Month to summarize, formatted as "YYYY-MM", e.g. "2026-09"'),
      },
    },
    async ({ yearMonth }) => {
      const summary = await getMonthlySummary(yearMonth);
      const breakdownText = summary.categoryBreakdown
        .map(
          (row) =>
            `  - ${row.category}: $${row.total.toFixed(2)} (${row.percentage.toFixed(1)}%, ${row.count} txns)`
        )
        .join("\n");

      const text =
        `Summary for ${yearMonth}: $${summary.totalSpent.toFixed(2)} total across ` +
        `${summary.transactionCount} transaction(s).` +
        (breakdownText ? `\nBy category:\n${breakdownText}` : "\nNo transactions recorded.");

      return {
        content: [{ type: "text", text }],
        structuredContent: { ...summary },
      };
    }
  );

  server.registerTool(
    "search_expenses",
    {
      title: "Search expenses",
      description:
        "Search recent expense transactions by keyword (matches description) and/or category.",
      inputSchema: {
        keyword: z.string().max(200).optional().describe("Case-insensitive text to match in the description"),
        category: z.enum(EXPENSE_CATEGORIES).optional().describe("Filter to a single category"),
        limit: z
          .number()
          .int()
          .positive()
          .max(100)
          .default(10)
          .describe("Maximum number of results to return"),
      },
    },
    async ({ keyword, category, limit }) => {
      const results = await searchExpenses({ keyword, category, limit });
      const text =
        results.length === 0
          ? "No matching expenses found."
          : results
              .map(
                (tx) =>
                  `- ${tx.txDate} · ${tx.category} · $${tx.amount.toFixed(2)} · ${tx.description} (id: ${tx.id})`
              )
              .join("\n");

      return {
        content: [{ type: "text", text }],
        structuredContent: { transactions: results },
      };
    }
  );

  return server;
}

export { todayIso };
