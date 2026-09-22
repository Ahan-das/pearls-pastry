import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Figtree, Lobster } from "next/font/google";
import CartToast from "@/components/cart/CartToast";
import "./globals.css";

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-dm-serif", display: "swap" });
const sans = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const script = Lobster({ subsets: ["latin"], weight: "400", variable: "--font-lobster", display: "swap" });

export const metadata: Metadata = {
  title: "Pearls & Pastry · Boba, bakes and good meals",
  description: "Brown-sugar boba, warm cinnamon rolls, cheesecake and loaded fries. Hugs in a cup.",
};

export const viewport: Viewport = {
  themeColor: "#f5e7d6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body>
        {children}
        <CartToast />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
