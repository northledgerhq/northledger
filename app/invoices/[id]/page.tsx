import { Button, Card, Field, GhostLink, PageHeader, StatusBadge } from "@/components/ui";
import { createPayment } from "@/lib/actions";
import { dateInput } from "@/lib/form";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const methods = ["cash", "bank_transfer", "card", "paypal", "other"];

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { client: true, items: true, payments: true } });
  if (!invoice) notFound();
  const paid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const balance = Math.max(Number(invoice.total) - paid, 0);

  return (
    <>
      <PageHeader title={`Invoice ${invoice.number}`} description={invoice.client.name} action={<GhostLink href={`/api/invoices/${invoice.id}/pdf`}>Download PDF</GhostLink>} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <StatusBadge status={invoice.status} />
            <div className="text-sm text-slate-500">Issued {invoice.issueDate.toLocaleDateString()} · Due {invoice.dueDate.toLocaleDateString()}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Description</th><th className="text-right">Qty</th><th className="text-right">Price</th><th className="text-right">Tax</th><th className="text-right">Line</th></tr></thead>
              <tbody className="divide-y divide-line">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">{item.description}</td>
                    <td className="text-right">{String(item.quantity)}</td>
                    <td className="text-right">{money(item.unitPrice, invoice.currency)}</td>
                    <td className="text-right">{String(item.taxRate)}%</td>
                    <td className="text-right">{money(item.lineTotal, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(invoice.subtotal, invoice.currency)}</dd></div>
            <div className="flex justify-between"><dt>Discount</dt><dd>{money(invoice.discountTotal, invoice.currency)}</dd></div>
            <div className="flex justify-between"><dt>Tax</dt><dd>{money(invoice.taxTotal, invoice.currency)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Total</dt><dd>{money(invoice.total, invoice.currency)}</dd></div>
            <div className="flex justify-between"><dt>Paid</dt><dd>{money(paid, invoice.currency)}</dd></div>
            <div className="flex justify-between"><dt>Balance</dt><dd>{money(balance, invoice.currency)}</dd></div>
          </dl>
          {balance > 0 ? (
            <form action={createPayment} className="mt-6 space-y-3 border-t border-line pt-5">
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <h2 className="text-sm font-semibold">Add payment</h2>
              <Field label="Amount"><input name="amount" type="number" step="0.01" min="0.01" max={balance} defaultValue={balance.toFixed(2)} required /></Field>
              <Field label="Method"><select name="method">{methods.map((method) => <option key={method} value={method}>{method.replace("_", " ")}</option>)}</select></Field>
              <Field label="Paid at"><input name="paidAt" type="date" defaultValue={dateInput(new Date())} required /></Field>
              <Field label="Reference"><input name="reference" /></Field>
              <Button>Add payment</Button>
            </form>
          ) : null}
          <h2 className="mb-3 mt-6 text-sm font-semibold">Payments</h2>
          <div className="space-y-2 text-sm">
            {invoice.payments.map((payment) => (
              <div key={payment.id} className="flex justify-between rounded-md bg-paper p-3">
                <span>{payment.method.replace("_", " ")} · {payment.paidAt.toLocaleDateString()}</span>
                <span>{money(payment.amount, invoice.currency)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
