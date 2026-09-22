"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { ArrowRight, Heart, MapPin } from "@phosphor-icons/react";
import { SITE } from "@/data/site";
import { startHero } from "./heroEngine";
import "./hero.css";

/**
 * Planes, back to front:
 *   blob (caramel backdrop)  ->  back pearls  ->  cup photo  ->  badge  ->  copy  ->  front pearls
 * The copy sits between the two pearl layers, so pearls pass both behind and in front of it.
 */
export default function Hero() {
  const stage = useRef<HTMLElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const blob = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const { hero } = SITE;

  useEffect(() => {
    if (!stage.current || !art.current || !plate.current || !copy.current || !blob.current || !back.current || !front.current) return;
    return startHero(
      {
        stage: stage.current,
        art: art.current,
        plate: plate.current,
        copy: copy.current,
        blob: blob.current,
        badge: badge.current,
        back: back.current,
        front: front.current,
      },
      { reduced: !!reduced },
    );
  }, [reduced]);

  return (
    <section ref={stage} className="hero" aria-labelledby="hero-title">
      {/* caramel backdrop: the shape the cup stands in front of */}
      <div ref={blob} className="hero__blob" aria-hidden="true">
        <svg className="hero__blob-shape" viewBox="0 0 700 1000" preserveAspectRatio="none">
          <defs>
            <linearGradient id="blob-fill" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0" stopColor="#d7ab80" />
              <stop offset="0.55" stopColor="#c48f62" />
              <stop offset="1" stopColor="#a86f47" />
            </linearGradient>
            <radialGradient id="blob-light" cx="0.35" cy="0.3" r="0.6">
              <stop offset="0" stopColor="#f3dcc0" stopOpacity="0.55" />
              <stop offset="1" stopColor="#f3dcc0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            className="hero__blob-path"
            d="M700 0H292C214 38 170 118 214 214C262 318 330 348 300 456C268 572 142 600 132 724C122 852 226 928 268 1000H700Z"
          />
          <path d="M700 0H292C214 38 170 118 214 214C262 318 330 348 300 456C268 572 142 600 132 724C122 852 226 928 268 1000H700Z" fill="url(#blob-light)" />
        </svg>
        {/* two cream pen lines on the caramel, drawn in on load */}
        <svg className="hero__doodles" viewBox="0 0 400 600" fill="none" aria-hidden="true">
          <path pathLength={1} className="draw d1" d="M300 470c-30 20-70 24-86 4-14-18 4-44 28-36 22 8 14 42-12 52-40 16-86-10-104-44" />
        </svg>
      </div>

      <canvas ref={back} className="hero__pearls hero__pearls--back" aria-hidden="true" />

      <div ref={art} className="hero__art">
        <div ref={plate} className="hero__plate">
          <div className="hero__plate-in">
            <Image
              src="/images/hero/hero-cup.webp"
              alt="A Pearls & Pastry brown-sugar boba in a milk splash, with a cinnamon roll, cheesecake and a strawberry"
              width={1948}
              height={1536}
              priority
              sizes="(max-width: 899px) 118vw, 62vw"
            />
          </div>
        </div>
      </div>

      {SITE.hero.badge && (
        <div ref={badge} className="hero__badge" aria-hidden="true">
          <div className="hero__badge-in">
            <svg className="hero__badge-ring" viewBox="0 0 120 120">
              <defs>
                <path id="badge-circle" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" />
              </defs>
              <text>
                <textPath href="#badge-circle" textLength="282" lengthAdjust="spacing">
                  {hero.badge.toUpperCase()}
                </textPath>
              </text>
            </svg>
            <Heart className="hero__badge-heart" size={22} weight="fill" />
          </div>
        </div>
      )}

      <div ref={copy} className="hero__copy">
        <p className="hero__eyebrow">
          {hero.eyebrow} <Heart size={14} weight="fill" aria-hidden="true" />
        </p>

        <h1 id="hero-title" className="hero__title">
          {hero.lines.map((line, i) => (
            <span key={line} className="hero__line" style={{ ["--i" as string]: i }}>
              <span>{line}</span>
            </span>
          ))}
          <svg className="hero__spark" viewBox="0 0 40 40" aria-hidden="true">
            <path pathLength={1} className="draw" d="M20 4C21 15 25 19 36 20C25 21 21 25 20 36C19 25 15 21 4 20C15 19 19 15 20 4Z" />
          </svg>
        </h1>

        <ul className="hero__cats" aria-label="On the menu">
          {hero.categories.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <div className="hero__ctas">
          <a className="btn btn--solid" href="#menu">
            <span>Explore menu</span>
            <i aria-hidden="true">
              <ArrowRight size={16} weight="bold" />
            </i>
          </a>
          <a className="btn btn--line" href={SITE.mapLink}>
            <span>Visit us</span>
            <MapPin size={17} aria-hidden="true" />
          </a>
        </div>
      </div>

      <canvas ref={front} className="hero__pearls hero__pearls--front" aria-hidden="true" />
    </section>
  );
}
