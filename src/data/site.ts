/**
 * Everything a café owner would want to change lives here.
 * TODO(owner): replace the WhatsApp number and map link with the real ones.
 */
export const SITE = {
  name: "Pearls & Pastry",
  whatsapp: "https://wa.me/910000000000?text=Hi%20Pearls%20%26%20Pastry%2C%20I%27d%20like%20to%20order",
  mapLink: "/#visit",
  // TODO(owner): point this at a full menu page or PDF once there is one
  menuUrl: "/#menu",
  // absolute ("/#menu") so the same links work from the cart page too
  nav: [
    { label: "Home", href: "/#top" },
    { label: "Menu", href: "/#menu" },
    { label: "Our Story", href: "/#story" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Visit Us", href: "/#visit" },
  ],
  hero: {
    eyebrow: "Serving",
    lines: ["Hugs", "In A Cup"],
    categories: ["Pastries", "Boba", "Juice", "Good meals"],
    badge: "Made with love · Served daily · ",
  },
  story: {
    title: "More Than A Café.",
    days: [
      { lead: "Some days call for", word: "cake." },
      { lead: "Some days call for", word: "boba." },
      { lead: "Some days call for", word: "both." },
    ],
    body: "A small counter of boba, bakes and good meals, made fresh every morning for friends who like to stay a while.",
    caption: "Hugs, served daily",
  },
  // TODO(owner): real address, map link, hours and Instagram handle
  visit: {
    address: ["Pearls & Pastry", "12 Example Road, Your Area", "Your City 400001"],
    mapsUrl: "https://maps.google.com/?q=Pearls+%26+Pastry",
    instagram: "https://instagram.com/",
    /** 24h clock, local café time (IST) */
    hours: [
      { days: "Monday to Friday", open: "11:00", close: "22:30" },
      { days: "Saturday and Sunday", open: "10:00", close: "23:30" },
    ],
  },
} as const;
