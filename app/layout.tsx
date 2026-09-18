import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Univer Test Platform — Universitet Test va Diagnostika Tizimi",
  description: "Universitet talabalari uchun yagona raqamli test topshirish, monitoring va CRM baholash platformasi.",
  keywords: "univer test, talaba testi, psixodiagnostika, test platformasi, oliy ta'lim",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0B132B] text-slate-100 antialiased selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
