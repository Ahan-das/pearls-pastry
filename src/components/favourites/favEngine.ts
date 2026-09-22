/**
 * Customer Favourites: a lazy-susan tray.
 *
 * Two ways to turn it, chosen by the pointer:
 *
 * - Mouse and trackpad: the section is pinned and the page scroll turns the
 *   tray one dish at a time (step-snapped, shared with lib/scrollSnap).
 * - Touch: the section is an ordinary one-screen section that scrolls past
 *   like any other, and the tray turns ONLY by dragging it, tapping a card or
 *   using the arrows. Tying it to scroll as well made the page fight the
 *   finger, because every scroll tried to settle on a dish.
 *
 * Either way the next dish swings round from the back, grows as it comes
 * forward and parks at the front edge; the one you just saw swings away behind.
 * Depth comes from the circle itself: size, softness and stacking all follow
 * each dish's place on the rim.
 *
 * Colour follows the dish in front, blended in OKLab (lib/palette) and written
 * to --m-* on the section, so the ground, glow, name and button change together.
 */
import { createSnap } from "@/lib/scrollSnap";
import { mixPalettes, type Palette } from "@/lib/palette";

export type FavRefs = {
  root: HTMLElement;
  stage: HTMLElement;
  tray: HTMLElement;
  ring: SVGEllipseElement | null;
  glow: HTMLElement;
  items: HTMLElement[];
};

export type FavHandle = { destroy: () => void; goTo: (i: number, dur?: number) => void; step: (dir: number) => void };

type Item = { ar: number; size: number };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function startFav(
  refs: FavRefs,
  opts: { palettes: Palette[]; dims: Item[]; reduced: boolean; onIndex: (i: number) => void },
): FavHandle {
  const { root, stage, tray, ring, glow, items } = refs;
  const N = items.length;
  const STEP = (Math.PI * 2) / N;
  const reduced = opts.reduced;
  const mixInto = mixPalettes(opts.palettes);

  let raf = 0, disposed = false, visible = false;
  let last = performance.now();
  const t0 = last;
  let prog = 0, progTarget = 0, current = -1;
  const ptr = { tx: 0, ty: 0, x: 0, y: 0 };
  /** touch screens turn the tray by hand only; the page scroll is left alone */
  const manual = window.matchMedia("(pointer: coarse)").matches;
  // touch screens: the first time the tray is reached it gives a small wiggle,
  // so it reads as something you can turn by hand
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  let nudgeAt = coarse && !reduced ? -1 : Infinity;

  // geometry, recomputed on resize
  let W = 1, H = 1, phone = false;
  let cx = 0, cy = 0, R = 1, tilt = 0.3, frontH = 1;
  const box = items.map(() => ({ w: 1, h: 1 }));
  const measure = () => {
    const r = stage.getBoundingClientRect();
    W = r.width;
    H = r.height;
    phone = W < 900;
    if (phone) {
      cx = W * 0.5;
      cy = H * 0.5;
      R = Math.min(W * 0.36, H * 0.24);
      tilt = 0.3;
      frontH = Math.min(H * 0.3, W * 0.62);
    } else {
      cx = W * 0.69;
      cy = H * 0.63;
      R = Math.min(W * 0.205, H * 0.46);
      tilt = 0.27;
      frontH = H * 0.44;
    }
    // base (unscaled) box of each dish; the loop only scales and moves it
    items.forEach((el, i) => {
      const d = opts.dims[i];
      const h = frontH * d.size;
      box[i] = { w: h * d.ar, h };
      el.style.width = `${(h * d.ar).toFixed(1)}px`;
      el.style.height = `${h.toFixed(1)}px`;
    });
    const tw = R * 2 * 1.18, th = R * 2 * tilt * 1.18;
    tray.style.width = `${tw.toFixed(1)}px`;
    tray.style.height = `${(th + 26).toFixed(1)}px`;
    tray.style.left = `${(cx - tw / 2).toFixed(1)}px`;
    tray.style.top = `${(cy - th / 2).toFixed(1)}px`;
    const gs = R * 2.3;
    glow.style.width = glow.style.height = `${gs.toFixed(1)}px`;
    glow.style.left = `${(cx - gs / 2).toFixed(1)}px`;
    glow.style.top = `${(cy - gs * 0.62).toFixed(1)}px`;
  };

  const readScroll = () => {
    if (manual) return; // the tray's position is the visitor's, not the scrollbar's
    const r = root.getBoundingClientRect();
    const travel = Math.max(1, r.height - window.innerHeight);
    progTarget = clamp(-r.top / travel);
  };

  const toProg = (i: number) => clamp(i / (N - 1));
  const posNow = () => prog * (N - 1);

  // progress -> tray position, with a soft rest at every dish
  const toPos = (p: number) => {
    const f = p * (N - 1);
    const i = Math.min(N - 2, Math.floor(f));
    return i + smooth(0.05, 0.95, f - i);
  };

  const frame = (now: number) => {
    raf = 0;
    if (disposed) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    const t = (now - t0) / 1000;
    const k = (rate: number) => (reduced ? 1 : 1 - Math.exp(-rate * dt));
    prog = lerp(prog, progTarget, k(10));
    ptr.x = lerp(ptr.x, ptr.tx, k(4));
    ptr.y = lerp(ptr.y, ptr.ty, k(4));
    const pos = manual ? prog * (N - 1) : toPos(prog);

    mixInto(root.style, pos);
    const idx = Math.round(pos);
    if (idx !== current) {
      current = idx;
      opts.onIndex(idx);
    }

    if (nudgeAt === -1 && prog < 0.02) {
      const top = root.getBoundingClientRect().top;
      const arrived = manual ? top < window.innerHeight * 0.35 && top > -window.innerHeight * 0.5 : Math.abs(top) < 2;
      if (arrived) nudgeAt = t;
    }
    const nt = t - nudgeAt;
    const nudge = nt > 0 && nt < 2.4 ? Math.sin(nt * Math.PI * 1.6) * Math.exp(-nt * 1.9) * 0.2 : 0;
    const turn = pos + nudge;

    const px = reduced ? 0 : ptr.x, py = reduced ? 0 : ptr.y;
    const ox = px * 12, oy = py * 6;

    // the dotted ring on the tray travels with the turn
    if (ring) ring.style.strokeDashoffset = (turn * 38).toFixed(2);
    tray.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0)`;
    glow.style.transform = `translate3d(${(ox * 0.5).toFixed(1)}px, ${(oy * 0.5).toFixed(1)}px, 0) scale(${(1 + Math.sin(t * 0.6) * (reduced ? 0 : 0.012)).toFixed(4)})`;

    for (let i = 0; i < N; i++) {
      const el = items[i];
      const th = (i - turn) * STEP;
      const s = Math.sin(th), c = Math.cos(th); // c: 1 front, -1 back
      const near = (c + 1) / 2;
      const x = cx + ox + s * R * (phone ? 1.05 : 1);
      const y = cy + oy + c * R * tilt;
      const scale = lerp(0.3, 1, near ** 2.1);
      const lean = -s * 7 * (1 - near * 0.5); // leans with the curve of the rim
      const bob = reduced ? 0 : Math.sin(t * 1.2 + i * 1.7) * 3 * near;
      const { w, h } = box[i];
      el.style.transform =
        `translate3d(${(x - w / 2).toFixed(1)}px, ${(y - h + bob).toFixed(1)}px, 0) rotate(${lean.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      const blur = (1 - near) * (phone ? 2 : 3.2);
      el.style.filter = blur > 0.25 ? `blur(${blur.toFixed(2)}px) saturate(${(0.7 + near * 0.3).toFixed(3)})` : "none";
      el.style.opacity = lerp(phone ? 0.0 : 0.28, 1, smooth(-0.9, 0.6, c)).toFixed(3);
      el.style.zIndex = String(Math.round(near * 100));
      el.setAttribute("aria-hidden", near > 0.9 ? "false" : "true");
    }

    // dishes stay hidden (CSS) until they have been placed once, so a reload
    // never flashes them at their raw image size in the corner
    if (!("ready" in root.dataset)) root.dataset.ready = "";

    if (visible && !reduced) raf = requestAnimationFrame(frame);
  };

  function kick() {
    if (raf || disposed) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const snap = manual
    ? null
    : createSnap({
        root,
        stage,
        count: N,
        reduced,
        drag: true,
        onProgress: () => {
          readScroll();
          kick();
        },
      });

  const goTo = (i: number) => {
    const target = Math.max(0, Math.min(N - 1, i));
    if (snap) snap.goTo(target);
    else {
      progTarget = toProg(target);
      kick();
    }
  };

  // ---- touch: drag the tray round, 1:1 under the finger ----
  const dragUnit = () => Math.min(300, Math.max(150, stage.clientWidth * 0.42)); // px per dish
  let drag: { x: number; y: number; id: number; pos: number; t: number } | null = null;
  let dragMode: "turn" | "none" | null = null;
  let lastMove = { x: 0, t: 0, v: 0 };

  const onDown = (e: PointerEvent) => {
    if (!manual || (e.target as HTMLElement).closest("a, button, input, textarea, select")) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId, pos: posNow(), t: performance.now() };
    dragMode = null;
    lastMove = { x: e.clientX, t: performance.now(), v: 0 };
  };
  const onMove = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (dragMode === null) {
      if (Math.hypot(dx, dy) < 7) return;
      // a mostly vertical swipe belongs to the page, not the tray
      dragMode = Math.abs(dx) > Math.abs(dy) * 1.1 ? "turn" : "none";
      if (dragMode === "none") {
        drag = null;
        return;
      }
      stage.dataset.dragging = "";
      try { stage.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    }
    progTarget = toProg(drag.pos - dx / dragUnit());
    const now = performance.now();
    lastMove = { x: e.clientX, t: now, v: ((e.clientX - lastMove.x) / Math.max(1, now - lastMove.t)) * 0.6 + lastMove.v * 0.4 };
    kick();
  };
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const turned = dragMode === "turn";
    const from = Math.round(drag.pos);
    const quick = performance.now() - drag.t < 260 && Math.abs(e.clientX - drag.x) > 24;
    drag = null;
    dragMode = null;
    if (!turned) return;
    delete stage.dataset.dragging;
    // land on the nearest dish; a quarter turn or a quick flick carries one further
    const delta = posNow() - from;
    let target = from + Math.sign(delta) * Math.ceil(Math.abs(delta) - 0.25);
    if ((quick || Math.abs(lastMove.v) > 0.35) && target === from) target = from + Math.sign(delta || -lastMove.v);
    goTo(target);
  };

  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = stage.getBoundingClientRect();
    ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ptr.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    kick();
  };
  const onLeave = () => {
    ptr.tx = ptr.ty = 0;
  };

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
  });
  io.observe(root);
  const ro = new ResizeObserver(() => {
    measure();
    readScroll();
    kick();
  });
  ro.observe(stage);
  stage.addEventListener("pointermove", onPointer, { passive: true });
  stage.addEventListener("pointerleave", onLeave);
  if (manual) {
    stage.addEventListener("pointerdown", onDown, { passive: true });
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerup", onUp, { passive: true });
    stage.addEventListener("pointercancel", onUp, { passive: true });
  }

  measure();
  readScroll();
  prog = progTarget;
  kick();

  return {
    destroy() {
      disposed = true;
      cancelAnimationFrame(raf);
      delete root.dataset.ready;
      snap?.destroy();
      io.disconnect();
      ro.disconnect();
      stage.removeEventListener("pointermove", onPointer);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
    },
    goTo: (i, dur) => (snap ? snap.goTo(i, dur) : goTo(i)),
    step: (dir) => {
      if (snap) snap.step(dir);
      else goTo(Math.round(posNow()) + dir);
    },
  };
}
