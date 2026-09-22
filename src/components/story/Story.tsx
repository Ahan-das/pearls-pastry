"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { SITE } from "@/data/site";
import "./story.css";

/**
 * More Than A Café.
 * Left: the three "some days" lines light up one by one as they cross the
 * middle of the screen (native CSS scroll-driven animation, no JS).
 * Right: a polaroid of the regulars on top of a small product print. The pair
 * drifts at two speeds as you scroll (Motion useScroll), and the polaroid tips
 * toward the cursor like a photo you could pick up (spring-smoothed motion values).
 */
export default function Story() {
  const { story } = SITE;
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: root, offset: ["start end", "end start"] });
  const yFront = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [70, -70]);
  const yBack = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [130, -40]);
  const spinBack = useTransform(scrollYProgress, [0, 1], reduced ? [7, 7] : [12, 3]);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 140, damping: 18 });
  const sy = useSpring(ry, { stiffness: 140, damping: 18 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <section ref={root} id="story" className="story" aria-labelledby="story-title">
      <div className="story__grid">
        <div className="story__words">
          <h2 id="story-title" className="story__title">
            {story.title}
          </h2>
          <ul className="story__days">
            {story.days.map((d) => (
              <li key={d.word}>
                {d.lead} <em>{d.word}</em>
              </li>
            ))}
          </ul>
          <p className="story__body">{story.body}</p>
        </div>

        <div className="story__photos" onPointerMove={onMove} onPointerLeave={onLeave}>
          <motion.figure className="story__print" style={{ y: yBack, rotate: spinBack }} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative photo print */}
            <img src="/images/story/signature-cup.webp" alt="" width={1080} height={1350} loading="lazy" />
          </motion.figure>

          <motion.figure className="story__polaroid" style={{ y: yFront, rotateX: sx, rotateY: sy }}>
            <span className="story__tape" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element -- art-directed crop */}
            <img
              src="/images/story/friends.webp"
              alt="Three friends laughing together over drinks at a café table"
              width={920}
              height={736}
              loading="lazy"
            />
            <figcaption>{story.caption}</figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
