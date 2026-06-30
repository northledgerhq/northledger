import Link from "next/link";
import { headers } from "next/headers";
import { BarChart3, Building2, CreditCard, FileText, LayoutDashboard, LogOut, Package, Receipt, Settings } from "lucide-react";
import { logout } from "@/lib/auth";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/items", label: "Products", icon: Package },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname.startsWith("/login")) return <>{children}</>;

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-line bg-white lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="grid size-9 place-items-center rounded-md bg-forest text-sm font-bold text-white">NL</div>
          <div>
            <div className="text-base font-semibold">NorthLedger</div>
            <div className="text-xs text-slate-500">Simple business finance</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-w-max items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-mint hover:text-ink"
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <form action={logout} className="px-3 pb-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-mint hover:text-ink">
            <LogOut className="size-4" />
            Logout
          </button>
        </form>
      </aside>
      <main className="w-full px-4 py-6 sm:px-6 lg:ml-64 lg:px-8">{children}</main>
    </div>
  );
}
