import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";

import type { Metadata } from "next";
import SupportWhatsAppButton from "@/components/basirah/SupportWhatsAppButton";
import "./globals.css";
import "./reports/print.css";

export const metadata: Metadata = {
  title: "بصيرة",
  description:
    "منصة تحليل تعلم وقياس تربوي لتحويل نتائج الاختبارات والتدريب إلى مؤشرات وتشخيص وتقارير رسمية.",
  icons: {
    icon: "/baseerah-icon.svg",
    shortcut: "/baseerah-icon.svg",
    apple: "/baseerah-icon.svg",
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
