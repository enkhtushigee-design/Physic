import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { mn } from "@/lib/i18n/mn";

export const metadata: Metadata = { title: mn.states.notFoundTitle };

export default function NotFound() {
  return <NotFoundContent />;
}
