"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus } from "@phosphor-icons/react";
import { useCart } from "@/lib/cart";

/** "Add" on a dish: puts it in the cart, and says so for a moment. */
export default function AddToCart({
  id,
  name,
  price,
  img,
  className = "",
  label = "Add",
}: {
  id: string;
  name: string;
  price: number;
  img: string;
  className?: string;
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <motion.button
      type="button"
      className={`addbtn ${className}`}
      data-added={added || undefined}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 520, damping: 26 }}
      aria-label={`Add ${name} to cart`}
      onClick={() => {
        add({ id, name, price, img });
        setAdded(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setAdded(false), 1500);
      }}
    >
      <span className="addbtn__label" aria-live="polite">
        {added ? "Added" : label}
      </span>
      <i aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={added ? "y" : "n"}
            initial={{ scale: 0.4, rotate: -60, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            style={{ display: "grid" }}
          >
            {added ? <Check size={16} weight="bold" /> : <Plus size={16} weight="bold" />}
          </motion.span>
        </AnimatePresence>
      </i>
    </motion.button>
  );
}
