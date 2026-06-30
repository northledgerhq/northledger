import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET() {
  const [payments, expenses] = await Promise.all([prisma.payment.findMany(), prisma.expense.findMany()]);
  const rows = new Map<string, { income: number; expenses: number }>();

  for (const payment of payments) {
    const month = format(payment.paidAt, "yyyy-MM");
    rows.set(month, rows.get(month) ?? { income: 0, expenses: 0 });
    rows.get(month)!.income += Number(payment.amount);
  }
  for (const expense of expenses) {
    const month = format(expense.date, "yyyy-MM");
    rows.set(month, rows.get(month) ?? { income: 0, expenses: 0 });
    rows.get(month)!.expenses += Number(expense.amount);
  }

  const csv = ["month,income,expenses,net_profit"]
    .concat(
      Array.from(rows.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, row]) => `${month},${row.income.toFixed(2)},${row.expenses.toFixed(2)},${(row.income - row.expenses).toFixed(2)}`)
    )
    .join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=northledger-monthly-report.csv"
    }
  });
}
