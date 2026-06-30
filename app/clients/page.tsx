import { createClient, deleteClient } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { Button, Card, EmptyState, Field, GhostLink, PageHeader } from "@/components/ui";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const clients = await prisma.client.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } }
          ]
        }
      : undefined,
    include: { _count: { select: { invoices: true } } },
    orderBy: { name: "asc" }
  });

  return (
    <>
      <PageHeader title="Clients" description="Create customers and keep invoice history tied to each profile." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-4 text-base font-semibold">Create client</h2>
          <form action={createClient} className="space-y-4">
            <Field label="Name"><input name="name" required /></Field>
            <Field label="Email"><input name="email" type="email" /></Field>
            <Field label="Phone"><input name="phone" /></Field>
            <Field label="Address"><textarea name="address" rows={3} /></Field>
            <Field label="Notes"><textarea name="notes" rows={3} /></Field>
            <Button>Create client</Button>
          </form>
        </Card>
        <Card>
          <form className="mb-4 flex gap-2">
            <input name="q" placeholder="Search clients" defaultValue={query} />
            <Button>Search</Button>
          </form>
          {clients.length === 0 ? <EmptyState title="No clients yet." /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Name</th><th>Email</th><th>Invoices</th><th></th></tr></thead>
                <tbody className="divide-y divide-line">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="py-3 font-medium">{client.name}</td>
                      <td>{client.email}</td>
                      <td>{client._count.invoices}</td>
                      <td className="flex justify-end gap-3 py-3">
                        <GhostLink href={`/clients/${client.id}`}>View</GhostLink>
                        <GhostLink href={`/clients/${client.id}/edit`}>Edit</GhostLink>
                        <form action={deleteClient.bind(null, client.id)}><button className="text-sm font-semibold text-coral">Delete</button></form>
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
