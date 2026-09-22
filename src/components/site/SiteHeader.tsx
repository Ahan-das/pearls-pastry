"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { List, X, WhatsappLogo } from "@phosphor-icons/react";
import Logo from "./Logo";
import CartLink from "@/components/cart/CartLink";
import { SITE } from "@/data/site";
import "./header.css";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Sits in the page at the top. Once the visitor leaves the hero's first 60px it
 * lifts into a floating cream pill, so it never covers the art while you look at it.
 * The switch is driven by an IntersectionObserver on a sentinel, not a scroll listener.
 */
export default function SiteHeader({ current = "home" }: { current?: "home" | "cart" }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLifted(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div ref={sentinel} className="hdr-sentinel" aria-hidden="true" />
      <header className="hdr" data-lifted={lifted || undefined}>
        <div className="hdr__bar">
          <a href="#top" className="hdr__logo" aria-label="Pearls & Pastry, home">
            <Logo size={lifted ? 46 : 60} />
          </a>

          <nav className="hdr__nav" aria-label="Main">
            <ul>
              {SITE.nav.map((item, i) => (
                <li key={item.href}>
                  <a href={item.href} aria-current={i === 0 && current === "home" ? "page" : undefined}>
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="hdr__cart">
                <CartLink current={current === "cart"} />
              </li>
            </ul>
          </nav>

          <a className="hdr__order" href={SITE.whatsapp} target="_blank" rel="noreferrer">
            <span>Order on WhatsApp</span>
            <i aria-hidden="true">
              <WhatsappLogo size={17} weight="regular" />
            </i>
          </a>

          <div className="hdr__tools">
            <CartLink compact current={current === "cart"} />
          </div>

          <button
            type="button"
            className="hdr__menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="sheet"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
          >
            <motion.ul
              initial="hide"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
            >
              {SITE.nav.map((item) => (
                <motion.li
                  key={item.href}
                  variants={{
                    hide: { opacity: 0, y: reduced ? 0 : 28 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
                  }}
                >
                  <a href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
            <a className="sheet__cart" href="/cart" onClick={() => setOpen(false)}>
              Your cart
            </a>
            <a className="sheet__order" href={SITE.whatsapp} target="_blank" rel="noreferrer">
              <WhatsappLogo size={20} /> Order on WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
