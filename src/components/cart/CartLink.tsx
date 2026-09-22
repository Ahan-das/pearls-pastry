"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Tote } from "@phosphor-icons/react";
import { ADDED_EVENT, useCart } from "@/lib/cart";

/**
 * Header cart link. The count sits in a small caramel badge that pops every
 * time something is added (keyed remount + spring), so the visitor sees where
 * the dish went without leaving the menu.
 */
export default function CartLink({ compact = false, current = false }: { compact?: boolean; current?: boolean }) {
  const { count } = useCart();
  const [bump, setBump] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const on = () => setBump((b) => b + 1);
    window.addEventListener(ADDED_EVENT, on);
    return () => window.removeEventListener(ADDED_EVENT, on);
  }, []);

  const label = `Cart, ${count} ${count === 1 ? "item" : "items"}`;
  return (
    <Link
      href="/cart"
      className={compact ? "cartlink cartlink--compact" : "cartlink"}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      data-full={count > 0 || undefined}
    >
      <motion.span
        key={bump}
        className="cartlink__icon"
        initial={bump > 0 && !reduced ? { rotate: -14, scale: 0.86 } : false}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 520, damping: 14 }}
      >
        <Tote size={compact ? 21 : 18} weight="regular" />
      </motion.span>
      {!compact && <span className="cartlink__text">Cart</span>}
      <motion.em
        key={`n${bump}`}
        className="cartlink__count"
        initial={bump > 0 && !reduced ? { scale: 1.6 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 16 }}
        aria-hidden="true"
      >
        {count}
      </motion.em>
    </Link>
  );
}
