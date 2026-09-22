"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { ADDED_EVENT, type AddedDetail } from "@/lib/cart";
import "./cart.css";

/** A small note that confirms what went in, with a way straight to the cart. */
export default function CartToast() {
  const [note, setNote] = useState<(AddedDetail & { key: number }) | null>(null);
  const timer = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<AddedDetail>).detail;
      setNote({ ...d, key: Date.now() });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setNote(null), 3200);
    };
    window.addEventListener(ADDED_EVENT, on);
    return () => {
      window.removeEventListener(ADDED_EVENT, on);
      window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="toast-wrap" aria-live="polite">
      <AnimatePresence>
        {note && (
          <motion.div
            key={note.key}
            className="toast"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            <span className="toast__thumb">
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny thumbnail */}
              <img src={note.img} alt="" />
            </span>
            <span className="toast__text">
              <span>
                <b>{note.name}</b> added
              </span>
              <small>
                {note.count} {note.count === 1 ? "item" : "items"} in your cart
              </small>
            </span>
            <Link href="/cart" className="toast__go">
              View cart <ArrowRight size={14} weight="bold" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
