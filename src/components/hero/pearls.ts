/**
 * Where the extra pearls and crumbs float, in "plate space": x is a fraction of
 * the cup photo's width, y a fraction of its height, r a fraction of its width.
 * Values outside 0..1 reach past the photo toward the headline or page edge.
 * Anchoring to the photo means the scatter stays wrapped around the cup at
 * every screen size without a second layout.
 *
 * depth: 0 = far (moves least), 1 = nearest (moves most, defocused).
 */
export type PearlSpec = {
  x: number;
  y: number;
  r: number;
  blur: number;
  depth: number;
  layer: "back" | "front";
  kind: 0 | 1;
  /** hide on narrow screens, where the scatter would crowd the copy */
  wideOnly?: boolean;
};

const P = (x: number, y: number, r: number, blur: number, depth: number, layer: "back" | "front", wideOnly = false): PearlSpec => ({ x, y, r, blur, depth, layer, kind: 0, wideOnly });
const C = (x: number, y: number, r: number, depth: number, wideOnly = false): PearlSpec => ({ x, y, r, blur: 0.05, depth, layer: "front", kind: 1, wideOnly });

export const PEARLS: PearlSpec[] = [
  // far, small, a little soft: the air behind the cup
  P(0.06, 0.08, 0.010, 0.35, 0.15, "back"),
  P(1.03, 0.31, 0.010, 0.4, 0.15, "back"),
  P(0.99, 0.66, 0.013, 0.3, 0.2, "back"),
  P(0.11, 0.56, 0.010, 0.3, 0.2, "back"),
  P(0.6, -0.05, 0.008, 0.45, 0.1, "back"),
  P(-0.3, 0.06, 0.008, 0.5, 0.1, "back", true),
  P(-0.55, 0.97, 0.009, 0.5, 0.1, "back", true),
  P(-0.08, 0.84, 0.011, 0.35, 0.2, "back"),

  // sharp, mid-distance: sit with the photo's own pearls
  P(0.25, 0.41, 0.016, 0, 0.5, "front"),
  P(0.79, 0.21, 0.014, 0, 0.5, "front"),
  P(0.91, 0.92, 0.019, 0, 0.55, "front"),
  P(0.02, 0.27, 0.018, 0.02, 0.55, "front"),

  // close to the lens: big and out of focus
  P(-0.14, 0.0, 0.034, 0.72, 1, "front", true),
  P(1.01, 1.04, 0.05, 0.8, 1, "front"),
  P(0.37, 1.07, 0.027, 0.66, 0.95, "front"),

  // brown-sugar crumbs knocked off the roll
  C(0.03, 0.63, 0.006, 0.45),
  C(0.16, 0.33, 0.005, 0.45),
  C(0.74, 0.35, 0.006, 0.5),
  C(0.93, 0.17, 0.005, 0.45),
  C(0.57, 0.99, 0.007, 0.55),
  C(-0.11, 0.49, 0.005, 0.4, true),
  C(0.44, 0.02, 0.004, 0.4),
];
