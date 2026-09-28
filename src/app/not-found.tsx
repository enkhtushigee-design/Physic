import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { mn } from "@/lib/i18n/mn";

export const metadata: Metadata = { title: mn.states.notFoundTitle };

// Ямар ч маршрутад таараагүй хаягт (жишээ нь /a/b/c/d) зориулсан хуудас.
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </div>
  );
}
