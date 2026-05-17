import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/layout/Providers";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Club Soccer",
  description: "Official club soccer team website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white text-gray-900">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-900 text-gray-400 text-sm text-center py-4">
            &copy; 2026 Club Soccer. All rights reserved.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
