/**
 * Customer favourites. Each dish carries its own colours; the section re-tints
 * between them as the tray turns (bg: stage, soft: glow and thumbnails,
 * deep: the name and button, ink: body text).
 *
 * Prices are placeholders in rupees. TODO(owner): set real prices.
 */
export type Favourite = {
  id: string;
  name: string;
  line: string;
  price: number;
  img: string;
  /** image width / height */
  ar: number;
  /** how tall it stands on the tray relative to a drink (drinks = 1) */
  size: number;
  bg: string;
  soft: string;
  deep: string;
  ink: string;
};

export const FAVOURITES: Favourite[] = [
  {
    // leads the chapter: its cream and cocoa continue the hero, so the colour change starts gently
    id: "chocolate-frappe",
    name: "Chocolate Frappé",
    line: "Dark cocoa blended thick with cold milk and ice, whipped cream and a slow chocolate drizzle.",
    price: 239,
    img: "/images/menu/chocolate-frappe.webp",
    ar: 540 / 959,
    size: 1,
    bg: "#f0dfca",
    soft: "#fbf2e7",
    deep: "#6e4024",
    ink: "#2e190c",
  },
  {
    id: "taro-boba",
    name: "Taro Boba",
    line: "Creamy taro milk over brown-sugar pearls. Dreamy, nutty, a little vanilla.",
    price: 229,
    img: "/images/menu/taro-boba.webp",
    ar: 564 / 1000,
    size: 1,
    bg: "#e9dcef",
    soft: "#f6effa",
    deep: "#6b4a8c",
    ink: "#2d1d3d",
  },
  {
    id: "basque-cheesecake",
    name: "Basque Cheesecake",
    line: "Burnt on top, barely set in the middle, with a spoon of berry compote.",
    price: 249,
    img: "/images/menu/basque-cheesecake.webp",
    ar: 1076 / 1200,
    size: 0.78,
    bg: "#f1dcc3",
    soft: "#fbf1e6",
    deep: "#94542b",
    ink: "#3a1f10",
  },
  {
    id: "loaded-fries",
    name: "Chicken Loaded Fries",
    line: "Crisp fries under pulled chicken, cheese sauce, smoky mayo and spring onion.",
    price: 279,
    img: "/images/menu/loaded-fries.webp",
    ar: 1000 / 521,
    size: 0.52,
    bg: "#f3dca7",
    soft: "#fcf1d6",
    deep: "#a4591a",
    ink: "#3d2208",
  },
  {
    id: "matcha-latte",
    name: "Iced Matcha Latte",
    line: "Stone-ground matcha whisked over cold milk and ice, with a matcha cream cap.",
    price: 259,
    img: "/images/menu/matcha-latte.webp",
    ar: 573 / 1000,
    size: 1,
    bg: "#dde8cb",
    soft: "#f0f6e6",
    deep: "#4d7a2e",
    ink: "#1d3212",
  },
  {
    id: "cinnamon-roll",
    name: "Cinnamon Roll",
    line: "Soft, warm and rolled with brown butter and cinnamon. Best eaten right away.",
    price: 179,
    img: "/images/menu/cinnamon-roll.webp",
    ar: 954 / 1000,
    size: 0.66,
    bg: "#efd5b8",
    soft: "#faeee1",
    deep: "#8a4a22",
    ink: "#381c0c",
  },
];

export const rupees = (n: number) => `₹${n}`;
