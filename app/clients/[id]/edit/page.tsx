import { updateClient } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { notFound } from "next/navigation";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  return (
    <>
      <PageHeader title="Edit client" />
      <Card className="max-w-xl">
        <form action={updateClient.bind(null, client.id)} className="space-y-4">
          <Field label="Name"><input name="name" defaultValue={client.name} required /></Field>
          <Field label="Email"><input name="email" type="email" defaultValue={client.email ?? ""} /></Field>
          <Field label="Phone"><input name="phone" defaultValue={client.phone ?? ""} /></Field>
          <Field label="Address"><textarea name="address" rows={3} defaultValue={client.address ?? ""} /></Field>
          <Field label="Notes"><textarea name="notes" rows={3} defaultValue={client.notes ?? ""} /></Field>
          <Button>Save changes</Button>
        </form>
      </Card>
    </>
  );
}
