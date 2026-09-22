"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Heart, Plus } from "@phosphor-icons/react";
import { FAVOURITES, rupees } from "@/data/favourites";
import { SITE } from "@/data/site";
import AddToCart from "@/components/cart/AddToCart";
import { startFav, type FavHandle } from "./favEngine";
import "./favourites.css";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Name swap: each word rises in from under its baseline and leaves upward.
   Keyed enter/exit is exactly what AnimatePresence is for. */
const words = {
  enter: { transition: { staggerChildren: 0.06 } },
  exit: { transition: { staggerChildren: 0.03 } },
};
const word = {
  initial: { y: "110%" },
  enter: { y: "0%", transition: { duration: 0.8, ease: EASE } },
  exit: { y: "-110%", transition: { duration: 0.38, ease: [0.7, 0, 0.84, 0] as const } },
};
const detail = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  enter: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE, delay: 0.12 } },
  exit: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.22 } },
};

export default function Favourites() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tray = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGEllipseElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const handle = useRef<FavHandle | null>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const fav = FAVOURITES[active];

  useEffect(() => {
    if (!root.current || !stage.current || !tray.current || !glow.current) return;
    const h = startFav(
      {
        root: root.current,
        stage: stage.current,
        tray: tray.current,
        ring: ring.current,
        glow: glow.current,
        items: items.current.filter((el): el is HTMLDivElement => !!el),
      },
      { palettes: FAVOURITES, dims: FAVOURITES, reduced: !!reduced, onIndex: setActive },
    );
    handle.current = h;
    return () => h.destroy();
  }, [reduced]);

  return (
    <section
      ref={root}
      id="menu"
      className="fav"
      aria-labelledby="fav-title"
      style={{ ["--n" as string]: FAVOURITES.length }}
    >
      <div ref={stage} className="fav__stage">
        <header className="fav__head">
          <h2 id="fav-title">
            Customer favourites <Heart size={18} weight="fill" aria-hidden="true" />
          </h2>
          <a className="fav__all" href={SITE.menuUrl}>
            View all menu <ArrowRight size={15} weight="bold" aria-hidden="true" />
          </a>
        </header>

        {/* the tray and its dishes */}
        <div ref={glow} className="fav__glow" aria-hidden="true" />
        <div ref={tray} className="fav__tray" aria-hidden="true">
          <svg viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <radialGradient id="tray-top" cx="0.5" cy="0.35" r="0.65">
                <stop offset="0" stopColor="#fffaf3" />
                <stop offset="1" stopColor="#efe0cc" />
              </radialGradient>
              <linearGradient id="tray-edge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d9bf9f" />
                <stop offset="1" stopColor="#b8946d" />
              </linearGradient>
            </defs>
            <ellipse cx="100" cy="33" rx="99" ry="26" fill="url(#tray-edge)" />
            <ellipse cx="100" cy="27" rx="99" ry="26" fill="url(#tray-top)" />
            <ellipse ref={ring} className="fav__ring" cx="100" cy="27" rx="86" ry="21.5" />
          </svg>
        </div>

        <div className="fav__dishes">
          {FAVOURITES.map((f, n) => (
            <div
              key={f.id}
              ref={(el) => {
                items.current[n] = el;
              }}
              className="fav__dish"
            >
              <span className="fav__shadow" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element -- moved and scaled every frame by the engine */}
              <img src={f.img} alt={f.name} draggable={false} decoding="async" loading={n < 2 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>

        {/* the dish in front, in words */}
        <div className="fav__copy" aria-live="polite">
          <h3 className="fav__name">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={fav.id} className="fav__name-in" variants={words} initial="initial" animate="enter" exit="exit">
                {fav.name.split(" ").map((w, i) => (
                  <span key={i} className="fav__word">
                    <motion.span variants={word}>{w}</motion.span>
                  </span>
                ))}
              </motion.span>
            </AnimatePresence>
          </h3>
          <div className="fav__detail">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={fav.id} variants={detail} initial="initial" animate="enter" exit="exit">
                <p className="fav__line">{fav.line}</p>
                <div className="fav__buy">
                  <span className="fav__price">{rupees(fav.price)}</span>
                  <AddToCart className="fav__order" id={fav.id} name={fav.name} price={fav.price} img={fav.img} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* the counter: every favourite at a glance, and a way to jump to one */}
        <div className="fav__rail">
          <button type="button" className="fav__arrow" aria-label="Previous favourite" onClick={() => handle.current?.step(-1)} disabled={active === 0}>
            <ArrowLeft size={18} />
          </button>
          <ul aria-label="Choose a favourite">
            {FAVOURITES.map((f, n) => (
              <li key={f.id}>
                <button
                  type="button"
                  className="fav__card"
                  aria-pressed={n === active}
                  aria-label={`${f.name}, ${rupees(f.price)}`}
                  onClick={() => handle.current?.goTo(n)}
                  style={{ ["--c-soft" as string]: f.soft, ["--c-deep" as string]: f.deep }}
                >
                  {n === active && (
                    <motion.span
                      layoutId="fav-active"
                      className="fav__card-active"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="fav__thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element -- small decorative thumbnail */}
                    <img src={f.img} alt="" loading="lazy" />
                  </span>
                  <span className="fav__card-text">
                    <b>{f.name}</b>
                    <small>{rupees(f.price)}</small>
                  </span>
                  <span className="fav__plus" aria-hidden="true">
                    <Plus size={13} weight="bold" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="fav__arrow" aria-label="Next favourite" onClick={() => handle.current?.step(1)} disabled={active === FAVOURITES.length - 1}>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
