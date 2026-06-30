import { Card, GhostLink, PageHeader, StatusBadge } from "@/components/ui";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id }, include: { invoices: { orderBy: { createdAt: "desc" } } } });
  if (!client) notFound();

  return (
    <>
      <PageHeader title={client.name} description={client.email ?? "Client profile"} action={<GhostLink href={`/clients/${client.id}/edit`}>Edit client</GhostLink>} />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <dl className="space-y-4 text-sm">
            <div><dt className="font-semibold">Email</dt><dd className="text-slate-600">{client.email || "-"}</dd></div>
            <div><dt className="font-semibold">Phone</dt><dd className="text-slate-600">{client.phone || "-"}</dd></div>
            <div><dt className="font-semibold">Address</dt><dd className="whitespace-pre-line text-slate-600">{client.address || "-"}</dd></div>
            <div><dt className="font-semibold">Notes</dt><dd className="whitespace-pre-line text-slate-600">{client.notes || "-"}</dd></div>
          </dl>
        </Card>
        <Card>
          <h2 className="mb-4 text-base font-semibold">Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <tbody className="divide-y divide-line">
                {client.invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="py-3 font-medium"><GhostLink href={`/invoices/${invoice.id}`}>{invoice.number}</GhostLink></td>
                    <td><StatusBadge status={invoice.status} /></td>
                    <td>{invoice.dueDate.toLocaleDateString()}</td>
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
