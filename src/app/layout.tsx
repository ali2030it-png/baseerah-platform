import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";

import type { Metadata } from "next";
import SupportWhatsAppButton from "@/components/basirah/SupportWhatsAppButton";
import "./globals.css";
import "./reports/print.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "بصيرة",
  description:
    "منصة تحليل تعلم وقياس تربوي لتحويل نتائج الاختبارات والتدريب إلى مؤشرات وتشخيص وتقارير رسمية.",
  icons: {
    icon: "/baseerah-app-icon.png",
    shortcut: "/baseerah-app-icon.png",
    apple: "/baseerah-app-icon.png",
  },
  openGraph: {
    title: "بصيرة",
    description:
      "منصة تحليل تعلم وقياس تربوي لتحويل نتائج الطلاب إلى مؤشرات وتشخيص وتقارير تربوية.",
    images: ["/baseerah-logo-full.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        {children}
        <SupportWhatsAppButton />
      </body>
    </html>
  );
}
