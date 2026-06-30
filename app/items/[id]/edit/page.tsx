import { Button, Card, Field, PageHeader } from "@/components/ui";
import { updateItem } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <>
      <PageHeader title="Edit item" />
      <Card className="max-w-xl">
        <form action={updateItem.bind(null, item.id)} className="space-y-4">
          <Field label="Name"><input name="name" defaultValue={item.name} required /></Field>
          <Field label="Description"><textarea name="description" rows={3} defaultValue={item.description ?? ""} /></Field>
          <Field label="Unit price"><input name="unitPrice" type="number" step="0.01" min="0" defaultValue={String(item.unitPrice)} required /></Field>
          <Field label="Tax rate"><input name="taxRate" type="number" step="0.01" min="0" max="100" defaultValue={String(item.taxRate)} required /></Field>
          <Button>Save changes</Button>
        </form>
      </Card>
    </>
  );
}
