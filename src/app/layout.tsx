import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { mn } from "@/lib/i18n/mn";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Монгол кирилл (Ө, Ү) нь cyrillic-ext дэд олонлогт багтдаг.
const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${mn.site.name} — физикийн хичээлүүд`,
    template: `%s | ${mn.site.name}`,
  },
  description: mn.site.description,
  applicationName: mn.site.name,
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: mn.site.name,
    title: `${mn.site.name} — физикийн хичээлүүд`,
    description: mn.site.description,
  },
  twitter: { card: "summary" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1016" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={`${inter.variable} ${serif.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
