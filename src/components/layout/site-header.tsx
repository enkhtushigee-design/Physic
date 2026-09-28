import Link from "next/link";
import { mn } from "@/lib/i18n/mn";
import { NAV_ITEMS } from "@/lib/site";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={mn.nav.homeLink} className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label={mn.nav.label} className="hidden md:block">
          <NavLinks items={NAV_ITEMS.map((i) => ({ href: i.href, label: mn.nav[i.key] }))} />
        </nav>
        <MobileMenu items={NAV_ITEMS.map((i) => ({ href: i.href, label: mn.nav[i.key] }))} />
      </div>
    </header>
  );
}
