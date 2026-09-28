import { Container } from "@/components/ui/container";
import { mn } from "@/lib/i18n/mn";

export default function Loading() {
  return (
    <Container size="md" className="py-14">
      <div role="status" aria-live="polite" className="animate-pulse space-y-5">
        <span className="sr-only">{mn.states.loading}</span>
        <div className="h-4 w-40 rounded bg-surface-2" />
        <div className="h-10 w-3/4 rounded-lg bg-surface-2" />
        <div className="h-4 w-full rounded bg-surface-2" />
        <div className="h-4 w-2/3 rounded bg-surface-2" />
        <div className="mt-10 h-24 rounded-2xl bg-surface-2" />
        <div className="h-24 rounded-2xl bg-surface-2" />
      </div>
    </Container>
  );
}
