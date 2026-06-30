import { prisma } from "@/lib/prisma";

export type InvoiceLineInput = {
  itemId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export function calculateInvoiceTotals(lines: InvoiceLineInput[], discountRate: number) {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const discountTotal = subtotal * (discountRate / 100);
  const taxableBase = subtotal - discountTotal;
  const taxTotal = lines.reduce((sum, line) => {
    const lineSubtotal = line.quantity * line.unitPrice;
    const discountedLine = subtotal > 0 ? lineSubtotal - discountTotal * (lineSubtotal / subtotal) : 0;
    return sum + discountedLine * (line.taxRate / 100);
  }, 0);

  return {
    subtotal: roundMoney(subtotal),
    discountTotal: roundMoney(discountTotal),
    taxTotal: roundMoney(taxTotal),
    total: roundMoney(taxableBase + taxTotal)
  };
}

export async function nextInvoiceNumber(prefix: string) {
  const latest = await prisma.invoice.findFirst({
    where: { number: { startsWith: `${prefix}-` } },
    orderBy: { createdAt: "desc" }
  });

  const latestNumber = latest?.number.split("-").at(-1);
  const sequence = latestNumber && !Number.isNaN(Number(latestNumber)) ? Number(latestNumber) + 1 : 1;
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
