import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/content/page-intro";
import { Container } from "@/components/ui/container";
import { SearchIcon } from "@/components/ui/icons";
import { getCatalog } from "@/lib/content/catalog";
import { searchCatalog, type Segment } from "@/lib/content/search";
import { mn } from "@/lib/i18n/mn";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const q = firstParam((await searchParams).q);
  return {
    title: q ? mn.search.resultsFor(q) : mn.search.title,
    description: mn.search.prompt,
    alternates: { canonical: "/search" },
    // Хайлтын үр дүнгийн хуудсыг хайлтын системд индекслүүлэхгүй.
    robots: q ? { index: false, follow: true } : undefined,
  };
}

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) ?? "";
}

function Highlighted({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.match ? (
          <mark key={i} className="rounded-sm bg-accent-soft px-0.5 text-inherit">
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const q = firstParam((await searchParams).q);
  const results = q ? searchCatalog(await getCatalog(), q) : [];

  return (
    <>
      <PageIntro crumbs={[{ label: mn.nav.home, href: "/" }, { label: mn.search.title }]} title={mn.search.heading}>
        <form action="/search" method="get" role="search" className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="search-input" className="sr-only">
            {mn.search.label}
          </label>
          <div className="relative flex-1">
            <SearchIcon size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="search-input"
              name="q"
              type="search"
              defaultValue={q}
              placeholder={mn.search.placeholder}
              autoComplete="off"
              autoFocus={!q}
              maxLength={100}
              className="h-13 w-full rounded-xl border border-line-strong bg-surface pl-12 pr-4 text-base text-ink shadow-[var(--shadow-soft)] placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
            />
          </div>
          <button
            type="submit"
            className="h-13 rounded-xl bg-accent px-6 font-medium text-accent-ink transition-colors hover:bg-accent-strong"
          >
            {mn.search.submit}
          </button>
        </form>
      </PageIntro>

      <Container size="md" className="mt-10">
        {!q ? (
          <p className="text-ink-2">{mn.search.prompt}</p>
        ) : results.length === 0 ? (
          <div role="status">
            <p className="font-medium text-ink">{mn.search.noResults(q)}</p>
            <p className="mt-1 text-ink-3">{mn.search.noResultsHint}</p>
          </div>
        ) : (
          <>
            <h2 className="font-display text-xl font-semibold text-ink">{mn.search.resultsFor(q)}</h2>
            <p role="status" className="mt-1 text-sm text-ink-3">
              {mn.search.resultCount(results.length)}
            </p>
            <ul className="mt-6 space-y-3">
              {results.map((result) => (
                <li key={`${result.kind}-${result.id}`}>
                  <Link
                    href={result.href}
                    className="group block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong"
                  >
                    <span className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
                      <span className="rounded-md bg-surface-2 px-2 py-0.5 font-medium text-ink-2">
                        {mn.search.groups[result.kind]}
                      </span>
                      {result.context.map((c, i) => (
                        <span key={i} className="flex items-center gap-2">
                          {i > 0 && <span aria-hidden="true">/</span>}
                          {c}
                        </span>
                      ))}
                    </span>
                    <span className="mt-2 block font-display text-lg font-semibold text-ink group-hover:text-accent">
                      <Highlighted segments={result.title} />
                    </span>
                    {result.snippet && (
                      <span className="mt-1 line-clamp-3 block text-sm text-ink-2">
                        <Highlighted segments={result.snippet} />
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </>
  );
}
