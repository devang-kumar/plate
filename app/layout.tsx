import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Lock } from "lucide-react";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PLATES.AE - Dubai Car License Plates for Sale",
  description: "UAE's premium marketplace for car and bike license plates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">

          {/* TOP HEADER */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-[680px] mx-auto flex items-center justify-between py-2 px-3 relative">
              <Link href="/" className="logo !text-[20px] sm:!text-[28px]">PLATES.AE</Link>
              <div className="text-[11px] text-gray-500 text-right hidden sm:block">
                0509080500&nbsp; uaeplate10@gmail.com
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="bg-primary-red">
            <div className="max-w-[680px] mx-auto px-3">

              {/* Desktop nav — hidden on mobile */}
              <div className="hidden sm:block">
                <div className="flex flex-wrap justify-between items-center py-1.5 main-nav-row">
                  <Link href="/terms">Terms and Conditions</Link>
                  <Link href="/sell">Sell your number</Link>
                  <Link href="/how-to-buy">How to buy</Link>
                  <Link href="/faq">FAQ</Link>
                  <Link href="/drawing">Drawing numbers</Link>
                  <Link href="/paintings">Paintings</Link>
                  <Link href="/">Home</Link>
                  <span className="text-white text-[16px] px-2">🇬🇧</span>
                  <Link href="/admin" className="text-white/70 hover:text-white text-xs flex items-center gap-1">
                    <Lock size={12} /> Admin
                  </Link>
                </div>
                <div className="flex justify-between border-t border-white/25 py-1 main-nav-row">
                  <Link href="/contact">Communication</Link>
                  <Link href="/about">About the company</Link>
                </div>
              </div>

              {/* Mobile nav — hamburger */}
              <MobileNav />
            </div>
          </nav>

          <main className="flex-grow">
            {children}
          </main>

          <footer className="bg-white border-t border-gray-200 py-5 mt-8">
            <div className="max-w-[680px] mx-auto px-4 text-center">
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} PLATES.AE. All rights reserved.</p>
              <div className="mt-3 flex justify-center flex-wrap gap-4">
                <Link href="/terms" className="text-xs text-gray-400 hover:text-primary-red">Terms & Conditions</Link>
                <Link href="/faq" className="text-xs text-gray-400 hover:text-primary-red">FAQ</Link>
                <Link href="/how-to-buy" className="text-xs text-gray-400 hover:text-primary-red">How to Buy</Link>
                <Link href="/contact" className="text-xs text-gray-400 hover:text-primary-red">Contact</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
