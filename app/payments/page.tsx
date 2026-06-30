import { Button, Card, EmptyState, Field, GhostLink, PageHeader } from "@/components/ui";
import { createPayment } from "@/lib/actions";
import { dateInput } from "@/lib/form";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const methods = ["cash", "bank_transfer", "card", "paypal", "other"];

export default async function PaymentsPage() {
  const invoices = await prisma.invoice.findMany({ include: { client: true, payments: true }, orderBy: { createdAt: "desc" } });
  const payments = await prisma.payment.findMany({ include: { invoice: { include: { client: true } } }, orderBy: { paidAt: "desc" } });

  return (
    <>
      <PageHeader title="Payments" description="Record full or partial payments against invoices." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-4 text-base font-semibold">Add payment</h2>
          <form action={createPayment} className="space-y-4">
            <Field label="Invoice">
              <select name="invoiceId" required>
                <option value="">Select invoice</option>
                {invoices.map((invoice) => {
                  const paid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
                  const balance = Math.max(Number(invoice.total) - paid, 0);
                  return <option key={invoice.id} value={invoice.id}>{invoice.number} · {invoice.client.name} · balance {money(balance, invoice.currency)}</option>;
                })}
              </select>
            </Field>
            <Field label="Amount"><input name="amount" type="number" step="0.01" min="0" required /></Field>
            <Field label="Method"><select name="method">{methods.map((method) => <option key={method} value={method}>{method.replace("_", " ")}</option>)}</select></Field>
            <Field label="Paid at"><input name="paidAt" type="date" defaultValue={dateInput(new Date())} required /></Field>
            <Field label="Reference"><input name="reference" /></Field>
            <Field label="Notes"><textarea name="notes" rows={3} /></Field>
            <Button>Add payment</Button>
          </form>
        </Card>
        <Card>
          {payments.length === 0 ? <EmptyState title="No payments yet." /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Date</th><th>Invoice</th><th>Method</th><th className="text-right">Amount</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-3">{payment.paidAt.toLocaleDateString()}</td>
                      <td><GhostLink href={`/invoices/${payment.invoiceId}`}>{payment.invoice.number}</GhostLink> · {payment.invoice.client.name}</td>
                      <td className="capitalize">{payment.method.replace("_", " ")}</td>
                      <td className="text-right">{money(payment.amount, payment.invoice.currency)}</td>
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
