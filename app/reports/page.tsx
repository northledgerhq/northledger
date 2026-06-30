import { Card, GhostLink, PageHeader } from "@/components/ui";
import { StatCard } from "@/components/stat-card";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function ReportsPage() {
  const [settings, payments, expenses] = await Promise.all([
    prisma.setting.upsert({ where: { id: "singleton" }, update: {}, create: {} }),
    prisma.payment.findMany({ orderBy: { paidAt: "asc" } }),
    prisma.expense.findMany({ orderBy: { date: "asc" } })
  ]);
  const rows = new Map<string, { month: string; income: number; expenses: number }>();

  for (const payment of payments) {
    const month = format(payment.paidAt, "yyyy-MM");
    rows.set(month, rows.get(month) ?? { month, income: 0, expenses: 0 });
    rows.get(month)!.income += Number(payment.amount);
  }
  for (const expense of expenses) {
    const month = format(expense.date, "yyyy-MM");
    rows.set(month, rows.get(month) ?? { month, income: 0, expenses: 0 });
    rows.get(month)!.expenses += Number(expense.amount);
  }
  const reportRows = Array.from(rows.values()).sort((a, b) => b.month.localeCompare(a.month));
  const income = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const expenseTotal = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <>
      <PageHeader title="Reports" description="Monthly income, expenses, and net profit." action={<GhostLink href="/api/reports/monthly">Export CSV</GhostLink>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Income" value={money(income, settings.defaultCurrency)} />
        <StatCard label="Expenses" value={money(expenseTotal, settings.defaultCurrency)} />
        <StatCard label="Net profit" value={money(income - expenseTotal, settings.defaultCurrency)} />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Month</th><th className="text-right">Income</th><th className="text-right">Expenses</th><th className="text-right">Net profit</th></tr></thead>
            <tbody className="divide-y divide-line">
              {reportRows.map((row) => (
                <tr key={row.month}>
                  <td className="py-3 font-medium">{row.month}</td>
                  <td className="text-right">{money(row.income, settings.defaultCurrency)}</td>
                  <td className="text-right">{money(row.expenses, settings.defaultCurrency)}</td>
                  <td className="text-right font-semibold">{money(row.income - row.expenses, settings.defaultCurrency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
