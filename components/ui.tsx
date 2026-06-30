import Link from "next/link";
import { clsx } from "clsx";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-ink">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx("rounded-lg border border-line bg-white p-5 shadow-soft", className)}>{children}</section>;
}

export function Button({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button className={clsx("inline-flex h-10 items-center justify-center rounded-md bg-forest px-4 text-sm font-semibold text-white hover:bg-ink", className)}>
      {children}
    </button>
  );
}

export function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-10 items-center justify-center rounded-md bg-forest px-4 text-sm font-semibold text-white hover:bg-ink">
      {children}
    </Link>
  );
}

export function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-semibold text-forest hover:text-ink">
      {children}
    </Link>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function EmptyState({ title }: { title: string }) {
  return <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center text-sm text-slate-500">{title}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone = {
    paid: "bg-mint text-forest",
    partially_paid: "bg-amber/20 text-amber",
    overdue: "bg-coral/15 text-coral",
    cancelled: "bg-slate-100 text-slate-600",
    sent: "bg-blue-50 text-blue-700",
    draft: "bg-slate-100 text-slate-600"
  }[status] ?? "bg-slate-100 text-slate-600";

  return <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize", tone)}>{status.replace("_", " ")}</span>;
}
