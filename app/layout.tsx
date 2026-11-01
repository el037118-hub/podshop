import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "@/app/globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Podshop Imports | Catálogo",
  description: "Consulte o catálogo Podshop Imports e fale com a loja pelo WhatsApp.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${dmSans.variable} ${manrope.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>{children}</body>
    </html>
  );
}
