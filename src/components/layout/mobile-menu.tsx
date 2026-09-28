"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { mn } from "@/lib/i18n/mn";
import { NavLinks, type NavItem } from "./nav-links";

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Өөр хуудас руу шилжихэд цэс автоматаар хаагдана.
  const open = openedAt === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenedAt(null);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? mn.nav.closeMenu : mn.nav.openMenu}
        onClick={() => setOpenedAt(open ? null : pathname)}
        className="-mr-2 flex size-11 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink"
      >
        {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
      </button>
      <nav
        id={panelId}
        aria-label={mn.nav.label}
        hidden={!open}
        className="absolute inset-x-0 top-16 border-b border-line bg-bg px-4 pb-4 pt-2 shadow-[var(--shadow-lift)]"
      >
        <NavLinks items={items} vertical onNavigate={() => setOpenedAt(null)} />
      </nav>
    </div>
  );
}
