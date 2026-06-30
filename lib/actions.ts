"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateInvoiceTotals, nextInvoiceNumber } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import { clientSchema, expenseSchema, invoiceSchema, itemSchema, paymentSchema, settingsSchema } from "@/lib/validators";
import { optionalText, text } from "@/lib/form";

export async function createClient(formData: FormData) {
  const data = clientSchema.parse(Object.fromEntries(formData));
  await prisma.client.create({ data });
  revalidatePath("/clients");
}

export async function updateClient(id: string, formData: FormData) {
  const data = clientSchema.parse(Object.fromEntries(formData));
  await prisma.client.update({ where: { id }, data });
  revalidatePath("/clients");
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  await prisma.$transaction(async (tx) => {
    const invoices = await tx.invoice.findMany({ where: { clientId: id }, select: { id: true } });
    await tx.payment.deleteMany({ where: { invoiceId: { in: invoices.map((invoice) => invoice.id) } } });
    await tx.invoiceItem.deleteMany({ where: { invoiceId: { in: invoices.map((invoice) => invoice.id) } } });
    await tx.invoice.deleteMany({ where: { clientId: id } });
    await tx.client.delete({ where: { id } });
  });
  revalidatePath("/clients");
  revalidatePath("/invoices");
  revalidatePath("/payments");
}

export async function createItem(formData: FormData) {
  const data = itemSchema.parse(Object.fromEntries(formData));
  await prisma.item.create({ data });
  revalidatePath("/items");
}

export async function updateItem(id: string, formData: FormData) {
  const data = itemSchema.parse(Object.fromEntries(formData));
  await prisma.item.update({ where: { id }, data });
  revalidatePath("/items");
  redirect("/items");
}

export async function deleteItem(id: string) {
  await prisma.item.delete({ where: { id } });
  revalidatePath("/items");
}

export async function createInvoice(formData: FormData) {
  const rawLines = Array.from({ length: 5 }, (_, index) => index)
    .map((index) => ({
      itemId: optionalText(formData, `itemId-${index}`),
      description: text(formData, `description-${index}`),
      quantity: formData.get(`quantity-${index}`),
      unitPrice: formData.get(`unitPrice-${index}`),
      taxRate: formData.get(`taxRate-${index}`)
    }))
    .filter((line) => line.description || line.itemId);

  const settings = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {}
  });
  const selectedItems = await prisma.item.findMany({
    where: { id: { in: rawLines.map((line) => line.itemId).filter(Boolean) as string[] } }
  });
  const itemById = new Map(selectedItems.map((item) => [item.id, item]));
  const lines = rawLines.map((line) => {
    const item = line.itemId ? itemById.get(line.itemId) : null;
    return {
      itemId: line.itemId,
      description: line.description || item?.description || item?.name || "",
      quantity: line.quantity || "1",
      unitPrice: line.unitPrice || item?.unitPrice || 0,
      taxRate: line.taxRate || item?.taxRate || settings.defaultTaxRate
    };
  });
  const data = invoiceSchema.parse({
    clientId: formData.get("clientId"),
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status"),
    discountRate: formData.get("discountRate"),
    notes: formData.get("notes"),
    lines
  });
  const totals = calculateInvoiceTotals(data.lines, data.discountRate);
  const number = await nextInvoiceNumber(settings.invoicePrefix);

  const invoice = await prisma.invoice.create({
    data: {
      number,
      clientId: data.clientId,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status: data.status,
      currency: settings.defaultCurrency,
      discountRate: data.discountRate,
      notes: data.notes,
      ...totals,
      items: {
        create: data.lines.map((line) => ({
          itemId: line.itemId || undefined,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          lineTotal: line.quantity * line.unitPrice
        }))
      }
    }
  });

  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
}

export async function createPayment(formData: FormData) {
  const data = paymentSchema.parse(Object.fromEntries(formData));
  const invoiceBefore = await prisma.invoice.findUnique({ where: { id: data.invoiceId }, include: { payments: true } });
  if (!invoiceBefore) return;
  const alreadyPaid = invoiceBefore.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const balance = Number(invoiceBefore.total) - alreadyPaid;
  if (balance <= 0) return;
  if (data.amount > balance && balance > 0) {
    data.amount = balance;
  }

  await prisma.payment.create({ data });
  const invoice = await prisma.invoice.findUnique({ where: { id: data.invoiceId }, include: { payments: true } });
  if (invoice) {
    const paid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const status = paid >= Number(invoice.total) ? "paid" : paid > 0 ? "partially_paid" : invoice.status;
    await prisma.invoice.update({ where: { id: invoice.id }, data: { status } });
  }
  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${data.invoiceId}`);
}

export async function createExpense(formData: FormData) {
  const data = expenseSchema.parse(Object.fromEntries(formData));
  await prisma.expense.create({ data });
  revalidatePath("/expenses");
}

export async function updateExpense(id: string, formData: FormData) {
  const data = expenseSchema.parse(Object.fromEntries(formData));
  await prisma.expense.update({ where: { id }, data });
  revalidatePath("/expenses");
  redirect("/expenses");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
}

export async function updateSettings(formData: FormData) {
  const data = settingsSchema.parse(Object.fromEntries(formData));
  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: data,
    create: data
  });
  revalidatePath("/settings");
}
