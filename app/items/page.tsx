import { Button, Card, EmptyState, Field, GhostLink, PageHeader } from "@/components/ui";
import { createItem, deleteItem } from "@/lib/actions";
import { money, percent } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function ItemsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const [items, settings] = await Promise.all([
    prisma.item.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } }
            ]
          }
        : undefined,
      orderBy: { name: "asc" }
    }),
    prisma.setting.upsert({ where: { id: "singleton" }, update: {}, create: {} })
  ]);

  return (
    <>
      <PageHeader title="Products / Services" description="Reusable billable items for invoice lines." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-4 text-base font-semibold">Create item</h2>
          <form action={createItem} className="space-y-4">
            <Field label="Name"><input name="name" required /></Field>
            <Field label="Description"><textarea name="description" rows={3} /></Field>
            <Field label="Unit price"><input name="unitPrice" type="number" step="0.01" min="0" required /></Field>
            <Field label="Tax rate"><input name="taxRate" type="number" step="0.01" min="0" max="100" defaultValue={String(settings.defaultTaxRate)} required /></Field>
            <Button>Create item</Button>
          </form>
        </Card>
        <Card>
          <form className="mb-4 flex gap-2">
            <input name="q" placeholder="Search products or services" defaultValue={query} />
            <Button>Search</Button>
          </form>
          {items.length === 0 ? <EmptyState title="No items yet." /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Name</th><th>Price</th><th>Tax</th><th></th></tr></thead>
                <tbody className="divide-y divide-line">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3"><div className="font-medium">{item.name}</div><div className="text-xs text-slate-500">{item.description}</div></td>
                      <td>{money(item.unitPrice, settings.defaultCurrency)}</td>
                      <td>{percent(item.taxRate)}</td>
                      <td className="flex justify-end gap-3 py-3">
                        <GhostLink href={`/items/${item.id}/edit`}>Edit</GhostLink>
                        <form action={deleteItem.bind(null, item.id)}><button className="text-sm font-semibold text-coral">Delete</button></form>
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
