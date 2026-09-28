import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { mn } from "@/lib/i18n/mn";

export function NotFoundContent() {
  return (
    <Container size="md" className="py-24 text-center sm:py-32">
      <p className="font-display text-6xl font-semibold text-line-strong">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">{mn.states.notFoundTitle}</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-2">{mn.states.notFoundText}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className={buttonClass()}>
          {mn.states.backHome}
        </Link>
        <Link href="/search" className={buttonClass({ variant: "secondary" })}>
          {mn.nav.search}
        </Link>
      </div>
    </Container>
  );
}
