import Link from "next/link";
import { ExternalIcon } from "@/components/ui/icons";
import { mn } from "@/lib/i18n/mn";
import { NAV_ITEMS, youtubeChannelUrl } from "@/lib/site";
import { Logo } from "./logo";

export function SiteFooter() {
  const channel = youtubeChannelUrl();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-ink-3">{mn.site.tagline}</p>
        </div>
        <nav aria-label={mn.footer.links}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {NAV_ITEMS.filter((i) => i.href !== "/").map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-2 hover:text-ink hover:underline underline-offset-4">
                  {mn.nav[item.key]}
                </Link>
              </li>
            ))}
            {channel && (
              <li>
                <a
                  href={channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-ink-2 hover:text-ink hover:underline underline-offset-4"
                >
                  {mn.footer.youtube}
                  <ExternalIcon size={14} />
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10 text-xs text-ink-3 sm:px-6 lg:px-8">
        {mn.footer.rights(new Date().getFullYear())}
      </div>
    </footer>
  );
}
