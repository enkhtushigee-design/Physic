import type { Metadata } from "next";
import { mnAdmin } from "@/lib/i18n/mn-admin";

export const metadata: Metadata = {
  title: { default: mnAdmin.title, template: `%s | ${mnAdmin.title}` },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bg">{children}</div>;
}
