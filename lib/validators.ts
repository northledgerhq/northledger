import { z } from "zod";

const money = z.coerce.number().min(0);
const percent = z.coerce.number().min(0).max(100);
const date = z.coerce.date();

export const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

export const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  unitPrice: money,
  taxRate: percent
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1),
  issueDate: date,
  dueDate: date,
  status: z.enum(["draft", "sent", "paid", "partially_paid", "overdue", "cancelled"]),
  discountRate: percent,
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().optional(),
        description: z.string().min(1),
        quantity: z.coerce.number().positive(),
        unitPrice: money,
        taxRate: percent
      })
    )
    .min(1)
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: money.refine((value) => value > 0, "Payment must be greater than zero"),
  method: z.enum(["cash", "bank_transfer", "card", "paypal", "other"]),
  paidAt: date,
  reference: z.string().optional(),
  notes: z.string().optional()
});

export const expenseSchema = z.object({
  category: z.string().min(1),
  amount: money.refine((value) => value > 0, "Amount must be greater than zero"),
  date,
  vendor: z.string().optional(),
  notes: z.string().optional()
});

export const settingsSchema = z.object({
  companyName: z.string().min(1),
  logoUrl: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  defaultCurrency: z.string().min(3).max(3),
  defaultTaxRate: percent,
  invoicePrefix: z.string().min(1).max(12)
});
