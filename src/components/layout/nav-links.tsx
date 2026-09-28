"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

const OTHER_ROUTES = ["/learning-path", "/search", "/admin"];

const matches = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/physics") {
    // Сэдэв/бүлэг/хичээлийн хуудсууд (/mechanics/...) мөн "Сэдвүүд" цэсэнд хамаарна.
    return pathname !== "/" && !OTHER_ROUTES.some((route) => matches(pathname, route));
  }
  return matches(pathname, href);
}

export function NavLinks({ items, vertical = false, onNavigate }: { items: NavItem[]; vertical?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className={vertical ? "flex flex-col gap-1" : "flex items-center gap-1"}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`block rounded-lg font-medium transition-colors ${
                vertical ? "px-3 py-3 text-base" : "px-3 py-2 text-[0.93rem]"
              } ${active ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
