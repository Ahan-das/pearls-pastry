import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import CartDesk from "@/components/cart/CartDesk";

export const metadata: Metadata = {
  title: "Your cart · Pearls & Pastry",
  description: "Check your order and send it to the café.",
};

export default function CartPage() {
  return (
    <>
      <SiteHeader current="cart" />
      <main>
        <CartDesk />
      </main>
      <SiteFooter />
    </>
  );
}
