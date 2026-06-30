import { StatCard } from "@/components/stat-card";
import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [settings, invoices, expenses, clients] = await Promise.all([
    prisma.setting.upsert({ where: { id: "singleton" }, update: {}, create: {} }),
    prisma.invoice.findMany({ include: { client: true, payments: true }, orderBy: { dueDate: "asc" } }),
    prisma.expense.findMany(),
    prisma.client.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { _count: { select: { invoices: true } } } })
  ]);

  const paidIncome = invoices.reduce((sum, invoice) => sum + invoice.payments.reduce((inner, payment) => inner + Number(payment.amount), 0), 0);
  const invoiceTotal = invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const dueTotal = invoices.reduce((sum, invoice) => {
    const paid = invoice.payments.reduce((inner, payment) => inner + Number(payment.amount), 0);
    return sum + Math.max(Number(invoice.total) - paid, 0);
  }, 0);
  const recentInvoices = [...invoices].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 6);

  return (
    <>
      <PageHeader title="Dashboard" description="A quick view of cash flow, invoice status, and recent receivables." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total invoices" value={money(invoiceTotal, settings.defaultCurrency)} detail={`${invoices.length} invoices issued`} />
        <StatCard label="Paid" value={money(paidIncome, settings.defaultCurrency)} detail="Recorded payments" />
        <StatCard label="Outstanding" value={money(dueTotal, settings.defaultCurrency)} detail="Open balances" />
        <StatCard label="Expenses" value={money(totalExpenses, settings.defaultCurrency)} detail="All recorded expenses" />
        <StatCard label="Estimated profit" value={money(paidIncome - totalExpenses, settings.defaultCurrency)} detail="Paid income less expenses" />
        <StatCard label="Clients" value={String(clients.length)} detail="Recent client activity below" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h2 className="mb-4 text-base font-semibold">Latest clients</h2>
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between rounded-md bg-paper p-3 text-sm">
                <div>
                  <div className="font-medium">{client.name}</div>
                  <div className="text-xs text-slate-500">{client.email || "No email"}</div>
                </div>
                <div className="text-xs font-semibold text-slate-500">{client._count.invoices} invoices</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-base font-semibold">Latest invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Number</th><th>Client</th><th>Due</th><th>Status</th><th className="text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-line">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="py-3 font-medium">{invoice.number}</td>
                    <td>{invoice.client.name}</td>
                    <td>{invoice.dueDate.toLocaleDateString()}</td>
                    <td><StatusBadge status={invoice.status} /></td>
                    <td className="text-right">{money(invoice.total, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
