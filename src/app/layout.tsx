import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import NextAuthProvider from "@/components/auth/NextAuthProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "POLIMDO GO - Sistem Presensi Mahasiswa",
  description: "Aplikasi Web MVP Presensi Mahasiswa Berbasis QR Code & Geolocation dengan Radius Validation - Politeknik Negeri Manado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9ff] text-zinc-900 font-sans">
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
