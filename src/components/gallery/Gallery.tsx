import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { SITE } from "@/data/site";
import "./gallery.css";

/**
 * The counter, on a slow belt. A CSS-only marquee (the one marquee on the
 * page): the strip is rendered twice and slides by exactly one copy, so it
 * loops without a seam. Pauses on hover and focus; under reduced motion it
 * becomes a plain row you can swipe.
 */
const TILES = [
  { src: "/images/hero/hero-cup.webp", alt: "Brown-sugar boba in a milk splash", tone: "#f3e3cf", shape: "wide", fit: "cover" },
  { src: "/images/menu/matcha-latte.webp", alt: "Iced matcha latte", tone: "#e4eed6", shape: "tall" },
  { src: "/images/menu/basque-cheesecake.webp", alt: "Slice of Basque cheesecake with berries", tone: "#f6e7d3", shape: "square" },
  { src: "/images/story/friends.webp", alt: "Friends laughing at a café table", tone: "#e9d3bb", shape: "wide", fit: "cover" },
  { src: "/images/menu/taro-boba.webp", alt: "Taro boba", tone: "#efe5f4", shape: "tall" },
  { src: "/images/menu/loaded-fries.webp", alt: "Chicken loaded fries", tone: "#f7e6bd", shape: "square" },
  { src: "/images/menu/cinnamon-roll.webp", alt: "Cinnamon roll", tone: "#f5e1cb", shape: "square" },
  { src: "/images/menu/chocolate-frappe.webp", alt: "Chocolate frappé", tone: "#f1e0cc", shape: "tall" },
] as const;

export default function Gallery() {
  const strip = (hidden: boolean) => (
    <ul className="gal__strip" aria-hidden={hidden || undefined}>
      {TILES.map((t) => (
        <li key={t.src + hidden} className={`gal__tile gal__tile--${t.shape}`} style={{ background: t.tone }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- strip thumbnails, sized by CSS */}
          <img src={t.src} alt={hidden ? "" : t.alt} loading="lazy" data-fit={"fit" in t ? t.fit : "contain"} />
        </li>
      ))}
    </ul>
  );

  return (
    <section id="gallery" className="gal" aria-labelledby="gal-title">
      <div className="gal__head">
        <h2 id="gal-title">Fresh from the counter</h2>
        <a className="gal__ig" href={SITE.visit.instagram} target="_blank" rel="noreferrer">
          <InstagramLogo size={18} aria-hidden="true" /> Follow along
        </a>
      </div>
      <div className="gal__belt" tabIndex={0} aria-label="Photos from the counter">
        <div className="gal__track">
          {strip(false)}
          {strip(true)}
        </div>
      </div>
    </section>
  );
}
