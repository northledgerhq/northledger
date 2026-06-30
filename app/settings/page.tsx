import { Button, Card, Field, PageHeader } from "@/components/ui";
import { updateSettings } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const settings = await prisma.setting.upsert({ where: { id: "singleton" }, update: {}, create: {} });

  return (
    <>
      <PageHeader title="Settings" description="Company defaults used across invoices, reports, and exports." />
      <Card className="max-w-2xl">
        <form action={updateSettings} className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name"><input name="companyName" defaultValue={settings.companyName} required /></Field>
          <Field label="Logo URL"><input name="logoUrl" defaultValue={settings.logoUrl ?? ""} /></Field>
          <Field label="Email"><input name="email" type="email" defaultValue={settings.email ?? ""} /></Field>
          <Field label="Phone"><input name="phone" defaultValue={settings.phone ?? ""} /></Field>
          <Field label="Default currency"><input name="defaultCurrency" maxLength={3} defaultValue={settings.defaultCurrency} required /></Field>
          <Field label="Default tax rate"><input name="defaultTaxRate" type="number" step="0.01" min="0" max="100" defaultValue={String(settings.defaultTaxRate)} required /></Field>
          <Field label="Invoice prefix"><input name="invoicePrefix" defaultValue={settings.invoicePrefix} required /></Field>
          <div className="sm:col-span-2"><Field label="Address"><textarea name="address" rows={3} defaultValue={settings.address ?? ""} /></Field></div>
          <div className="sm:col-span-2"><Button>Save settings</Button></div>
        </form>
      </Card>
    </>
  );
}
