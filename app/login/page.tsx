import { login } from "@/lib/auth";
import { Button, Field } from "@/components/ui";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="w-full max-w-sm rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="mb-6">
          <div className="mb-3 grid size-10 place-items-center rounded-md bg-forest text-sm font-bold text-white">NL</div>
          <h1 className="text-xl font-semibold text-ink">Sign in to NorthLedger</h1>
          <p className="mt-1 text-sm text-slate-600">Use your local workspace account.</p>
        </div>
        {params.error ? <div className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm font-medium text-coral">Invalid email or password.</div> : null}
        <form action={login} className="space-y-4">
          <Field label="Email">
            <input name="email" type="email" defaultValue="admin@northledger.local" required />
          </Field>
          <Field label="Password">
            <input name="password" type="password" defaultValue="admin123456" required />
          </Field>
          <Button className="w-full">Log in</Button>
        </form>
      </section>
    </main>
  );
}
