/**
 * The hero's one frame loop.
 *
 * Everything that moves continuously (scroll depth, pointer parallax, the
 * pearl physics, the lamp) is written here as direct transforms, once per
 * frame, instead of through React state or dozens of motion values. The loop
 * only runs while the hero is on screen and stops entirely under reduced motion.
 *
 * Signature move: the cursor is the lamp. Every pearl's glint turns toward it,
 * pearls drift out of its way, and a click knocks the nearby ones loose.
 */
import { PearlLayer, type PearlSprite } from "@/lib/pearls/renderer";
import { PEARLS } from "./pearls";

export type HeroRefs = {
  stage: HTMLElement;
  art: HTMLElement;      // untransformed box of the cup photo (measured)
  plate: HTMLElement;    // transformed wrapper of the photo
  copy: HTMLElement;
  blob: HTMLElement;
  badge: HTMLElement | null;
  back: HTMLCanvasElement;
  front: HTMLCanvasElement;
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutBack = (x: number) => {
  const c1 = 1.4, c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
};
const PHOTO_AR = 768 / 974; // height / width of the cup photo

type Body = {
  spec: (typeof PEARLS)[number];
  seed: number;
  delay: number;
  ox: number; oy: number; vx: number; vy: number;
  sprite: PearlSprite;
};

export function startHero(refs: HeroRefs, opts: { reduced: boolean }) {
  const { stage, art, plate, copy, blob, badge, back, front } = refs;
  const reduced = opts.reduced;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  let layers: { back: PearlLayer; front: PearlLayer } | null = null;
  if (PearlLayer.supported()) {
    try {
      layers = { back: new PearlLayer(back, 32), front: new PearlLayer(front, 32) };
    } catch {
      layers = null;
    }
  }
  if (!layers) {
    back.style.display = front.style.display = "none";
  }

  const bodies: Body[] = PEARLS.map((spec, i) => {
    const seed = ((i * 0.6180339) % 1) + 0.013;
    return {
      spec,
      seed,
      delay: 0.55 + (spec.layer === "back" ? 0 : 0.18) + ((i * 7) % 11) * 0.045,
      ox: 0, oy: 0, vx: 0, vy: 0,
      sprite: { x: 0, y: 0, r: 0, blur: spec.blur, kind: spec.kind, seed, alpha: 0, spin: seed * 6 },
    };
  });
  const backSprites: PearlSprite[] = [];
  const frontSprites: PearlSprite[] = [];

  // ---- geometry ----
  let W = 1, H = 1, wide = true;
  const photo = { x: 0, y: 0, w: 1, h: 1 };
  const measure = () => {
    const s = stage.getBoundingClientRect();
    const a = art.getBoundingClientRect();
    W = s.width;
    H = s.height;
    wide = W >= 900;
    photo.x = a.left - s.left;
    photo.y = a.top - s.top;
    photo.w = a.width;
    photo.h = a.width * PHOTO_AR;
    layers?.back.resize(W, H);
    layers?.front.resize(W, H);
  };

  // ---- input ----
  const ptr = { tx: 0, ty: 0, x: 0, y: 0, px: -9999, py: -9999, inside: false };
  const lamp = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const s = stage.getBoundingClientRect();
    ptr.px = e.clientX - s.left;
    ptr.py = e.clientY - s.top;
    ptr.tx = (ptr.px / W) * 2 - 1;
    ptr.ty = (ptr.py / H) * 2 - 1;
    ptr.inside = true;
    kick();
  };
  const onLeave = () => {
    ptr.inside = false;
    ptr.tx = ptr.ty = 0;
    ptr.px = ptr.py = -9999;
  };
  const onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    const s = stage.getBoundingClientRect();
    const cx = e.clientX - s.left, cy = e.clientY - s.top;
    for (const b of bodies) {
      const dx = b.sprite.x - cx, dy = b.sprite.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const reach = 300;
      if (d > reach) continue;
      const f = (1 - d / reach) * 1100 * (0.6 + b.spec.depth * 0.6);
      b.vx += (dx / d) * f;
      b.vy += (dy / d) * f - 120;
    }
    kick();
  };

  // ---- loop ----
  let raf = 0, visible = true, disposed = false;
  const t0 = performance.now();
  let last = t0;

  const frame = (now: number) => {
    raf = 0;
    if (disposed) return;
    const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
    last = now;
    const t = reduced ? 10 : (now - t0) / 1000;
    const k = (rate: number) => (reduced ? 1 : 1 - Math.exp(-rate * dt));

    // how far the hero has scrolled away (px), and as 0..1
    const top = stage.getBoundingClientRect().top;
    const s = reduced ? 0 : Math.max(0, -top); // reduced motion: planes stay put
    const p = clamp(s / Math.max(1, H));

    ptr.x = lerp(ptr.x, ptr.tx, k(3.5));
    ptr.y = lerp(ptr.y, ptr.ty, k(3.5));

    // ---- DOM planes: each moves at its own rate, so depth reads without a word ----
    const px = reduced ? 0 : ptr.x, py = reduced ? 0 : ptr.y;
    blob.style.transform = `translate3d(${(px * -8).toFixed(2)}px, ${(s * 0.32 + py * -6).toFixed(2)}px, 0)`;
    plate.style.transform =
      `translate3d(${(px * 14).toFixed(2)}px, ${(s * 0.14 + py * 8).toFixed(2)}px, 0) ` +
      `rotateY(${(px * 3.2).toFixed(3)}deg) rotateX(${(-py * 2.4).toFixed(3)}deg) scale(${(1 - p * 0.05).toFixed(4)})`;
    copy.style.transform = `translate3d(0, ${(s * 0.22).toFixed(2)}px, 0)`;
    copy.style.opacity = (1 - clamp((p - 0.22) / 0.4)).toFixed(3);
    if (badge) badge.style.transform = `translate3d(${(px * -12).toFixed(2)}px, ${(s * 0.05 + py * -10).toFixed(2)}px, 0) rotate(${(s * 0.18).toFixed(2)}deg)`;

    // ---- lamp: follows the cursor; with no cursor it drifts slowly over the cup ----
    const autoX = photo.x + photo.w * (0.38 + Math.sin(t * 0.35) * 0.22);
    const autoY = photo.y + photo.h * (0.18 + Math.sin(t * 0.7) * 0.1);
    const wantX = finePointer && ptr.inside ? ptr.px : autoX;
    const wantY = finePointer && ptr.inside ? ptr.py : autoY;
    lamp.x = lerp(lamp.x || wantX, wantX, k(6));
    lamp.y = lerp(lamp.y || wantY, wantY, k(6));

    // ---- pearls ----
    backSprites.length = 0;
    frontSprites.length = 0;
    const scale = photo.w;
    for (const b of bodies) {
      const sp = b.spec;
      if (!wide && sp.wideOnly) continue;
      const hx = photo.x + sp.x * photo.w;
      const hy = photo.y + sp.y * photo.h;
      const depth = sp.depth;

      // spring back home, pushed out of the cursor's way
      if (!reduced) {
        let fx = -b.ox * 34 - b.vx * 7.5;
        let fy = -b.oy * 34 - b.vy * 7.5;
        if (finePointer && ptr.inside) {
          const dx = b.sprite.x - ptr.px, dy = b.sprite.y - ptr.py;
          const d = Math.hypot(dx, dy) || 1;
          const reach = 150 + sp.r * scale * 2;
          if (d < reach) {
            const f = (1 - d / reach) ** 2 * 5200 * (0.5 + depth * 0.7);
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
        }
        b.vx += fx * dt;
        b.vy += fy * dt;
        b.ox += b.vx * dt;
        b.oy += b.vy * dt;
      }

      // intro: each one drops in with a small overshoot
      const it = reduced ? 1 : clamp((t - b.delay) / 0.95);
      const drop = (1 - easeOutBack(it)) * -70 * (0.4 + depth);

      // scroll: far pearls lag the page, near ones rush past it
      const scrollY = s * (depth < 0.3 ? 0.3 : depth < 0.7 ? 0.05 : -0.55);
      const parX = px * (6 + depth * 34);
      const parY = py * (4 + depth * 22);
      const bobX = reduced ? 0 : Math.cos(t * 0.8 + b.seed * 9) * 2.5 * (0.4 + depth);
      const bobY = reduced ? 0 : Math.sin(t * 1.05 + b.seed * 7) * 4 * (0.4 + depth);

      const spr = b.sprite;
      spr.x = hx + b.ox + parX + bobX;
      spr.y = hy + b.oy + parY + bobY + scrollY + drop;
      spr.r = sp.r * scale;
      spr.alpha = clamp(it * 2.2);
      spr.spin = b.seed * 6 + (reduced ? 0 : t * 0.25 * (b.seed - 0.5));
      (sp.layer === "back" ? backSprites : frontSprites).push(spr);
    }

    if (layers) {
      const lampPos = { x: lamp.x, y: lamp.y, z: 420 };
      const fade = 1 - clamp((p - 0.55) / 0.4);
      layers.back.draw(backSprites, lampPos, fade);
      layers.front.draw(frontSprites, lampPos, fade);
    }

    if (visible && !reduced) raf = requestAnimationFrame(frame);
  };

  function kick() {
    if (raf || disposed) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
  });
  io.observe(stage);
  const ro = new ResizeObserver(() => {
    measure();
    kick();
  });
  ro.observe(stage);
  ro.observe(art);

  stage.addEventListener("pointermove", onMove, { passive: true });
  stage.addEventListener("pointerleave", onLeave);
  if (finePointer && !reduced) stage.addEventListener("pointerdown", onDown);

  measure();
  kick();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerleave", onLeave);
    stage.removeEventListener("pointerdown", onDown);
    layers?.back.destroy();
    layers?.front.destroy();
  };
}
