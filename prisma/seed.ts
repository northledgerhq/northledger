import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { calculateInvoiceTotals } from "../lib/invoice";

const prisma = new PrismaClient();

async function main() {
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.item.deleteMany();
  await prisma.client.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      email: "admin@northledger.local",
      name: "NorthLedger Admin",
      passwordHash: await hash("admin123456", 12)
    }
  });

  const settings = await prisma.setting.create({
    data: {
      companyName: "NorthLedger Studio",
      email: "hello@northledger.test",
      phone: "+1 555 0134",
      address: "101 Market Street\nToronto, ON",
      defaultCurrency: "USD",
      defaultTaxRate: 13,
      invoicePrefix: "NL"
    }
  });

  const [acme, orbit] = await Promise.all([
    prisma.client.create({
      data: {
        name: "Acme Design Co.",
        email: "billing@acme.test",
        phone: "+1 555 0101",
        address: "44 King Street\nToronto, ON",
        notes: "Prefers invoices by email."
      }
    }),
    prisma.client.create({
      data: {
        name: "Orbit Coffee",
        email: "finance@orbit.test",
        address: "8 Pine Avenue\nAustin, TX"
      }
    })
  ]);

  const [strategy, implementation, support] = await Promise.all([
    prisma.item.create({ data: { name: "Strategy session", description: "Discovery and planning workshop", unitPrice: 350, taxRate: settings.defaultTaxRate } }),
    prisma.item.create({ data: { name: "Implementation day", description: "Product or operations implementation", unitPrice: 900, taxRate: settings.defaultTaxRate } }),
    prisma.item.create({ data: { name: "Support retainer", description: "Monthly support package", unitPrice: 1200, taxRate: settings.defaultTaxRate } })
  ]);

  const invoiceLines = [
    { itemId: strategy.id, description: strategy.name, quantity: 2, unitPrice: Number(strategy.unitPrice), taxRate: Number(strategy.taxRate) },
    { itemId: implementation.id, description: implementation.name, quantity: 3, unitPrice: Number(implementation.unitPrice), taxRate: Number(implementation.taxRate) }
  ];
  const totals = calculateInvoiceTotals(invoiceLines, 5);
  const invoice = await prisma.invoice.create({
    data: {
      number: "NL-0001",
      clientId: acme.id,
      issueDate: new Date("2026-06-01"),
      dueDate: new Date("2026-06-15"),
      status: "partially_paid",
      currency: settings.defaultCurrency,
      discountRate: 5,
      ...totals,
      notes: "Thank you for the continued work.",
      items: {
        create: invoiceLines.map((line) => ({
          itemId: line.itemId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          lineTotal: line.quantity * line.unitPrice
        }))
      }
    }
  });

  const retainerTotals = calculateInvoiceTotals([{ itemId: support.id, description: support.name, quantity: 1, unitPrice: Number(support.unitPrice), taxRate: Number(support.taxRate) }], 0);
  await prisma.invoice.create({
    data: {
      number: "NL-0002",
      clientId: orbit.id,
      issueDate: new Date("2026-06-10"),
      dueDate: new Date("2026-07-10"),
      status: "sent",
      currency: settings.defaultCurrency,
      ...retainerTotals,
      items: {
        create: [{ itemId: support.id, description: support.name, quantity: 1, unitPrice: support.unitPrice, taxRate: support.taxRate, lineTotal: support.unitPrice }]
      }
    }
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: 1500,
      method: "bank_transfer",
      paidAt: new Date("2026-06-12"),
      reference: "ACH-10045"
    }
  });

  await prisma.expense.createMany({
    data: [
      { category: "Software", amount: 89, date: new Date("2026-06-03"), vendor: "Cloud Tools", notes: "Project management subscription" },
      { category: "Travel", amount: 224.5, date: new Date("2026-06-08"), vendor: "Rail North", notes: "Client visit" },
      { category: "Office", amount: 46.25, date: new Date("2026-05-27"), vendor: "Paper Goods" }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
