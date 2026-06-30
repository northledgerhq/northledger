import { Button, Card, Field, PageHeader } from "@/components/ui";
import { updateExpense } from "@/lib/actions";
import { dateInput } from "@/lib/form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) notFound();

  return (
    <>
      <PageHeader title="Edit expense" />
      <Card className="max-w-xl">
        <form action={updateExpense.bind(null, expense.id)} className="space-y-4">
          <Field label="Category"><input name="category" defaultValue={expense.category} required /></Field>
          <Field label="Amount"><input name="amount" type="number" min="0" step="0.01" defaultValue={String(expense.amount)} required /></Field>
          <Field label="Date"><input name="date" type="date" defaultValue={dateInput(expense.date)} required /></Field>
          <Field label="Vendor"><input name="vendor" defaultValue={expense.vendor ?? ""} /></Field>
          <Field label="Notes"><textarea name="notes" rows={3} defaultValue={expense.notes ?? ""} /></Field>
          <Button>Save changes</Button>
        </form>
      </Card>
    </>
  );
}
