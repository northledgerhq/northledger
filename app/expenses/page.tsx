import { Button, Card, EmptyState, Field, GhostLink, PageHeader } from "@/components/ui";
import { createExpense, deleteExpense } from "@/lib/actions";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function ExpensesPage() {
  const [expenses, settings] = await Promise.all([
    prisma.expense.findMany({ orderBy: { date: "desc" } }),
    prisma.setting.upsert({ where: { id: "singleton" }, update: {}, create: {} })
  ]);
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const byCategory = expenses.reduce<Record<string, number>>((rows, expense) => {
    rows[expense.category] = (rows[expense.category] ?? 0) + Number(expense.amount);
    return rows;
  }, {});

  return (
    <>
      <PageHeader title="Expenses" description="Track operating costs by category, vendor, and date." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-4 text-base font-semibold">Add expense</h2>
          <form action={createExpense} className="space-y-4">
            <Field label="Category"><input name="category" required /></Field>
            <Field label="Amount"><input name="amount" type="number" min="0" step="0.01" required /></Field>
            <Field label="Date"><input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></Field>
            <Field label="Vendor"><input name="vendor" /></Field>
            <Field label="Notes"><textarea name="notes" rows={3} /></Field>
            <Button>Add expense</Button>
          </form>
        </Card>
        <Card>
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-paper p-3">
              <div className="text-xs uppercase text-slate-500">Total expenses</div>
              <div className="mt-1 text-lg font-semibold">{money(total, settings.defaultCurrency)}</div>
            </div>
            <div className="rounded-md bg-paper p-3">
              <div className="text-xs uppercase text-slate-500">Top category</div>
              <div className="mt-1 text-lg font-semibold">{Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None"}</div>
            </div>
          </div>
          {expenses.length === 0 ? <EmptyState title="No expenses yet." /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Date</th><th>Category</th><th>Vendor</th><th className="text-right">Amount</th><th></th></tr></thead>
                <tbody className="divide-y divide-line">
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="py-3">{expense.date.toLocaleDateString()}</td>
                      <td className="font-medium">{expense.category}</td>
                      <td>{expense.vendor}</td>
                      <td className="text-right">{money(expense.amount, settings.defaultCurrency)}</td>
                      <td className="flex justify-end gap-3 py-3">
                        <GhostLink href={`/expenses/${expense.id}/edit`}>Edit</GhostLink>
                        <form action={deleteExpense.bind(null, expense.id)}><button className="text-sm font-semibold text-coral">Delete</button></form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
