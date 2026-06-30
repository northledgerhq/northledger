import { Button, Card, EmptyState, Field, GhostLink, PageHeader, StatusBadge } from "@/components/ui";
import { createInvoice, deleteInvoice } from "@/lib/actions";
import { dateInput } from "@/lib/form";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const statuses = ["draft", "sent", "paid", "partially_paid", "overdue", "cancelled"];

export default async function InvoicesPage() {
  const [clients, items, invoices, settings] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.item.findMany({ orderBy: { name: "asc" } }),
    prisma.invoice.findMany({ include: { client: true, payments: true }, orderBy: { createdAt: "desc" } }),
    prisma.setting.upsert({ where: { id: "singleton" }, update: {}, create: {} })
  ]);
  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + 14);

  return (
    <>
      <PageHeader title="Invoices" description="Create invoices, add multiple items, and track balances." />
      <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
        <Card>
          <h2 className="mb-4 text-base font-semibold">Create invoice</h2>
          <form action={createInvoice} className="space-y-4">
            <Field label="Client">
              <select name="clientId" required>
                <option value="">Select client</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Issue date"><input name="issueDate" type="date" defaultValue={dateInput(today)} required /></Field>
              <Field label="Due date"><input name="dueDate" type="date" defaultValue={dateInput(due)} required /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status">
                <select name="status" defaultValue="draft">{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select>
              </Field>
              <Field label="Discount %"><input name="discountRate" type="number" step="0.01" min="0" max="100" defaultValue="0" required /></Field>
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold">Invoice items</div>
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="rounded-md border border-line p-3">
                  <div className="grid gap-3">
                    <select name={`itemId-${index}`} defaultValue="">
                      <option value="">Custom line or linked item</option>
                      {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    <input name={`description-${index}`} placeholder={index === 0 ? "Description or select an item" : "Optional description"} />
                    <div className="grid grid-cols-3 gap-2">
                      <input name={`quantity-${index}`} type="number" step="0.01" min="0" defaultValue={index === 0 ? "1" : ""} placeholder="Qty" />
                      <input name={`unitPrice-${index}`} type="number" step="0.01" min="0" placeholder="Price" />
                      <input name={`taxRate-${index}`} type="number" step="0.01" min="0" max="100" defaultValue={index === 0 ? String(settings.defaultTaxRate) : ""} placeholder="Tax %" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Field label="Notes"><textarea name="notes" rows={3} /></Field>
            <Button>Create invoice</Button>
          </form>
        </Card>
        <Card>
          {invoices.length === 0 ? <EmptyState title="No invoices yet." /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Number</th><th>Client</th><th>Due</th><th>Status</th><th className="text-right">Total</th><th></th></tr></thead>
                <tbody className="divide-y divide-line">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3 font-medium"><GhostLink href={`/invoices/${invoice.id}`}>{invoice.number}</GhostLink></td>
                      <td>{invoice.client.name}</td>
                      <td>{invoice.dueDate.toLocaleDateString()}</td>
                      <td><StatusBadge status={invoice.status} /></td>
                      <td className="text-right">{money(invoice.total, invoice.currency)}</td>
                      <td className="flex justify-end gap-3 py-3">
                        <GhostLink href={`/api/invoices/${invoice.id}/pdf`}>PDF</GhostLink>
                        <form action={deleteInvoice.bind(null, invoice.id)}><button className="text-sm font-semibold text-coral">Delete</button></form>
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
