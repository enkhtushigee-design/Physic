import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FormAlert } from "@/components/admin/fields";
import { Logo } from "@/components/layout/logo";
import { isAdminConfigured, isAdminSession } from "@/lib/auth/admin";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: mnAdmin.login.title };

export default async function LoginPage() {
  if (await isAdminSession()) redirect("/admin");
  const configured = isAdminConfigured();

  return (
    <main className="bg-grid flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-[var(--shadow-lift)]">
        <Link href="/" className="inline-block rounded-md">
          <Logo />
        </Link>
        <h1 className="mt-8 font-display text-2xl font-semibold text-ink">{mnAdmin.title}</h1>
        <p className="mt-2 text-sm text-ink-2">{mnAdmin.login.intro}</p>
        <div className="mt-6">{configured ? <LoginForm /> : <FormAlert message={mnAdmin.login.notConfigured} />}</div>
      </div>
    </main>
  );
}
