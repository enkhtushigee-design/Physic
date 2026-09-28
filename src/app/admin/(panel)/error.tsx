"use client";

import { FormAlert } from "@/components/admin/fields";
import { buttonClass } from "@/components/ui/button";
import { mn } from "@/lib/i18n/mn";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Хөгжүүлэлтийн үед тохиргооны алдааны монгол тайлбар харагдана; production-д ерөнхий мэдэгдэл.
  const message = process.env.NODE_ENV === "development" && error.message ? error.message : mn.states.loadFailed;
  return (
    <div className="max-w-xl space-y-6">
      <FormAlert message={message} />
      <button type="button" onClick={reset} className={buttonClass()}>
        {mn.states.retry}
      </button>
    </div>
  );
}
