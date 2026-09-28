import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { buttonClass } from "@/components/ui/button";
import { ExternalIcon } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/auth/admin";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { logoutAction } from "../actions";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="rounded-md">
              <Logo />
            </Link>
            <span className="hidden text-sm text-ink-3 sm:inline">{mnAdmin.title}</span>
          </div>
          <nav aria-label={mnAdmin.title} className="flex flex-wrap items-center gap-1 text-sm">
            <Link href="/admin" className={buttonClass({ variant: "ghost", size: "sm" })}>
              {mnAdmin.nav.content}
            </Link>
            <Link href="/admin/import" className={buttonClass({ variant: "ghost", size: "sm" })}>
              {mnAdmin.nav.import}
            </Link>
            <Link href="/" target="_blank" className={buttonClass({ variant: "ghost", size: "sm" })}>
              {mnAdmin.viewSite}
              <ExternalIcon size={14} />
            </Link>
            <form action={logoutAction}>
              <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
                {mnAdmin.logout}
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {children}
      </main>
    </>
  );
}
