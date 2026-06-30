import { prisma } from "@/lib/prisma";
import { money } from "@/lib/money";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [settings, invoice] = await Promise.all([
    prisma.setting.upsert({ where: { id: "singleton" }, update: {}, create: {} }),
    prisma.invoice.findUnique({ where: { id }, include: { client: true, items: true, payments: true } })
  ]);

  if (!invoice) {
    return new Response("Invoice not found", { status: 404 });
  }

  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  doc.rect(0, 0, doc.page.width, 110).fill("#17211f");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(24).text("NorthLedger", 48, 34);
  doc.font("Helvetica").fontSize(10).fillColor("#d6efe4").text(settings.companyName, 48, 66);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text(`Invoice ${invoice.number}`, 350, 34, { align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor("#d6efe4").text(invoice.status.replace("_", " ").toUpperCase(), 350, 62, { align: "right" });

  doc.fillColor("#17211f").font("Helvetica-Bold").fontSize(11).text("From", 48, 145);
  doc.font("Helvetica").fontSize(10).fillColor("#475569").text(settings.companyName, 48, 164).text(settings.address ?? "").text(settings.email ?? "").text(settings.phone ?? "");

  doc.fillColor("#17211f").font("Helvetica-Bold").fontSize(11).text("Bill to", 330, 145);
  doc.font("Helvetica").fontSize(10).fillColor("#475569").text(invoice.client.name, 330, 164).text(invoice.client.email ?? "").text(invoice.client.phone ?? "").text(invoice.client.address ?? "");

  doc.fillColor("#17211f").font("Helvetica-Bold").fontSize(10).text("Issued", 48, 250).text("Due", 170, 250).text("Currency", 292, 250);
  doc.font("Helvetica").fillColor("#475569").text(invoice.issueDate.toLocaleDateString(), 48, 268).text(invoice.dueDate.toLocaleDateString(), 170, 268).text(invoice.currency, 292, 268);

  const tableTop = 320;
  doc.roundedRect(48, tableTop - 12, 500, 28, 4).fill("#e8f4ef");
  doc.fillColor("#17211f").fontSize(9).font("Helvetica-Bold")
    .text("Description", 60, tableTop - 4)
    .text("Qty", 300, tableTop - 4, { width: 40, align: "right" })
    .text("Price", 356, tableTop - 4, { width: 70, align: "right" })
    .text("Tax", 432, tableTop - 4, { width: 44, align: "right" })
    .text("Total", 486, tableTop - 4, { width: 50, align: "right" });

  doc.font("Helvetica").fontSize(9).fillColor("#334155");
  let rowY = tableTop + 24;
  for (const item of invoice.items) {
    doc.moveTo(48, rowY - 8).lineTo(548, rowY - 8).strokeColor("#e2e8f0").stroke();
    doc.fillColor("#334155")
      .text(item.description, 60, rowY, { width: 220 })
      .text(String(item.quantity), 300, rowY, { width: 40, align: "right" })
      .text(money(item.unitPrice, invoice.currency), 356, rowY, { width: 70, align: "right" })
      .text(`${String(item.taxRate)}%`, 432, rowY, { width: 44, align: "right" })
      .text(money(item.lineTotal, invoice.currency), 486, rowY, { width: 50, align: "right" });
    rowY += 34;
  }

  const paid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalsX = 340;
  const totalsY = Math.max(rowY + 24, 520);
  doc.font("Helvetica").fontSize(10).fillColor("#475569");
  doc.text("Subtotal", totalsX, totalsY).text(money(invoice.subtotal, invoice.currency), 448, totalsY, { width: 90, align: "right" });
  doc.text("Discount", totalsX, totalsY + 22).text(money(invoice.discountTotal, invoice.currency), 448, totalsY + 22, { width: 90, align: "right" });
  doc.text("Tax", totalsX, totalsY + 44).text(money(invoice.taxTotal, invoice.currency), 448, totalsY + 44, { width: 90, align: "right" });
  doc.moveTo(totalsX, totalsY + 66).lineTo(548, totalsY + 66).strokeColor("#cbd5e1").stroke();
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#17211f").text("Total", totalsX, totalsY + 78).text(money(invoice.total, invoice.currency), 448, totalsY + 78, { width: 90, align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor("#475569").text("Paid", totalsX, totalsY + 104).text(money(paid, invoice.currency), 448, totalsY + 104, { width: 90, align: "right" });
  doc.font("Helvetica-Bold").fillColor("#17211f").text("Balance", totalsX, totalsY + 126).text(money(Number(invoice.total) - paid, invoice.currency), 448, totalsY + 126, { width: 90, align: "right" });

  if (invoice.notes) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#17211f").text("Notes", 48, totalsY);
    doc.font("Helvetica").fontSize(10).fillColor("#475569").text(invoice.notes, 48, totalsY + 18, { width: 250 });
  }
  doc.end();

  const pdf = await done;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename=${invoice.number}.pdf`
    }
  });
}
