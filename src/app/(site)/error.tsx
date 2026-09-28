"use client";

import { useEffect } from "react";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { AlertIcon } from "@/components/ui/icons";
import { mn } from "@/lib/i18n/mn";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container size="md" className="py-24 text-center">
      <div role="alert">
        <AlertIcon size={36} className="mx-auto text-danger" />
        <p className="mt-4 text-lg font-medium text-ink">{mn.states.loadFailed}</p>
      </div>
      <button type="button" onClick={reset} className={buttonClass({ className: "mt-8" })}>
        {mn.states.retry}
      </button>
    </Container>
  );
}
